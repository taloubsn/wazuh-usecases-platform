from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App settings
    app_name: str = "Wazuh Use Cases & Playbooks Platform"
    debug: bool = False
    version: str = "1.0.0"
    
    # Database
    database_url: str = "postgresql://wazuh_user:wazuh_password@localhost:5432/wazuh_platform"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # Security
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Elasticsearch
    elasticsearch_url: str = "http://localhost:9200"
    
    # Wazuh API
    wazuh_api_url: str = ""
    wazuh_api_username: str = ""
    wazuh_api_password: str = ""
    
    # OpenAI/LLM
    openai_api_key: str = ""
    llm_model: str = "gpt-4"
    
    # CORS
    allowed_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Pagination
    default_page_size: int = 20
    max_page_size: int = 100
    
    class Config:
        env_file = ".env"


settings = Settings()