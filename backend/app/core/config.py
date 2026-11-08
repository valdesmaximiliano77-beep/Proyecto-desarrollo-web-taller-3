from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    mongo_url: str = "mongodb://localhost:27017"
    mongo_db: str = "agenda_historial"
    cors_origins: str = "http://localhost:5173"
    zona_horaria: str = "America/Santiago"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()