from pydantic_settings import BaseSettings, SettingsConfigDict

"""
Sample of data
# openssl rand -hex 64
SECRET_KEY=e84d5905aeae1c719c51ea619193aa258e765635bedac71cd28dc18c7875f703929355425b7618075a9b1645b1ea4ac8bc3c164a3ae2f6d246f1a5e1243c3c89
MARIADB_USER=izi
MARIADB_PASSWORD=izi
MARIADB_ROOT_PASSWORD=izi
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_DATABASE=cesi-zen
ALGORITHM=HS256
BCRYPT_HASH_ROUND=12
ACCESS_TOKEN_EXPIRE_MINUTES=60
"""

class Settings(BaseSettings):
    MARIADB_DATABASE: str
    MARIADB_USER: str
    MARIADB_PASSWORD: str
    MARIADB_ROOT_PASSWORD: str
    MARIADB_HOST: str
    MARIADB_PORT: int
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    BCRYPT_HASH_ROUND: int
    model_config = SettingsConfigDict(env_file="api.env")


SECRET = Settings()
