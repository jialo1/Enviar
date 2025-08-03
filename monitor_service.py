#!/usr/bin/env python3
"""
Script de surveillance automatique pour le service enviar
Redémarre automatiquement le service en cas de problème 502
"""

import subprocess
import time
import logging
import os
import sys
from datetime import datetime

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/enviar_monitor.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def run_command(command):
    """Exécute une commande et retourne le résultat"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        logger.error(f"Erreur lors de l'exécution de la commande '{command}': {e}")
        return -1, "", str(e)

def check_service_status():
    """Vérifie si le service est actif"""
    code, stdout, stderr = run_command("systemctl is-active enviar.service")
    return code == 0 and stdout.strip() == "active"

def check_port_8000():
    """Vérifie si le port 8000 est en écoute"""
    code, stdout, stderr = run_command("netstat -tlnp | grep :8000")
    return code == 0 and stdout.strip() != ""

def test_application():
    """Teste si l'application répond correctement"""
    code, stdout, stderr = run_command("curl -s -o /dev/null -w '%{http_code}' --connect-timeout 10 http://localhost:8000/")
    return code == 0 and stdout.strip() == "200"

def restart_service():
    """Redémarre le service"""
    logger.info("🔄 Redémarrage du service enviar...")
    
    # Arrêt du service
    code, stdout, stderr = run_command("systemctl stop enviar.service")
    if code != 0:
        logger.error(f"Erreur lors de l'arrêt du service: {stderr}")
        return False
    
    # Attendre que le service s'arrête
    time.sleep(5)
    
    # Démarrage du service
    code, stdout, stderr = run_command("systemctl start enviar.service")
    if code != 0:
        logger.error(f"Erreur lors du démarrage du service: {stderr}")
        return False
    
    # Attendre que le service démarre
    time.sleep(10)
    
    logger.info("✅ Service redémarré avec succès")
    return True

def check_nginx_status():
    """Vérifie le statut de nginx"""
    code, stdout, stderr = run_command("systemctl is-active nginx")
    return code == 0 and stdout.strip() == "active"

def reload_nginx():
    """Recharge la configuration nginx"""
    logger.info("🔄 Rechargement de nginx...")
    code, stdout, stderr = run_command("systemctl reload nginx")
    if code == 0:
        logger.info("✅ Nginx rechargé avec succès")
        return True
    else:
        logger.error(f"Erreur lors du rechargement de nginx: {stderr}")
        return False

def check_system_resources():
    """Vérifie les ressources système"""
    # Vérification de l'espace disque
    code, stdout, stderr = run_command("df / | tail -1 | awk '{print $5}' | sed 's/%//'")
    if code == 0:
        disk_usage = int(stdout.strip())
        if disk_usage > 90:
            logger.warning(f"⚠️  Utilisation disque élevée: {disk_usage}%")
    
    # Vérification de la mémoire
    code, stdout, stderr = run_command("free | grep Mem | awk '{printf \"%.0f\", $3/$2 * 100.0}'")
    if code == 0:
        memory_usage = int(stdout.strip())
        if memory_usage > 90:
            logger.warning(f"⚠️  Utilisation mémoire élevée: {memory_usage}%")

def main():
    """Fonction principale de surveillance"""
    logger.info("🚀 Démarrage du moniteur de service enviar")
    
    consecutive_failures = 0
    max_consecutive_failures = 3
    
    while True:
        try:
            # Vérifications de base
            service_ok = check_service_status()
            port_ok = check_port_8000()
            app_ok = test_application()
            nginx_ok = check_nginx_status()
            
            # Vérification des ressources système
            check_system_resources()
            
            # Diagnostic
            if not service_ok:
                logger.error("❌ Service systemd inactif")
                consecutive_failures += 1
            elif not port_ok:
                logger.error("❌ Port 8000 non en écoute")
                consecutive_failures += 1
            elif not app_ok:
                logger.error("❌ Application ne répond pas (erreur 502 probable)")
                consecutive_failures += 1
            elif not nginx_ok:
                logger.error("❌ Nginx inactif")
                consecutive_failures += 1
            else:
                if consecutive_failures > 0:
                    logger.info("✅ Service rétabli - Réinitialisation du compteur d'échecs")
                consecutive_failures = 0
                logger.info("✅ Tous les services fonctionnent correctement")
            
            # Action corrective si nécessaire
            if consecutive_failures >= max_consecutive_failures:
                logger.warning(f"⚠️  {consecutive_failures} échecs consécutifs détectés - Application des corrections")
                
                # Redémarrage du service
                if restart_service():
                    consecutive_failures = 0
                    # Rechargement de nginx
                    reload_nginx()
                else:
                    logger.error("❌ Échec du redémarrage du service")
            
            # Attendre avant la prochaine vérification
            time.sleep(30)  # Vérification toutes les 30 secondes
            
        except KeyboardInterrupt:
            logger.info("🛑 Arrêt du moniteur demandé par l'utilisateur")
            break
        except Exception as e:
            logger.error(f"❌ Erreur inattendue dans le moniteur: {e}")
            time.sleep(60)  # Attendre plus longtemps en cas d'erreur

if __name__ == "__main__":
    # Vérifier si le script est exécuté en tant que root
    if os.geteuid() != 0:
        logger.error("❌ Ce script doit être exécuté en tant que root")
        sys.exit(1)
    
    main() 