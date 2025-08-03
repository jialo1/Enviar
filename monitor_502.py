#!/usr/bin/env python3
"""
Script de monitoring pour détecter les erreurs 502 Bad Gateway
Auteur: Assistant IA
"""

import requests
import time
import smtplib
import subprocess
import logging
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuration
SITE_URL = "http://localhost:8000"  # URL à surveiller
CHECK_INTERVAL = 30  # Vérifier toutes les 30 secondes
MAX_RETRIES = 3  # Nombre de tentatives avant alerte
LOG_FILE = "/var/log/enviar_monitor.log"

# Configuration email (optionnel)
EMAIL_ENABLED = False
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_FROM = "votre_email@gmail.com"
EMAIL_TO = "votre_email@gmail.com"
EMAIL_PASSWORD = "votre_mot_de_passe_app"

# Configuration Telegram (optionnel)
TELEGRAM_ENABLED = False
TELEGRAM_BOT_TOKEN = "votre_bot_token"
TELEGRAM_CHAT_ID = "votre_chat_id"

def setup_logging():
    """Configuration des logs"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(LOG_FILE),
            logging.StreamHandler()
        ]
    )

def check_site_health():
    """Vérifier la santé du site"""
    try:
        response = requests.get(SITE_URL, timeout=10)
        if response.status_code == 200:
            return True, "OK"
        elif response.status_code == 502:
            return False, f"502 Bad Gateway - {response.status_code}"
        else:
            return False, f"Erreur HTTP - {response.status_code}"
    except requests.exceptions.ConnectionError:
        return False, "Erreur de connexion"
    except requests.exceptions.Timeout:
        return False, "Timeout"
    except Exception as e:
        return False, f"Erreur inconnue: {str(e)}"

def restart_services():
    """Redémarrer les services"""
    try:
        logging.info("Redémarrage des services...")
        
        # Redémarrer le service enviar
        subprocess.run(["systemctl", "restart", "enviar"], check=True)
        logging.info("Service enviar redémarré")
        
        # Redémarrer nginx
        subprocess.run(["systemctl", "restart", "nginx"], check=True)
        logging.info("Service nginx redémarré")
        
        # Attendre un peu
        time.sleep(10)
        
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Erreur lors du redémarrage: {e}")
        return False

def send_email_alert(error_message):
    """Envoyer une alerte par email"""
    if not EMAIL_ENABLED:
        return
    
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_FROM
        msg['To'] = EMAIL_TO
        msg['Subject'] = "🚨 ALERTE: Erreur 502 sur Enviar"
        
        body = f"""
        🚨 ALERTE MONITORING ENVIAR
        
        Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        Erreur: {error_message}
        URL: {SITE_URL}
        
        Le site a été redémarré automatiquement.
        Vérifiez les logs: journalctl -u enviar.service -f
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_FROM, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        logging.info("Alerte email envoyée")
    except Exception as e:
        logging.error(f"Erreur lors de l'envoi de l'email: {e}")

def send_telegram_alert(error_message):
    """Envoyer une alerte Telegram"""
    if not TELEGRAM_ENABLED:
        return
    
    try:
        message = f"""
🚨 ALERTE MONITORING ENVIAR

Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Erreur: {error_message}
URL: {SITE_URL}

Le site a été redémarré automatiquement.
Vérifiez les logs: journalctl -u enviar.service -f
        """
        
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "HTML"
        }
        
        requests.post(url, data=data, timeout=10)
        logging.info("Alerte Telegram envoyée")
    except Exception as e:
        logging.error(f"Erreur lors de l'envoi Telegram: {e}")

def main():
    """Fonction principale"""
    setup_logging()
    logging.info("🚀 Démarrage du monitoring Enviar")
    
    consecutive_errors = 0
    
    while True:
        try:
            is_healthy, status = check_site_health()
            
            if is_healthy:
                if consecutive_errors > 0:
                    logging.info("✅ Site rétabli - Monitoring normal")
                consecutive_errors = 0
            else:
                consecutive_errors += 1
                logging.warning(f"⚠️ Erreur détectée ({consecutive_errors}/{MAX_RETRIES}): {status}")
                
                if consecutive_errors >= MAX_RETRIES:
                    logging.error(f"🚨 ALERTE: Erreur persistante - {status}")
                    
                    # Redémarrer les services
                    if restart_services():
                        logging.info("✅ Services redémarrés avec succès")
                        
                        # Vérifier si le site fonctionne maintenant
                        time.sleep(15)
                        is_healthy_after_restart, status_after = check_site_health()
                        
                        if is_healthy_after_restart:
                            logging.info("✅ Site rétabli après redémarrage")
                        else:
                            logging.error(f"❌ Site toujours en erreur après redémarrage: {status_after}")
                            # Envoyer les alertes
                            send_email_alert(status)
                            send_telegram_alert(status)
                    else:
                        logging.error("❌ Échec du redémarrage des services")
                        # Envoyer les alertes
                        send_email_alert(status)
                        send_telegram_alert(status)
                    
                    consecutive_errors = 0
            
            time.sleep(CHECK_INTERVAL)
            
        except KeyboardInterrupt:
            logging.info("🛑 Monitoring arrêté par l'utilisateur")
            break
        except Exception as e:
            logging.error(f"Erreur dans le monitoring: {e}")
            time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main() 