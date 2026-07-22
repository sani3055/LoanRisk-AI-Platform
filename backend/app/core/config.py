from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    api_prefix: str = "/api"
    cors_origins: str = "http://localhost:5173"
    model_path: Path = Path(__file__).resolve().parents[2] / "model" / "best_model.pkl"
    scaler_path: Path = Path(__file__).resolve().parents[2] / "model" / "scaler.pkl"
    finbert_model: str = "ProsusAI/finbert"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
