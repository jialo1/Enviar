import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()

class Config:
    # Configuration de base
    SECRET_KEY = os.environ.get('SECRET_KEY') or os.urandom(32)
    
    # Configuration des sessions
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Configuration des cookies
    COOKIE_CONSENT_NAME = 'cookie_consent'
    COOKIE_CONSENT_MAX_AGE = 2 * 365 * 24 * 60 * 60  # 2 ans
    
    # Identifiants d'administration
    ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    # Configuration des fichiers
    TAUX_FILE = 'taux.json'
    
    # Configuration du serveur
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 8000))
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
