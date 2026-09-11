use actix_web::{web, App, HttpServer, middleware::Logger};
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
        App::new()
            .app_data(data.clone())
            .wrap(Logger::default())
            .service(
                web::scope("/api/auth")
                    .route("/register", web::post().to(handlers::auth::register))
                    .route("/login", web::post().to(handlers::auth::login))
                    .route("/me", web::get().to(handlers::auth::me))
            )
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
