use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use sqlx::SqlitePool;
use std::env;

mod config;
mod handlers;
mod models;
mod middleware;

pub struct AppState {
    pub db: SqlitePool,
    pub config: config::Config,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:exam_scholars.db?mode=rwc".to_string());
    let pool = SqlitePool::connect(&database_url)
        .await
        .expect("Failed to connect to SQLite");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    let config = config::Config::from_env();
    let data = web::Data::new(AppState { db: pool, config });

    log::info!("Starting server at http://127.0.0.1:8080");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3001")
            .allowed_origin("http://127.0.0.1:3001")
            .allowed_origin("http://localhost:3002")
            .allowed_origin("http://127.0.0.1:3002")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec![
                actix_web::http::header::AUTHORIZATION,
                actix_web::http::header::CONTENT_TYPE,
                actix_web::http::header::ACCEPT,
            ])
            .max_age(3600);

        App::new()
            .app_data(data.clone())
            .wrap(cors)
            .wrap(Logger::default())
            .service(
                web::scope("/api")
                    .route("/exams", web::get().to(handlers::auth::list_public_exams))
                    .route("/exams/{id}/subjects", web::get().to(handlers::auth::list_public_exam_subjects))
                    .route("/subjects/{id}/topics", web::get().to(handlers::auth::list_public_subject_topics))
            )
            .service(
                web::scope("/api/auth")
                    .route("/register", web::post().to(handlers::auth::register))
                    .route("/login", web::post().to(handlers::auth::login))
                    .route("/me", web::get().to(handlers::auth::me))
                    .route("/forgot-password", web::post().to(handlers::auth::forgot_password))
                    .route("/reset-password", web::post().to(handlers::auth::reset_password))
                    .route("/send-verification", web::post().to(handlers::auth::send_verification))
                    .route("/verify-email", web::post().to(handlers::auth::verify_email))
                    .route("/verification-status", web::get().to(handlers::auth::check_verification_status))
                    .route("/track-usage", web::post().to(handlers::auth::track_usage))
                    .route("/usage-status", web::get().to(handlers::auth::usage_status))
                    .route("/profile", web::put().to(handlers::auth::update_profile))
                    .route("/password", web::put().to(handlers::auth::update_password))
                    .route("/settings", web::get().to(handlers::auth::get_settings))
                    .route("/settings", web::put().to(handlers::auth::update_settings))
                    .route("/exams", web::get().to(handlers::auth::list_public_exams))
                    .route("/exams/{id}/subjects", web::get().to(handlers::auth::list_public_exam_subjects))
                    .route("/subjects/{id}/topics", web::get().to(handlers::auth::list_public_subject_topics))
                    .route("/exam-sessions", web::post().to(handlers::auth::create_exam_session))
                    .route("/exam-sessions", web::get().to(handlers::auth::list_exam_sessions))
                    .route("/exam-sessions/{id}", web::get().to(handlers::auth::get_exam_session))
                    .route("/exam-sessions/{id}/answer", web::post().to(handlers::auth::submit_answer))
                    .route("/exam-sessions/{id}/submit", web::post().to(handlers::auth::submit_exam_session))
                    .route("/exam-sessions/{id}/results", web::get().to(handlers::auth::get_session_results))
                    .route("/exam-sessions/{id}/abandon", web::post().to(handlers::auth::abandon_session))
                    .route("/bookmarks", web::get().to(handlers::auth::list_bookmarks))
                    .route("/bookmarks", web::post().to(handlers::auth::create_bookmark))
                    .route("/bookmarks/{questionId}", web::delete().to(handlers::auth::delete_bookmark))
                    .route("/stats", web::get().to(handlers::auth::get_user_stats))
                    .route("/activate", web::post().to(handlers::auth::activate_account))
                    .route("/activation-status", web::get().to(handlers::auth::check_activation_status))
                    .route("/activation-key", web::get().to(handlers::auth::get_activation_key))
                    .route("/payments/init", web::post().to(handlers::payments::init_payment))
                    .route("/payments/verify", web::post().to(handlers::payments::verify_payment))
                    .route("/payments/{reference}", web::get().to(handlers::payments::get_payment_status))
            )
            .service(
                web::scope("/api/admin")
                    .route("/login", web::post().to(handlers::admin::admin_login))
                    .route("/logout", web::post().to(handlers::admin::admin_logout))
                    .route("/me", web::get().to(handlers::admin::admin_me))
                    .route("/dashboard", web::get().to(handlers::admin::dashboard_stats))
                    .route("/users", web::get().to(handlers::admin::list_users))
                    .route("/users/{id}", web::get().to(handlers::admin::get_user))
                    .route("/users/{id}", web::put().to(handlers::admin::update_user))
                    .route("/users/{id}", web::delete().to(handlers::admin::delete_user))
                    .route("/users/{id}/ban", web::post().to(handlers::admin::ban_user))
                    .route("/users/{id}/unban", web::post().to(handlers::admin::unban_user))
                    .route("/users/{id}/resend-verification", web::post().to(handlers::admin::resend_verification))
                    .route("/users/{id}/reset-password", web::post().to(handlers::admin::admin_reset_password))
                    .route("/keys", web::get().to(handlers::admin::list_keys))
                    .route("/keys", web::post().to(handlers::admin::generate_keys))
                    .route("/keys/stats", web::get().to(handlers::admin::key_stats))
                    .route("/keys/{id}", web::delete().to(handlers::admin::delete_key))
                    .route("/exams", web::get().to(handlers::admin::list_exams))
                    .route("/exams", web::post().to(handlers::admin::create_exam))
                    .route("/exams/{id}", web::put().to(handlers::admin::update_exam))
                    .route("/exams/{id}", web::delete().to(handlers::admin::delete_exam))
                    .route("/exams/{id}/subjects", web::get().to(handlers::admin::list_subjects))
                    .route("/exams/{id}/subjects", web::post().to(handlers::admin::create_subject))
                    .route("/subjects/{id}", web::put().to(handlers::admin::update_subject))
                    .route("/subjects/{id}", web::delete().to(handlers::admin::delete_subject))
                    .route("/subjects/{id}/topics", web::get().to(handlers::admin::list_topics))
                    .route("/subjects/{id}/topics", web::post().to(handlers::admin::create_topic))
                    .route("/topics/{id}", web::put().to(handlers::admin::update_topic))
                    .route("/topics/{id}", web::delete().to(handlers::admin::delete_topic))
                    .route("/topics/import/csv", web::post().to(handlers::admin::import_topics_csv))
                    .route("/topics/import/json", web::post().to(handlers::admin::import_topics_json))
                    .route("/questions", web::get().to(handlers::admin::list_questions))
                    .route("/questions", web::post().to(handlers::admin::create_question))
                    .route("/questions/stats", web::get().to(handlers::admin::question_stats))
                    .route("/questions/export", web::get().to(handlers::admin::export_questions))
                    .route("/questions/import/csv", web::post().to(handlers::admin::import_questions_csv))
                    .route("/questions/import/json", web::post().to(handlers::admin::import_questions_json))
                    .route("/questions/{id}", web::put().to(handlers::admin::update_question))
                    .route("/questions/{id}", web::delete().to(handlers::admin::delete_question))
                    .route("/audit-log", web::get().to(handlers::admin::list_audit_log))
                    .route("/finance", web::get().to(handlers::admin::list_payments))
            )
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
