from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    """
    Application Settings configuration.
    Loads securely from environment variables or .env file.
    """
    # Environment configs
    APP_NAME: str = "LexAgent Assistant"
    DEBUG_MODE: bool = False

    # Qdrant configs
    QDRANT_URL: str
    QDRANT_API_KEY: str
    QDRANT_COLLECTION: str = "legal_compliance_chunks"
    
    # Gemini configurations
    GEMINI_API_KEY: str
    
    # Grok configurations
    GROK_API_KEY: str

    model_config = ConfigDict(env_file=".env", extra="ignore")

# Global singleton configuration
settings = Settings()
