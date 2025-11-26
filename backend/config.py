import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_key')
    DEBUG = os.getenv('FLASK_DEBUG', 'False') == 'True'

    # Oracle
    ORACLE_USER = os.getenv('ORACLE_USER')
    ORACLE_PASS = os.getenv('ORACLE_PASS')
    ORACLE_DSN = os.getenv('ORACLE_DSN')
    
    # Caminho do Instant Client (Opcional, se definido ativa o Thick Mode)
    ORACLE_CLIENT_LIB_DIR = os.getenv('ORACLE_CLIENT_LIB_DIR')

    # Tasy Web
    TASY_URL = os.getenv('TASY_URL')
    TASY_WEB_USER = os.getenv('TASY_WEB_USER')
    TASY_WEB_PASS = os.getenv('TASY_WEB_PASS')
    
    HEADLESS_MODE = os.getenv('HEADLESS_MODE', 'True') == 'True'

    # Segurança JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secret-key-change-this')
    
    # Usuário Admin da Ferramenta (quem pode logar)
    APP_USER = os.getenv('APP_USER', 'admin')
    APP_PASS = os.getenv('APP_PASS', 'senha123')