use actix_web::{web, HttpRequest, HttpResponse};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use rand::Rng;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use uuid::Uuid;

use crate::models::admin::*;
use crate::models::{User, UserResponse};
use crate::AppState;

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

fn extract_admin_id(req: &HttpRequest, secret: &str) -> Option<String> {
    let auth_header = req.headers().get("Authorization")?;
    let token = auth_header.to_str().ok()?.strip_prefix("Bearer ")?;
    let token_data = decode::<crate::models::Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .ok()?;
    Some(token_data.claims.sub)
}

fn create_token(user_id: &str, secret: &str, expires_in: i64) -> String {
    let claims = crate::models::Claims {
        sub: user_id.to_string(),
        exp: (Utc::now().timestamp() + expires_in) as usize,
    };
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .unwrap()
}

async fn log_audit(
    db: &sqlx::SqlitePool,
    admin_id: &str,
    admin_email: &str,
    action: &str,
    target_type: &str,
    target_id: Option<&str>,
    details: Option<&str>,
    ip_address: Option<&str>,
) {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();
    let _ = sqlx::query(
        "INSERT INTO admin_audit_log (id, admin_id, admin_email, action, target_type, target_id, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(admin_id)
    .bind(admin_email)
    .bind(action)
    .bind(target_type)
    .bind(target_id)
    .bind(details)
    .bind(ip_address)
    .bind(now)
    .execute(db)
    .await;
}

fn generate_key_code() -> String {
    let mut rng = rand::thread_rng();
    (0..16)
        .map(|_| {
            let idx = rng.gen_range(0..36);
            if idx < 10 {
                (b'0' + idx) as char
            } else {
                (b'A' + idx - 10) as char
            }
        })
        .collect()
}

fn slugify(text: &str) -> String {
    let lower = text.to_lowercase();
    let slug: String = lower
        .chars()
        .map(|c| {
            if c.is_alphanumeric() || c == ' ' || c == '-' {
                c
            } else {
                ' '
            }
        })
        .collect();
    slug.split_whitespace()
        .collect::<Vec<&str>>()
        .join("-")
}

fn get_ip(req: &HttpRequest) -> Option<String> {
    req.headers()
        .get("X-Forwarded-For")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.split(',').next())
        .map(|v| v.trim().to_string())
        .or_else(|| {
            req.peer_addr()
                .map(|addr| addr.to_string())
        })
}

// ---------------------------------------------------------------------------
// 1. Admin login
// ---------------------------------------------------------------------------

pub async fn admin_login(
    data: web::Data<AppState>,
    body: web::Json<AdminLoginRequest>,
) -> HttpResponse {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = ?")
        .bind(&body.email)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(user)) => {
            if !verify(&body.password, &user.password_hash).unwrap_or(false) {
                return HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "Invalid email or password"
                }));
            }
            if user.role != "admin" && user.role != "super_admin" {
                return HttpResponse::Forbidden().json(serde_json::json!({
                    "error": "Access denied. Admin privileges required."
                }));
            }
            let token = create_token(&user.id, &data.config.jwt_secret, 7200);
            HttpResponse::Ok().json(serde_json::json!({
                "token": token,
                "admin": AdminResponse::from(user),
            }))
        }
        Ok(None) => HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Invalid email or password"
        })),
        Err(e) => {
            log::error!("Admin login error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 2. Admin logout
// ---------------------------------------------------------------------------

pub async fn admin_logout(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> HttpResponse {
    let admin_id = extract_admin_id(&req, &data.config.jwt_secret);
    if let Some(id) = &admin_id {
        log_audit(&data.db, id, "", "logout", "session", None, None, get_ip(&req).as_deref()).await;
    }
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Logged out successfully"
    }))
}

// ---------------------------------------------------------------------------
// 3. Admin me
// ---------------------------------------------------------------------------

pub async fn admin_me(req: HttpRequest, data: web::Data<AppState>) -> HttpResponse {
    let admin_id = match extract_admin_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Unauthorized"
            }))
        }
    };

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(&admin_id)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(u)) => {
            if u.role != "admin" && u.role != "super_admin" {
                return HttpResponse::Forbidden().json(serde_json::json!({
                    "error": "Access denied"
                }));
            }
            HttpResponse::Ok().json(AdminResponse::from(u))
        }
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Admin not found"
        })),
        Err(e) => {
            log::error!("Admin me error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 4. List users
// ---------------------------------------------------------------------------

pub async fn list_users(
    req: HttpRequest,
    data: web::Data<AppState>,
    query: web::Query<ListUsersParams>,
) -> HttpResponse {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = (page - 1) * limit;
    let search = query.search.as_deref().unwrap_or("");
    let role_filter = query.role.as_deref().unwrap_or("");
    let status_filter = query.is_active.as_deref().unwrap_or("");

    let admin_id = match extract_admin_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Unauthorized"
            }))
        }
    };

    let admin_user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(&admin_id)
        .fetch_optional(&data.db)
        .await;

    let admin_role = match admin_user {
        Ok(Some(u)) => u.role,
        _ => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Unauthorized"
            }))
        }
    };

    let mut where_clauses = vec!["1=1".to_string()];
    let mut bind_values: Vec<String> = vec![];

    if !search.is_empty() {
        where_clauses.push("(name LIKE '%' || ?1 || '%' OR email LIKE '%' || ?1 || '%')".to_string());
        bind_values.push(search.to_string());
    }

    if admin_role == "admin" {
        where_clauses.push("role = 'admin'".to_string());
    }

    if !role_filter.is_empty() {
        where_clauses.push("role = ?".to_string());
        bind_values.push(role_filter.to_string());
    }

    if !status_filter.is_empty() {
        where_clauses.push("is_active = ?".to_string());
        bind_values.push(status_filter.to_string());
    }

    let where_sql = where_clauses.join(" AND ");

    let count_query = format!("SELECT COUNT(*) FROM users WHERE {}", where_sql);
    let mut count_stmt = sqlx::query_scalar::<_, i64>(&count_query);
    for v in &bind_values {
        count_stmt = count_stmt.bind(v);
    }
    let total = count_stmt.fetch_one(&data.db).await.unwrap_or(0);

    let data_query = format!(
        "SELECT * FROM users WHERE {} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        where_sql
    );
    let mut data_stmt = sqlx::query_as::<_, User>(&data_query);
    for v in &bind_values {
        data_stmt = data_stmt.bind(v);
    }
    data_stmt = data_stmt.bind(limit as i64).bind(offset as i64);

    let users = data_stmt.fetch_all(&data.db).await;

    match users {
        Ok(users) => HttpResponse::Ok().json(UserListResponse {
            users: users.into_iter().map(UserResponse::from).collect(),
            total,
            page,
            limit,
        }),
        Err(e) => {
            log::error!("List users error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 5. Get user
// ---------------------------------------------------------------------------

pub async fn get_user(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = path.into_inner();
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(u)) => HttpResponse::Ok().json(UserResponse::from(u)),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "User not found"
        })),
        Err(e) => {
            log::error!("Get user error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 6. Update user
// ---------------------------------------------------------------------------

pub async fn update_user(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<UpdateUserRequest>,
) -> HttpResponse {
    let user_id = path.into_inner();
    let now = Utc::now().naive_utc();

    if let Some(admin_id) = extract_admin_id(&req, &data.config.jwt_secret) {
        if admin_id == user_id && body.is_active == Some(false) {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "You cannot deactivate your own account"
            }));
        }
    }

    let result = sqlx::query(
        "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone), school = COALESCE(?, school), target_exam = COALESCE(?, target_exam), target_score = COALESCE(?, target_score), role = COALESCE(?, role), is_active = COALESCE(?, is_active), updated_at = ? WHERE id = ?",
    )
    .bind(&body.name)
    .bind(&body.email)
    .bind(&body.phone)
    .bind(&body.school)
    .bind(&body.target_exam)
    .bind(&body.target_score)
    .bind(&body.role)
    .bind(body.is_active)
    .bind(now)
    .bind(&user_id)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            if let Ok(Some(admin)) = sqlx::query_as::<_, User>("SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
                .fetch_optional(&data.db)
                .await
            {
                log_audit(
                    &data.db,
                    &admin.id,
                    &admin.email,
                    "update_user",
                    "user",
                    Some(&user_id),
                    Some(&serde_json::to_string(&*body).unwrap_or_default()),
                    get_ip(&req).as_deref(),
                )
                .await;
            }
            let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
                .bind(&user_id)
                .fetch_one(&data.db)
                .await
                .unwrap();
            HttpResponse::Ok().json(UserResponse::from(user))
        }
        Err(e) => {
            log::error!("Update user error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to update user"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 7. Delete user (soft)
// ---------------------------------------------------------------------------

pub async fn delete_user(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = path.into_inner();
    let now = Utc::now().naive_utc();

    let result = sqlx::query("UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?")
        .bind(now)
        .bind(&user_id)
        .execute(&data.db)
        .await;

    match result {
        Ok(_) => {
            if let Ok(Some(admin)) = sqlx::query_as::<_, User>("SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
                .fetch_optional(&data.db)
                .await
            {
                log_audit(
                    &data.db,
                    &admin.id,
                    &admin.email,
                    "delete_user",
                    "user",
                    Some(&user_id),
                    None,
                    get_ip(&req).as_deref(),
                )
                .await;
            }
            HttpResponse::Ok().json(serde_json::json!({
                "message": "User deactivated successfully"
            }))
        }
        Err(e) => {
            log::error!("Delete user error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to deactivate user"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 7b. Ban user
// ---------------------------------------------------------------------------

pub async fn ban_user(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<serde_json::Value>,
) -> HttpResponse {
    let user_id = path.into_inner();
    let ban_reason = body.get("reason").and_then(|v| v.as_str()).unwrap_or("No reason provided");
    let now = Utc::now().naive_utc();

    // Prevent banning yourself
    if let Some(admin_id) = extract_admin_id(&req, &data.config.jwt_secret) {
        if admin_id == user_id {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "You cannot ban yourself"
            }));
        }
    }

    let result = sqlx::query(
        "UPDATE users SET is_banned = 1, ban_reason = ?, is_active = 0, updated_at = ? WHERE id = ?",
    )
    .bind(ban_reason)
    .bind(now)
    .bind(&user_id)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            if let Ok(Some(admin)) = sqlx::query_as::<_, User>("SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
                .fetch_optional(&data.db)
                .await
            {
                log_audit(
                    &data.db,
                    &admin.id,
                    &admin.email,
                    "ban_user",
                    "user",
                    Some(&user_id),
                    Some(ban_reason),
                    get_ip(&req).as_deref(),
                )
                .await;
            }
            HttpResponse::Ok().json(serde_json::json!({
                "message": "User banned successfully"
            }))
        }
        Err(e) => {
            log::error!("Ban user error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to ban user"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 7c. Unban user
// ---------------------------------------------------------------------------

pub async fn unban_user(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = path.into_inner();
    let now = Utc::now().naive_utc();

    let result = sqlx::query(
        "UPDATE users SET is_banned = 0, ban_reason = NULL, updated_at = ? WHERE id = ?",
    )
    .bind(now)
    .bind(&user_id)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            if let Ok(Some(admin)) = sqlx::query_as::<_, User>("SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
                .fetch_optional(&data.db)
                .await
            {
                log_audit(
                    &data.db,
                    &admin.id,
                    &admin.email,
                    "unban_user",
                    "user",
                    Some(&user_id),
                    None,
                    get_ip(&req).as_deref(),
                )
                .await;
            }
            HttpResponse::Ok().json(serde_json::json!({
                "message": "User unbanned successfully"
            }))
        }
        Err(e) => {
            log::error!("Unban user error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to unban user"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 8. Resend verification
// ---------------------------------------------------------------------------

pub async fn resend_verification(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = path.into_inner();

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(u)) => {
            log::info!(
                "Resend verification email requested for user {} ({})",
                u.id,
                u.email
            );
            if let Ok(Some(admin)) = sqlx::query_as::<_, User>("SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
                .fetch_optional(&data.db)
                .await
            {
                log_audit(
                    &data.db,
                    &admin.id,
                    &admin.email,
                    "resend_verification",
                    "user",
                    Some(&user_id),
                    None,
                    get_ip(&req).as_deref(),
                )
                .await;
            }
            HttpResponse::Ok().json(serde_json::json!({
                "message": "Verification email queued for sending"
            }))
        }
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "User not found"
        })),
        Err(e) => {
            log::error!("Resend verification error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 9. Admin reset password
// ---------------------------------------------------------------------------

pub async fn admin_reset_password(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = path.into_inner();

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_optional(&data.db)
        .await;

    match user {
        Ok(Some(u)) => {
            let temp_password: String = (0..12)
                .map(|_| {
                    let mut rng = rand::thread_rng();
                    let idx = rng.gen_range(0..62u8);
                    match idx {
                        0..=9 => (b'0' + idx) as char,
                        10..=35 => (b'a' + idx - 10) as char,
                        _ => (b'A' + idx - 36) as char,
                    }
                })
                .collect();

            let password_hash = match hash(&temp_password, DEFAULT_COST) {
                Ok(h) => h,
                Err(_) => {
                    return HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Failed to hash password"
                    }))
                }
            };

            let now = Utc::now().naive_utc();
            let result =
                sqlx::query("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
                    .bind(&password_hash)
                    .bind(now)
                    .bind(&user_id)
                    .execute(&data.db)
                    .await;

            match result {
                Ok(_) => {
                    if let Ok(Some(admin)) = sqlx::query_as::<_, User>("SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
                        .fetch_optional(&data.db)
                        .await
                    {
                        log_audit(
                            &data.db,
                            &admin.id,
                            &admin.email,
                            "reset_password",
                            "user",
                            Some(&user_id),
                            Some(&format!("Password reset for {}", u.email)),
                            get_ip(&req).as_deref(),
                        )
                        .await;
                    }
                    HttpResponse::Ok().json(serde_json::json!({
                        "message": "Password reset successfully",
                        "temp_password": temp_password,
                    }))
                }
                Err(e) => {
                    log::error!("Admin reset password error: {}", e);
                    HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Failed to reset password"
                    }))
                }
            }
        }
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "User not found"
        })),
        Err(e) => {
            log::error!("Admin reset password lookup error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 10. Generate keys
// ---------------------------------------------------------------------------

pub async fn generate_keys(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<GenerateKeysRequest>,
) -> HttpResponse {
    let admin_id = match extract_admin_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Unauthorized"
            }))
        }
    };

    let admin = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(&admin_id)
        .fetch_one(&data.db)
        .await;

    let admin = match admin {
        Ok(a) => a,
        Err(e) => {
            log::error!("Generate keys admin lookup error: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }));
        }
    };

    let count = body.count.unwrap_or(1).min(1000);
    let mut keys = Vec::with_capacity(count as usize);
    let now = Utc::now().naive_utc();
    let expires_at = body
        .expires_at
        .as_deref()
        .and_then(|s| chrono::NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S").ok());

    for _ in 0..count {
        let id = Uuid::new_v4().to_string();
        let key_code = generate_key_code();

        let result = sqlx::query(
            "INSERT INTO activation_keys (id, key_code, exam_type, max_uses, used_count, created_by, created_at, expires_at, is_active) VALUES (?, ?, ?, 1, 0, ?, ?, ?, 1)",
        )
        .bind(&id)
        .bind(&key_code)
        .bind(&body.exam_type)
        .bind(&admin_id)
        .bind(now)
        .bind(expires_at)
        .execute(&data.db)
        .await;

        if let Ok(_) = result {
            keys.push(ActivationKey {
                id,
                key_code,
                exam_type: body.exam_type.clone(),
                max_uses: 1,
                used_count: 0,
                created_by: admin_id.clone(),
                created_at: now,
                expires_at,
                is_active: true,
            });
        }
    }

    log_audit(
        &data.db,
        &admin_id,
        &admin.email,
        "generate_keys",
        "key",
        None,
        Some(&format!("Generated {} keys for {}", count, body.exam_type)),
        get_ip(&req).as_deref(),
    )
    .await;

    HttpResponse::Created().json(serde_json::json!({
        "message": format!("Generated {} activation keys", keys.len()),
        "keys": keys,
    }))
}

// ---------------------------------------------------------------------------
// 11. List keys
// ---------------------------------------------------------------------------

pub async fn list_keys(
    data: web::Data<AppState>,
    query: web::Query<PaginationParams>,
) -> HttpResponse {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = (page - 1) * limit;
    let search = query.search.as_deref().unwrap_or("");

    let total = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM activation_keys WHERE (? = '' OR key_code LIKE '%' || ? || '%' OR exam_type LIKE '%' || ? || '%')",
    )
    .bind(search)
    .bind(search)
    .bind(search)
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let keys = sqlx::query_as::<_, ActivationKey>(
        "SELECT * FROM activation_keys WHERE (? = '' OR key_code LIKE '%' || ? || '%' OR exam_type LIKE '%' || ? || '%') ORDER BY created_at DESC LIMIT ? OFFSET ?",
    )
    .bind(search)
    .bind(search)
    .bind(search)
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(&data.db)
    .await;

    match keys {
        Ok(keys) => HttpResponse::Ok().json(KeyListResponse {
            keys,
            total,
            page,
            limit,
        }),
        Err(e) => {
            log::error!("List keys error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 12. Delete key (deactivate)
// ---------------------------------------------------------------------------

pub async fn delete_key(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let key_id = path.into_inner();

    let result = sqlx::query("UPDATE activation_keys SET is_active = 0 WHERE id = ?")
        .bind(&key_id)
        .execute(&data.db)
        .await;

    match result {
        Ok(_) => {
            if let Ok(Some(admin)) = sqlx::query_as::<_, User>("SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
                .fetch_optional(&data.db)
                .await
            {
                log_audit(
                    &data.db,
                    &admin.id,
                    &admin.email,
                    "delete_key",
                    "key",
                    Some(&key_id),
                    None,
                    get_ip(&req).as_deref(),
                )
                .await;
            }
            HttpResponse::Ok().json(serde_json::json!({
                "message": "Key deactivated successfully"
            }))
        }
        Err(e) => {
            log::error!("Delete key error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to deactivate key"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 13. Key stats
// ---------------------------------------------------------------------------

pub async fn key_stats(data: web::Data<AppState>) -> HttpResponse {
    let total = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM activation_keys")
        .fetch_one(&data.db)
        .await
        .unwrap_or(0);

    let used = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM activation_keys WHERE used_count >= max_uses",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let unused = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM activation_keys WHERE used_count < max_uses AND is_active = 1",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let expired = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM activation_keys WHERE expires_at IS NOT NULL AND expires_at < datetime('now')",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    HttpResponse::Ok().json(KeyStatsResponse {
        total,
        used,
        unused,
        expired,
    })
}

// ---------------------------------------------------------------------------
// 14. List exams
// ---------------------------------------------------------------------------

pub async fn list_exams(data: web::Data<AppState>) -> HttpResponse {
    let exams = sqlx::query_as::<_, ExamWithCounts>(
        "SELECT e.id, e.name, e.slug, e.description, e.total_questions, e.time_limit_minutes, e.min_subjects, e.max_subjects, e.is_active, e.icon_url, e.created_at, (SELECT COUNT(*) FROM subjects WHERE exam_id = e.id AND is_active = 1) AS subject_count, (SELECT COUNT(*) FROM questions WHERE exam_type = e.slug AND is_active = 1) AS question_count FROM exams e ORDER BY e.created_at DESC",
    )
    .fetch_all(&data.db)
    .await;

    match exams {
        Ok(exams) => HttpResponse::Ok().json(serde_json::json!({
            "exams": exams,
            "total": exams.len(),
        })),
        Err(e) => {
            log::error!("List exams error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 15. Create exam
// ---------------------------------------------------------------------------

pub async fn create_exam(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<CreateExamRequest>,
) -> HttpResponse {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();
    let slug = slugify(&body.name);

    let result = sqlx::query(
        "INSERT INTO exams (id, name, slug, description, total_questions, time_limit_minutes, min_subjects, max_subjects, is_active, icon_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&body.name)
    .bind(&slug)
    .bind(&body.description)
    .bind(body.total_questions.unwrap_or(0))
    .bind(body.time_limit_minutes.unwrap_or(60))
    .bind(body.min_subjects.unwrap_or(1))
    .bind(body.max_subjects.unwrap_or(0))
    .bind(&body.icon_url)
    .bind(now)
    .bind(now)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let exam = sqlx::query_as::<_, Exam>("SELECT * FROM exams WHERE id = ?")
                .bind(&id)
                .fetch_one(&data.db)
                .await
                .unwrap();

            if let Ok(Some(admin)) = sqlx::query_as::<_, User>("SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
                .fetch_optional(&data.db)
                .await
            {
                log_audit(
                    &data.db,
                    &admin.id,
                    &admin.email,
                    "create_exam",
                    "exam",
                    Some(&id),
                    Some(&body.name),
                    get_ip(&req).as_deref(),
                )
                .await;
            }

            HttpResponse::Created().json(exam)
        }
        Err(e) => {
            log::error!("Create exam error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create exam"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 16. Update exam
// ---------------------------------------------------------------------------

pub async fn update_exam(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<UpdateExamRequest>,
) -> HttpResponse {
    let exam_id = path.into_inner();
    let now = Utc::now().naive_utc();

    let slug = body.name.as_ref().map(|n| slugify(n));

    let result = sqlx::query(
        "UPDATE exams SET name = COALESCE(?, name), slug = COALESCE(?, slug), description = COALESCE(?, description), total_questions = COALESCE(?, total_questions), time_limit_minutes = COALESCE(?, time_limit_minutes), min_subjects = COALESCE(?, min_subjects), max_subjects = COALESCE(?, max_subjects), is_active = COALESCE(?, is_active), icon_url = COALESCE(?, icon_url), updated_at = ? WHERE id = ?",
    )
    .bind(&body.name)
    .bind(&slug)
    .bind(&body.description)
    .bind(body.total_questions)
    .bind(body.time_limit_minutes)
    .bind(body.min_subjects)
    .bind(body.max_subjects)
    .bind(body.is_active)
    .bind(&body.icon_url)
    .bind(now)
    .bind(&exam_id)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let exam = sqlx::query_as::<_, Exam>("SELECT * FROM exams WHERE id = ?")
                .bind(&exam_id)
                .fetch_one(&data.db)
                .await
                .unwrap();

            if let Ok(Some(admin)) = sqlx::query_as::<_, User>("SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
                .fetch_optional(&data.db)
                .await
            {
                log_audit(
                    &data.db,
                    &admin.id,
                    &admin.email,
                    "update_exam",
                    "exam",
                    Some(&exam_id),
                    None,
                    get_ip(&req).as_deref(),
                )
                .await;
            }

            HttpResponse::Ok().json(exam)
        }
        Err(e) => {
            log::error!("Update exam error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to update exam"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 17. Delete exam (soft)
// ---------------------------------------------------------------------------

pub async fn delete_exam(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let exam_id = path.into_inner();
    let now = Utc::now().naive_utc();

    let result = sqlx::query("UPDATE exams SET is_active = 0, updated_at = ? WHERE id = ?")
        .bind(now)
        .bind(&exam_id)
        .execute(&data.db)
        .await;

    match result {
        Ok(_) => {
            if let Ok(Some(admin)) = sqlx::query_as::<_, User>("SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
                .fetch_optional(&data.db)
                .await
            {
                log_audit(
                    &data.db,
                    &admin.id,
                    &admin.email,
                    "delete_exam",
                    "exam",
                    Some(&exam_id),
                    None,
                    get_ip(&req).as_deref(),
                )
                .await;
            }
            HttpResponse::Ok().json(serde_json::json!({
                "message": "Exam deleted successfully"
            }))
        }
        Err(e) => {
            log::error!("Delete exam error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to delete exam"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 18. List subjects
// ---------------------------------------------------------------------------

pub async fn list_subjects(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let exam_id = path.into_inner();

    let subjects = sqlx::query_as::<_, Subject>(
        "SELECT * FROM subjects WHERE exam_id = ? AND is_active = 1 ORDER BY created_at DESC",
    )
    .bind(&exam_id)
    .fetch_all(&data.db)
    .await;

    match subjects {
        Ok(subjects) => HttpResponse::Ok().json(serde_json::json!({
            "subjects": subjects,
            "total": subjects.len(),
        })),
        Err(e) => {
            log::error!("List subjects error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 19. Create subject
// ---------------------------------------------------------------------------

pub async fn create_subject(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<CreateSubjectRequest>,
) -> HttpResponse {
    let exam_id = path.into_inner();
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();
    let slug = slugify(&body.name);

    let result = sqlx::query(
        "INSERT INTO subjects (id, exam_id, name, slug, description, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)",
    )
    .bind(&id)
    .bind(&exam_id)
    .bind(&body.name)
    .bind(&slug)
    .bind(&body.description)
    .bind(now)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let subject = sqlx::query_as::<_, Subject>("SELECT * FROM subjects WHERE id = ?")
                .bind(&id)
                .fetch_one(&data.db)
                .await
                .unwrap();
            HttpResponse::Created().json(subject)
        }
        Err(e) => {
            log::error!("Create subject error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create subject"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 19b. List topics
// ---------------------------------------------------------------------------

pub async fn list_topics(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let subject_id = path.into_inner();

    let topics = sqlx::query_as::<_, Topic>(
        "SELECT * FROM topics WHERE subject_id = ? AND is_active = 1 ORDER BY created_at DESC",
    )
    .bind(&subject_id)
    .fetch_all(&data.db)
    .await;

    match topics {
        Ok(topics) => HttpResponse::Ok().json(serde_json::json!({
            "topics": topics,
            "total": topics.len(),
        })),
        Err(e) => {
            log::error!("List topics error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 20. Create topic
// ---------------------------------------------------------------------------

pub async fn create_topic(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<CreateTopicRequest>,
) -> HttpResponse {
    let subject_id = path.into_inner();
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();
    let slug = slugify(&body.name);

    let result = sqlx::query(
        "INSERT INTO topics (id, subject_id, name, slug, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)",
    )
    .bind(&id)
    .bind(&subject_id)
    .bind(&body.name)
    .bind(&slug)
    .bind(now)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let topic = sqlx::query_as::<_, Topic>("SELECT * FROM topics WHERE id = ?")
                .bind(&id)
                .fetch_one(&data.db)
                .await
                .unwrap();
            HttpResponse::Created().json(topic)
        }
        Err(e) => {
            log::error!("Create topic error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create topic"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 19c. Update subject
// ---------------------------------------------------------------------------

pub async fn update_subject(
    data: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<serde_json::Value>,
) -> HttpResponse {
    let id = path.into_inner();
    let name = body.get("name").and_then(|v| v.as_str()).unwrap_or("");
    let description = body.get("description").and_then(|v| v.as_str());

    if name.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({"error": "Name is required"}));
    }

    let result = sqlx::query(
        "UPDATE subjects SET name = ?, slug = ?, description = ? WHERE id = ?",
    )
    .bind(name)
    .bind(slugify(name))
    .bind(description)
    .bind(&id)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let subject = sqlx::query_as::<_, Subject>("SELECT * FROM subjects WHERE id = ?")
                .bind(&id)
                .fetch_one(&data.db)
                .await;
            match subject {
                Ok(s) => HttpResponse::Ok().json(s),
                Err(_) => HttpResponse::Ok().json(serde_json::json!({"message": "Updated"})),
            }
        }
        Err(e) => {
            log::error!("Update subject error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to update subject"}))
        }
    }
}

// ---------------------------------------------------------------------------
// 19d. Delete subject
// ---------------------------------------------------------------------------

pub async fn delete_subject(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let id = path.into_inner();

    let result = sqlx::query("DELETE FROM subjects WHERE id = ?")
        .bind(&id)
        .execute(&data.db)
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({"message": "Subject deleted"})),
        Err(e) => {
            log::error!("Delete subject error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to delete subject"}))
        }
    }
}

// ---------------------------------------------------------------------------
// 20b. Update topic
// ---------------------------------------------------------------------------

pub async fn update_topic(
    data: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<serde_json::Value>,
) -> HttpResponse {
    let id = path.into_inner();
    let name = body.get("name").and_then(|v| v.as_str()).unwrap_or("");

    if name.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({"error": "Name is required"}));
    }

    let result = sqlx::query(
        "UPDATE topics SET name = ?, slug = ? WHERE id = ?",
    )
    .bind(name)
    .bind(slugify(name))
    .bind(&id)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let topic = sqlx::query_as::<_, Topic>("SELECT * FROM topics WHERE id = ?")
                .bind(&id)
                .fetch_one(&data.db)
                .await;
            match topic {
                Ok(t) => HttpResponse::Ok().json(t),
                Err(_) => HttpResponse::Ok().json(serde_json::json!({"message": "Updated"})),
            }
        }
        Err(e) => {
            log::error!("Update topic error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to update topic"}))
        }
    }
}

// ---------------------------------------------------------------------------
// 20c. Delete topic
// ---------------------------------------------------------------------------

pub async fn delete_topic(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let id = path.into_inner();

    let result = sqlx::query("DELETE FROM topics WHERE id = ?")
        .bind(&id)
        .execute(&data.db)
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({"message": "Topic deleted"})),
        Err(e) => {
            log::error!("Delete topic error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to delete topic"}))
        }
    }
}

// ---------------------------------------------------------------------------
// 21. List questions
// ---------------------------------------------------------------------------

pub async fn list_questions(
    data: web::Data<AppState>,
    query: web::Query<QuestionParams>,
) -> HttpResponse {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = (page - 1) * limit;

    let exam_type = query.exam_type.as_deref().unwrap_or("");
    let subject_id = query.subject_id.as_deref().unwrap_or("");
    let difficulty = query.difficulty.as_deref().unwrap_or("");
    let search = query.search.as_deref().unwrap_or("");

    let total = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM questions WHERE (exam_type LIKE '%' || ? || '%') AND (? = '' OR subject_id = ?) AND (? = '' OR difficulty = ?) AND (? = '' OR question_text LIKE '%' || ? || '%')",
    )
    .bind(exam_type)
    .bind(subject_id)
    .bind(subject_id)
    .bind(difficulty)
    .bind(difficulty)
    .bind(search)
    .bind(search)
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let questions = sqlx::query_as::<_, Question>(
        "SELECT * FROM questions WHERE (exam_type LIKE '%' || ? || '%') AND (? = '' OR subject_id = ?) AND (? = '' OR difficulty = ?) AND (? = '' OR question_text LIKE '%' || ? || '%') ORDER BY created_at DESC LIMIT ? OFFSET ?",
    )
    .bind(exam_type)
    .bind(subject_id)
    .bind(subject_id)
    .bind(difficulty)
    .bind(difficulty)
    .bind(search)
    .bind(search)
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(&data.db)
    .await;

    match questions {
        Ok(questions) => HttpResponse::Ok().json(QuestionListResponse {
            questions,
            total,
            page,
            limit,
        }),
        Err(e) => {
            log::error!("List questions error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 22. Create question
// ---------------------------------------------------------------------------

pub async fn create_question(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<CreateQuestionRequest>,
) -> HttpResponse {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();

    let result = sqlx::query(
        "INSERT INTO questions (id, subject_id, topic_id, exam_type, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)",
    )
    .bind(&id)
    .bind(&body.subject_id)
    .bind(&body.topic_id)
    .bind(&body.exam_type)
    .bind(&body.question_text)
    .bind(&body.option_a)
    .bind(&body.option_b)
    .bind(&body.option_c)
    .bind(&body.option_d)
    .bind(&body.correct_answer)
    .bind(&body.explanation)
    .bind(body.difficulty.as_deref().unwrap_or("medium"))
    .bind(now)
    .bind(now)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let question = sqlx::query_as::<_, Question>("SELECT * FROM questions WHERE id = ?")
                .bind(&id)
                .fetch_one(&data.db)
                .await
                .unwrap();
            HttpResponse::Created().json(question)
        }
        Err(e) => {
            log::error!("Create question error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create question"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 23. Update question
// ---------------------------------------------------------------------------

pub async fn update_question(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
    body: web::Json<UpdateQuestionRequest>,
) -> HttpResponse {
    let question_id = path.into_inner();
    let now = Utc::now().naive_utc();

    let result = sqlx::query(
        "UPDATE questions SET subject_id = COALESCE(?, subject_id), topic_id = COALESCE(?, topic_id), exam_type = COALESCE(?, exam_type), question_text = COALESCE(?, question_text), option_a = COALESCE(?, option_a), option_b = COALESCE(?, option_b), option_c = COALESCE(?, option_c), option_d = COALESCE(?, option_d), correct_answer = COALESCE(?, correct_answer), explanation = COALESCE(?, explanation), difficulty = COALESCE(?, difficulty), is_active = COALESCE(?, is_active), updated_at = ? WHERE id = ?",
    )
    .bind(&body.subject_id)
    .bind(&body.topic_id)
    .bind(&body.exam_type)
    .bind(&body.question_text)
    .bind(&body.option_a)
    .bind(&body.option_b)
    .bind(&body.option_c)
    .bind(&body.option_d)
    .bind(&body.correct_answer)
    .bind(&body.explanation)
    .bind(&body.difficulty)
    .bind(body.is_active)
    .bind(now)
    .bind(&question_id)
    .execute(&data.db)
    .await;

    match result {
        Ok(_) => {
            let question = sqlx::query_as::<_, Question>("SELECT * FROM questions WHERE id = ?")
                .bind(&question_id)
                .fetch_one(&data.db)
                .await
                .unwrap();
            HttpResponse::Ok().json(question)
        }
        Err(e) => {
            log::error!("Update question error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to update question"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 24. Delete question
// ---------------------------------------------------------------------------

pub async fn delete_question(
    req: HttpRequest,
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let question_id = path.into_inner();

    let result = sqlx::query("DELETE FROM questions WHERE id = ?")
        .bind(&question_id)
        .execute(&data.db)
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Question deleted successfully"
        })),
        Err(e) => {
            log::error!("Delete question error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to delete question"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 25. Import questions CSV
// ---------------------------------------------------------------------------

pub async fn import_questions_csv(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<ImportCsvRequest>,
) -> HttpResponse {
    let csv_data = body.csv.trim();
    let lines: Vec<&str> = csv_data.lines().collect();
    if lines.len() < 2 {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "CSV must have a header row and at least one data row"
        }));
    }

    let header: Vec<String> = lines[0].split(',').map(|f| f.trim().to_lowercase()).collect();
    let has_exam_type = header.first().map_or(false, |h| h == "exam_type");

    let mut success: u32 = 0;
    let mut failed: u32 = 0;
    let mut errors: Vec<ImportError> = Vec::new();

    for (idx, line) in lines.iter().enumerate().skip(1) {
        let row = (idx + 1) as u32;
        let fields: Vec<&str> = line.split(',').map(|f| f.trim().trim_matches('"')).collect();

        let (exam_type, subject_name, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) = if has_exam_type {
            if fields.len() < 9 {
                failed += 1;
                errors.push(ImportError { row, reason: format!("Expected at least 9 fields (exam_type,...), got {}", fields.len()) });
                continue;
            }
            (
                fields[0].trim(),
                fields[1].trim(),
                fields[2].trim(),
                fields[3].trim(),
                fields[4].trim(),
                fields[5].trim(),
                fields[6].trim(),
                fields[7].trim().to_uppercase(),
                fields.get(8).map(|s| s.trim()).unwrap_or(""),
                fields.get(9).map(|s| s.trim().to_lowercase()).unwrap_or_else(|| "medium".to_string()),
            )
        } else {
            if fields.len() < 8 {
                failed += 1;
                errors.push(ImportError { row, reason: format!("Expected at least 8 fields (subject,...), got {}", fields.len()) });
                continue;
            }
            (
                "",
                fields[0].trim(),
                fields[1].trim(),
                fields[2].trim(),
                fields[3].trim(),
                fields[4].trim(),
                fields[5].trim(),
                fields[6].trim().to_uppercase(),
                fields.get(7).map(|s| s.trim()).unwrap_or(""),
                fields.get(8).map(|s| s.trim().to_lowercase()).unwrap_or_else(|| "medium".to_string()),
            )
        };

        if question_text.is_empty() {
            failed += 1;
            errors.push(ImportError { row, reason: "question_text is required".into() });
            continue;
        }
        if option_a.is_empty() || option_b.is_empty() || option_c.is_empty() || option_d.is_empty() {
            failed += 1;
            errors.push(ImportError { row, reason: "all four options (a, b, c, d) are required".into() });
            continue;
        }
        if correct_answer != "A" && correct_answer != "B" && correct_answer != "C" && correct_answer != "D" {
            failed += 1;
            errors.push(ImportError { row, reason: format!("correct_answer must be A, B, C, or D (got '{}')", fields[6]) });
            continue;
        }
        if difficulty != "easy" && difficulty != "medium" && difficulty != "hard" {
            failed += 1;
            errors.push(ImportError { row, reason: format!("difficulty must be easy, medium, or hard (got '{}')", difficulty) });
            continue;
        }

        let subject_label = if subject_name.is_empty() { "General" } else { subject_name };

        let subject_id = {
            if has_exam_type {
                let existing = sqlx::query_scalar::<_, String>(
                    "SELECT id FROM subjects WHERE name = ? AND exam_id = (SELECT id FROM exams WHERE slug = ? LIMIT 1)",
                )
                .bind(subject_label)
                .bind(exam_type)
                .fetch_optional(&data.db)
                .await;

                match existing {
                    Ok(Some(id)) => id,
                    _ => {
                        let new_id = Uuid::new_v4().to_string();
                        let exam_id = sqlx::query_scalar::<_, String>(
                            "SELECT id FROM exams WHERE slug = ? LIMIT 1",
                        )
                        .bind(exam_type)
                        .fetch_optional(&data.db)
                        .await
                        .ok()
                        .flatten();

                        let exam_id_str = exam_id.unwrap_or_default();
                        let now = Utc::now().naive_utc();
                        let _ = sqlx::query(
                            "INSERT OR IGNORE INTO subjects (id, exam_id, name, slug, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)",
                        )
                        .bind(&new_id)
                        .bind(&exam_id_str)
                        .bind(subject_label)
                        .bind(slugify(subject_label))
                        .bind(now)
                        .execute(&data.db)
                        .await;
                        new_id
                    }
                }
            } else {
                let existing = sqlx::query_scalar::<_, String>(
                    "SELECT id FROM subjects WHERE id = ? OR name = ? LIMIT 1",
                )
                .bind(subject_label)
                .bind(subject_label)
                .fetch_optional(&data.db)
                .await;

                match existing {
                    Ok(Some(id)) => id,
                    _ => {
                        failed += 1;
                        errors.push(ImportError { row, reason: format!("Subject '{}' not found. Create it first or use the subject name/ID.", subject_label) });
                        continue;
                    }
                }
            }
        };

        let resolved_exam_type = if has_exam_type {
            exam_type.to_string()
        } else {
            let sub_exam = sqlx::query_scalar::<_, String>(
                "SELECT e.slug FROM exams e INNER JOIN subjects s ON s.exam_id = e.id WHERE s.id = ? LIMIT 1",
            )
            .bind(&subject_id)
            .fetch_optional(&data.db)
            .await
            .ok()
            .flatten()
            .unwrap_or_default();
            sub_exam
        };

        let id = Uuid::new_v4().to_string();
        let now = Utc::now().naive_utc();

        let result = sqlx::query(
            "INSERT INTO questions (id, subject_id, exam_type, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)",
        )
        .bind(&id)
        .bind(&subject_id)
        .bind(&resolved_exam_type)
        .bind(question_text)
        .bind(option_a)
        .bind(option_b)
        .bind(option_c)
        .bind(option_d)
        .bind(&correct_answer)
        .bind(explanation)
        .bind(&difficulty)
        .bind(now)
        .bind(now)
        .execute(&data.db)
        .await;

        match result {
            Ok(_) => success += 1,
            Err(e) => {
                failed += 1;
                errors.push(ImportError { row, reason: e.to_string() });
            }
        }
    }

    log::info!("CSV import by admin: {} succeeded, {} failed", success, failed);

    HttpResponse::Ok().json(ImportResult {
        total: (lines.len() - 1) as u32,
        success,
        failed,
        errors,
    })
}

// ---------------------------------------------------------------------------
// 25b. Import topics CSV
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct ImportTopicsCsvRequest {
    pub csv: String,
    pub subject_id: String,
}

#[derive(Debug, Deserialize)]
pub struct ImportTopicsJsonRequest {
    pub topics: Vec<serde_json::Value>,
    pub subject_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImportTopicsResult {
    pub total: u32,
    pub success: u32,
    pub failed: u32,
    pub errors: Vec<ImportError>,
}

pub async fn import_topics_csv(
    data: web::Data<AppState>,
    body: web::Json<ImportTopicsCsvRequest>,
) -> HttpResponse {
    let csv_data = body.csv.trim();
    let lines: Vec<&str> = csv_data.lines().collect();
    if lines.len() < 2 {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "CSV must have a header row and at least one data row"
        }));
    }

    let mut success: u32 = 0;
    let mut failed: u32 = 0;
    let mut errors: Vec<ImportError> = Vec::new();

    for (idx, line) in lines.iter().enumerate().skip(1) {
        let row = (idx + 1) as u32;
        let fields: Vec<&str> = line.split(',').map(|f| f.trim().trim_matches('"')).collect();
        if fields.is_empty() {
            failed += 1;
            errors.push(ImportError { row, reason: "Empty row".into() });
            continue;
        }

        let name = fields[0].trim();
        if name.is_empty() {
            failed += 1;
            errors.push(ImportError { row, reason: "Topic name is required".into() });
            continue;
        }

        let id = Uuid::new_v4().to_string();
        let now = Utc::now().naive_utc();
        let slug = slugify(name);

        let result = sqlx::query(
            "INSERT OR IGNORE INTO topics (id, subject_id, name, slug, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)",
        )
        .bind(&id)
        .bind(&body.subject_id)
        .bind(name)
        .bind(&slug)
        .bind(now)
        .execute(&data.db)
        .await;

        match result {
            Ok(_) => success += 1,
            Err(e) => {
                failed += 1;
                errors.push(ImportError { row, reason: e.to_string() });
            }
        }
    }

    HttpResponse::Ok().json(ImportTopicsResult {
        total: (lines.len() - 1) as u32,
        success,
        failed,
        errors,
    })
}

pub async fn import_topics_json(
    data: web::Data<AppState>,
    body: web::Json<ImportTopicsJsonRequest>,
) -> HttpResponse {
    let mut success: u32 = 0;
    let mut failed: u32 = 0;
    let mut errors: Vec<ImportError> = Vec::new();

    for (idx, item) in body.topics.iter().enumerate() {
        let row = (idx + 1) as u32;

        let name = item.get("name").and_then(|v| v.as_str()).unwrap_or("").trim();
        if name.is_empty() {
            failed += 1;
            errors.push(ImportError { row, reason: "Topic name is required".into() });
            continue;
        }

        let id = Uuid::new_v4().to_string();
        let now = Utc::now().naive_utc();
        let slug = slugify(name);

        let result = sqlx::query(
            "INSERT OR IGNORE INTO topics (id, subject_id, name, slug, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)",
        )
        .bind(&id)
        .bind(&body.subject_id)
        .bind(name)
        .bind(&slug)
        .bind(now)
        .execute(&data.db)
        .await;

        match result {
            Ok(_) => success += 1,
            Err(e) => {
                failed += 1;
                errors.push(ImportError { row, reason: e.to_string() });
            }
        }
    }

    log::info!("Topic import: {} succeeded, {} failed", success, failed);

    HttpResponse::Ok().json(ImportTopicsResult {
        total: body.topics.len() as u32,
        success,
        failed,
        errors,
    })
}

// ---------------------------------------------------------------------------
// 26. Import questions JSON
// ---------------------------------------------------------------------------

pub async fn import_questions_json(
    req: HttpRequest,
    data: web::Data<AppState>,
    body: web::Json<ImportQuestionsRequest>,
) -> HttpResponse {
    let mut success: u32 = 0;
    let mut failed: u32 = 0;
    let mut errors: Vec<ImportError> = Vec::new();

    for (idx, item) in body.questions.iter().enumerate() {
        let row = (idx + 1) as u32;

        if let Err(e) = item.validate(idx + 1) {
            failed += 1;
            errors.push(ImportError { row, reason: e });
            continue;
        }

        let exam_type = item.exam_type.trim();
        let subject_name = if item.subject.trim().is_empty() { "General" } else { item.subject.trim() };
        let question_text = item.question_text.trim();
        let option_a = item.option_a.trim();
        let option_b = item.option_b.trim();
        let option_c = item.option_c.trim();
        let option_d = item.option_d.trim();
        let correct_answer = item.correct_answer.trim().to_uppercase();
        let explanation = item.explanation.as_deref().unwrap_or("").trim();
        let difficulty = item.difficulty.trim().to_lowercase();

        // Auto-create subject if needed
        let subject_id = {
            let existing = sqlx::query_scalar::<_, String>(
                "SELECT id FROM subjects WHERE name = ? AND exam_id = (SELECT id FROM exams WHERE slug = ? LIMIT 1)",
            )
            .bind(subject_name)
            .bind(exam_type)
            .fetch_optional(&data.db)
            .await;

            match existing {
                Ok(Some(id)) => id,
                _ => {
                    let new_id = Uuid::new_v4().to_string();
                    let exam_id = sqlx::query_scalar::<_, String>(
                        "SELECT id FROM exams WHERE slug = ? LIMIT 1",
                    )
                    .bind(exam_type)
                    .fetch_optional(&data.db)
                    .await
                    .ok()
                    .flatten();

                    let exam_id_str = exam_id.unwrap_or_default();
                    let now = Utc::now().naive_utc();
                    let _ = sqlx::query(
                        "INSERT OR IGNORE INTO subjects (id, exam_id, name, slug, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)",
                    )
                    .bind(&new_id)
                    .bind(&exam_id_str)
                    .bind(subject_name)
                    .bind(slugify(subject_name))
                    .bind(now)
                    .execute(&data.db)
                    .await;
                    new_id
                }
            }
        };

        // Auto-create topic if provided
        let topic_id = if let Some(ref t_name) = item.topic {
            let t_name = t_name.trim();
            if t_name.is_empty() {
                None
            } else {
                let existing = sqlx::query_scalar::<_, String>(
                    "SELECT id FROM topics WHERE name = ? AND subject_id = ?",
                )
                .bind(t_name)
                .bind(&subject_id)
                .fetch_optional(&data.db)
                .await;

                match existing {
                    Ok(Some(id)) => Some(id),
                    _ => {
                        let new_id = Uuid::new_v4().to_string();
                        let now = Utc::now().naive_utc();
                        let _ = sqlx::query(
                            "INSERT OR IGNORE INTO topics (id, subject_id, name, slug, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)",
                        )
                        .bind(&new_id)
                        .bind(&subject_id)
                        .bind(t_name)
                        .bind(slugify(t_name))
                        .bind(now)
                        .execute(&data.db)
                        .await;
                        Some(new_id)
                    }
                }
            }
        } else {
            None
        };

        let id = Uuid::new_v4().to_string();
        let now = Utc::now().naive_utc();

        let result = sqlx::query(
            "INSERT INTO questions (id, subject_id, topic_id, exam_type, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)",
        )
        .bind(&id)
        .bind(&subject_id)
        .bind(&topic_id)
        .bind(exam_type)
        .bind(question_text)
        .bind(option_a)
        .bind(option_b)
        .bind(option_c)
        .bind(option_d)
        .bind(&correct_answer)
        .bind(explanation)
        .bind(&difficulty)
        .bind(now)
        .bind(now)
        .execute(&data.db)
        .await;

        match result {
            Ok(_) => success += 1,
            Err(e) => {
                failed += 1;
                errors.push(ImportError { row, reason: e.to_string() });
            }
        }
    }

    log::info!("JSON import by admin: {} succeeded, {} failed", success, failed);

    HttpResponse::Ok().json(ImportResult {
        total: body.questions.len() as u32,
        success,
        failed,
        errors,
    })
}

// ---------------------------------------------------------------------------
// 27. Export questions
// ---------------------------------------------------------------------------

pub async fn export_questions(
    data: web::Data<AppState>,
    query: web::Query<QuestionParams>,
) -> HttpResponse {
    let exam_type = query.exam_type.as_deref().unwrap_or("");
    let subject_id = query.subject_id.as_deref().unwrap_or("");
    let difficulty = query.difficulty.as_deref().unwrap_or("");

    let questions = sqlx::query_as::<_, Question>(
        "SELECT * FROM questions WHERE (exam_type LIKE '%' || ? || '%') AND (? = '' OR subject_id = ?) AND (? = '' OR difficulty = ?) AND is_active = 1",
    )
    .bind(exam_type)
    .bind(subject_id)
    .bind(subject_id)
    .bind(difficulty)
    .bind(difficulty)
    .fetch_all(&data.db)
    .await;

    match questions {
        Ok(questions) => {
            let format = query.search.as_deref().unwrap_or("json");

            if format == "csv" {
                let mut csv = String::from("exam_type,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty\n");
                for q in &questions {
                    csv.push_str(&format!(
                        "{},{},{},{},{},{},{},{},{}\n",
                        q.exam_type,
                        q.question_text.replace(',', ";"),
                        q.option_a.replace(',', ";"),
                        q.option_b.replace(',', ";"),
                        q.option_c.replace(',', ";"),
                        q.option_d.replace(',', ";"),
                        q.correct_answer,
                        q.explanation.as_deref().unwrap_or("").replace(',', ";"),
                        q.difficulty,
                    ));
                }
                HttpResponse::Ok()
                    .content_type("text/csv")
                    .insert_header(("Content-Disposition", "attachment; filename=\"questions.csv\""))
                    .body(csv)
            } else {
                HttpResponse::Ok().json(serde_json::json!({
                    "questions": questions,
                    "total": questions.len(),
                }))
            }
        }
        Err(e) => {
            log::error!("Export questions error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 28. Question stats
// ---------------------------------------------------------------------------

pub async fn question_stats(data: web::Data<AppState>) -> HttpResponse {
    let total = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM questions WHERE is_active = 1",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let by_exam = sqlx::query_as::<_, ExamQuestionCount>(
        "SELECT exam_type, COUNT(*) AS count FROM questions WHERE is_active = 1 GROUP BY exam_type ORDER BY count DESC",
    )
    .fetch_all(&data.db)
    .await
    .unwrap_or_default();

    let by_difficulty = sqlx::query_as::<_, DifficultyCount>(
        "SELECT difficulty, COUNT(*) AS count FROM questions WHERE is_active = 1 GROUP BY difficulty ORDER BY count DESC",
    )
    .fetch_all(&data.db)
    .await
    .unwrap_or_default();

    HttpResponse::Ok().json(QuestionStats {
        total,
        by_exam,
        by_difficulty,
    })
}

// ---------------------------------------------------------------------------
// 29. Dashboard stats
// ---------------------------------------------------------------------------

pub async fn dashboard_stats(data: web::Data<AppState>) -> HttpResponse {
    let total_users = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users")
        .fetch_one(&data.db)
        .await
        .unwrap_or(0);

    let new_users_today = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM users WHERE date(created_at) = date('now')",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let new_users_week = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM users WHERE created_at >= datetime('now', '-7 days')",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let total_questions = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM questions WHERE is_active = 1",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let total_exams = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM exams WHERE is_active = 1",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let total_keys = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM activation_keys")
        .fetch_one(&data.db)
        .await
        .unwrap_or(0);

    let used_keys = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM activation_keys WHERE used_count >= max_uses",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let active_users = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM users WHERE is_active = 1",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    // Financial stats
    let total_revenue = sqlx::query_scalar::<_, i64>(
        "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'success'",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let successful_payments = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM payments WHERE status = 'success'",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let pending_payments = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM payments WHERE status = 'pending'",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let revenue_today = sqlx::query_scalar::<_, i64>(
        "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'success' AND date(created_at) = date('now')",
    )
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    HttpResponse::Ok().json(DashboardStats {
        total_users,
        new_users_today,
        new_users_week,
        total_questions,
        total_exams,
        total_keys,
        used_keys,
        active_users,
        total_revenue,
        successful_payments,
        pending_payments,
        revenue_today,
    })
}

// ---------------------------------------------------------------------------
// 30. List audit log
// ---------------------------------------------------------------------------

pub async fn list_audit_log(
    data: web::Data<AppState>,
    query: web::Query<AuditLogParams>,
) -> HttpResponse {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = (page - 1) * limit;

    let admin_filter = query.admin_id.as_deref().unwrap_or("");
    let action_filter = query.action.as_deref().unwrap_or("");

    let total = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM admin_audit_log WHERE (? = '' OR admin_id = ?) AND (? = '' OR action = ?)",
    )
    .bind(admin_filter)
    .bind(admin_filter)
    .bind(action_filter)
    .bind(action_filter)
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let entries = sqlx::query_as::<_, AuditLogEntry>(
        "SELECT * FROM admin_audit_log WHERE (? = '' OR admin_id = ?) AND (? = '' OR action = ?) ORDER BY created_at DESC LIMIT ? OFFSET ?",
    )
    .bind(admin_filter)
    .bind(admin_filter)
    .bind(action_filter)
    .bind(action_filter)
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(&data.db)
    .await;

    match entries {
        Ok(entries) => HttpResponse::Ok().json(AuditLogResponse {
            entries,
            total,
            page,
            limit,
        }),
        Err(e) => {
            log::error!("List audit log error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Internal server error"
            }))
        }
    }
}

// ---------------------------------------------------------------------------
// 20. Finance — list payments with user info
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct FinancePayment {
    pub id: String,
    pub user_id: String,
    pub user_name: String,
    pub user_email: String,
    pub amount: i64,
    pub currency: String,
    pub status: String,
    pub reference: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
pub struct FinanceResponse {
    pub payments: Vec<FinancePayment>,
    pub total: i64,
    pub page: u32,
    pub limit: u32,
    pub total_revenue: i64,
    pub successful_count: i64,
    pub pending_count: i64,
    pub failed_count: i64,
}

#[derive(Debug, Deserialize)]
pub struct FinanceParams {
    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub status: Option<String>,
    pub search: Option<String>,
}

pub async fn list_payments(
    req: HttpRequest,
    data: web::Data<AppState>,
    query: web::Query<FinanceParams>,
) -> HttpResponse {
    let admin_id = match extract_admin_id(&req, &data.config.jwt_secret) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = ((page - 1) * limit) as i64;
    let status_filter = query.status.as_deref().unwrap_or("");
    let search_filter = query.search.as_deref().unwrap_or("");

    let total = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM payments p LEFT JOIN users u ON p.user_id = u.id WHERE (? = '' OR p.status = ?) AND (? = '' OR u.name LIKE '%' || ? || '%' OR u.email LIKE '%' || ? || '%' OR p.reference LIKE '%' || ? || '%')"
    )
    .bind(status_filter)
    .bind(status_filter)
    .bind(search_filter)
    .bind(search_filter)
    .bind(search_filter)
    .bind(search_filter)
    .fetch_one(&data.db)
    .await
    .unwrap_or(0);

    let rows = sqlx::query(
        "SELECT p.id, p.user_id, COALESCE(u.name, '') as user_name, COALESCE(u.email, '') as user_email, p.amount, p.currency, p.status, p.reference, p.created_at, p.updated_at FROM payments p LEFT JOIN users u ON p.user_id = u.id WHERE (? = '' OR p.status = ?) AND (? = '' OR u.name LIKE '%' || ? || '%' OR u.email LIKE '%' || ? || '%' OR p.reference LIKE '%' || ? || '%') ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
    )
    .bind(status_filter)
    .bind(status_filter)
    .bind(search_filter)
    .bind(search_filter)
    .bind(search_filter)
    .bind(search_filter)
    .bind(limit as i64)
    .bind(offset)
    .fetch_all(&data.db)
    .await;

    // Summary stats
    let total_revenue: i64 = sqlx::query_scalar("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'success'")
        .fetch_one(&data.db)
        .await
        .unwrap_or(0);
    let successful_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM payments WHERE status = 'success'")
        .fetch_one(&data.db)
        .await
        .unwrap_or(0);
    let pending_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM payments WHERE status = 'pending'")
        .fetch_one(&data.db)
        .await
        .unwrap_or(0);
    let failed_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM payments WHERE status = 'failed'")
        .fetch_one(&data.db)
        .await
        .unwrap_or(0);

    match rows {
        Ok(rows) => {
            let payments = rows.into_iter().map(|row| {
                FinancePayment {
                    id: row.get(0),
                    user_id: row.get(1),
                    user_name: row.get(2),
                    user_email: row.get(3),
                    amount: row.get(4),
                    currency: row.get(5),
                    status: row.get(6),
                    reference: row.get(7),
                    created_at: row.get(8),
                    updated_at: row.get(9),
                }
            }).collect();

            HttpResponse::Ok().json(FinanceResponse {
                payments,
                total,
                page,
                limit,
                total_revenue,
                successful_count,
                pending_count,
                failed_count,
            })
        }
        Err(e) => {
            log::error!("List payments error: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Internal server error"}))
        }
    }
}
