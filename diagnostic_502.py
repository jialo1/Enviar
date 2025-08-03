#!/usr/bin/env python3
"""
Script de diagnostic pour résoudre l'erreur 502 Bad Gateway
"""

import os
import subprocess
import sys
import time
import psutil
import json

def run_command(command, capture_output=True):
    """Exécute une commande et retourne le résultat"""
    try:
        result = subprocess.run(command, shell=True, capture_output=capture_output, text=True)
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        return -1, "", str(e)

def check_service_status():
    """Vérifie le statut du service systemd"""
    print("🔍 Vérification du statut du service...")
    code, stdout, stderr = run_command("systemctl status enviar.service")
    
    if code == 0:
        print("✅ Service actif")
        return True
    else:
        print("❌ Service inactif ou en erreur")
        print(f"Sortie: {stdout}")
        print(f"Erreur: {stderr}")
        return False

def check_gunicorn_processes():
    """Vérifie les processus Gunicorn en cours"""
    print("\n🔍 Vérification des processus Gunicorn...")
    code, stdout, stderr = run_command("ps aux | grep gunicorn | grep -v grep")
    
    if code == 0 and stdout.strip():
        print("✅ Processus Gunicorn trouvés:")
        print(stdout)
        return True
    else:
        print("❌ Aucun processus Gunicorn trouvé")
        return False

def check_port_8000():
    """Vérifie si le port 8000 est en écoute"""
    print("\n🔍 Vérification du port 8000...")
    code, stdout, stderr = run_command("netstat -tlnp | grep :8000")
    
    if code == 0 and stdout.strip():
        print("✅ Port 8000 en écoute:")
        print(stdout)
        return True
    else:
        print("❌ Port 8000 non en écoute")
        return False

def check_nginx_status():
    """Vérifie le statut de nginx"""
    print("\n🔍 Vérification du statut nginx...")
    code, stdout, stderr = run_command("systemctl status nginx")
    
    if code == 0:
        print("✅ Nginx actif")
        return True
    else:
        print("❌ Nginx inactif ou en erreur")
        print(f"Sortie: {stdout}")
        print(f"Erreur: {stderr}")
        return False

def check_nginx_config():
    """Vérifie la configuration nginx"""
    print("\n🔍 Vérification de la configuration nginx...")
    code, stdout, stderr = run_command("nginx -t")
    
    if code == 0:
        print("✅ Configuration nginx valide")
        return True
    else:
        print("❌ Configuration nginx invalide")
        print(f"Erreur: {stderr}")
        return False

def check_application_logs():
    """Vérifie les logs de l'application"""
    print("\n🔍 Vérification des logs de l'application...")
    
    # Logs systemd
    code, stdout, stderr = run_command("journalctl -u enviar.service --no-pager -n 20")
    if code == 0 and stdout.strip():
        print("📋 Logs systemd (dernières 20 lignes):")
        print(stdout)
    
    # Logs nginx
    code, stdout, stderr = run_command("tail -n 20 /var/log/nginx/error.log")
    if code == 0 and stdout.strip():
        print("📋 Logs d'erreur nginx (dernières 20 lignes):")
        print(stdout)

def check_disk_space():
    """Vérifie l'espace disque"""
    print("\n🔍 Vérification de l'espace disque...")
    code, stdout, stderr = run_command("df -h")
    
    if code == 0:
        print("📊 Espace disque:")
        print(stdout)

def check_memory_usage():
    """Vérifie l'utilisation mémoire"""
    print("\n🔍 Vérification de l'utilisation mémoire...")
    code, stdout, stderr = run_command("free -h")
    
    if code == 0:
        print("📊 Utilisation mémoire:")
        print(stdout)

def restart_service():
    """Redémarre le service"""
    print("\n🔄 Redémarrage du service...")
    
    # Arrêt du service
    code, stdout, stderr = run_command("systemctl stop enviar.service")
    if code == 0:
        print("✅ Service arrêté")
    else:
        print("❌ Erreur lors de l'arrêt du service")
        print(f"Erreur: {stderr}")
    
    # Attendre un peu
    time.sleep(3)
    
    # Démarrage du service
    code, stdout, stderr = run_command("systemctl start enviar.service")
    if code == 0:
        print("✅ Service démarré")
    else:
        print("❌ Erreur lors du démarrage du service")
        print(f"Erreur: {stderr}")
    
    # Vérifier le statut
    time.sleep(2)
    check_service_status()

def reload_nginx():
    """Recharge la configuration nginx"""
    print("\n🔄 Rechargement de nginx...")
    code, stdout, stderr = run_command("systemctl reload nginx")
    
    if code == 0:
        print("✅ Nginx rechargé")
    else:
        print("❌ Erreur lors du rechargement de nginx")
        print(f"Erreur: {stderr}")

def test_application():
    """Teste l'application directement"""
    print("\n🔍 Test de l'application sur le port 8000...")
    code, stdout, stderr = run_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/")
    
    if code == 0 and stdout == "200":
        print("✅ Application répond correctement sur le port 8000")
        return True
    else:
        print(f"❌ Application ne répond pas correctement (code: {stdout})")
        return False

def main():
    """Fonction principale de diagnostic"""
    print("🚀 Diagnostic de l'erreur 502 Bad Gateway")
    print("=" * 50)
    
    # Vérifications de base
    nginx_ok = check_nginx_status()
    nginx_config_ok = check_nginx_config()
    service_ok = check_service_status()
    gunicorn_ok = check_gunicorn_processes()
    port_ok = check_port_8000()
    
    # Vérifications système
    check_disk_space()
    check_memory_usage()
    
    # Vérification des logs
    check_application_logs()
    
    # Test de l'application
    app_ok = test_application()
    
    print("\n" + "=" * 50)
    print("📋 RÉSUMÉ DU DIAGNOSTIC")
    print("=" * 50)
    
    issues = []
    
    if not nginx_ok:
        issues.append("Nginx n'est pas actif")
    if not nginx_config_ok:
        issues.append("Configuration nginx invalide")
    if not service_ok:
        issues.append("Service systemd inactif")
    if not gunicorn_ok:
        issues.append("Aucun processus Gunicorn")
    if not port_ok:
        issues.append("Port 8000 non en écoute")
    if not app_ok:
        issues.append("Application ne répond pas")
    
    if issues:
        print("❌ Problèmes détectés:")
        for issue in issues:
            print(f"   - {issue}")
        
        print("\n🔧 SOLUTIONS RECOMMANDÉES:")
        print("1. Redémarrer le service:")
        print("   sudo systemctl restart enviar.service")
        print("2. Recharger nginx:")
        print("   sudo systemctl reload nginx")
        print("3. Vérifier les logs:")
        print("   sudo journalctl -u enviar.service -f")
        print("4. Vérifier la configuration:")
        print("   sudo nginx -t")
        
        # Demander si l'utilisateur veut appliquer les corrections
        response = input("\n🤔 Voulez-vous appliquer les corrections automatiquement? (y/n): ")
        if response.lower() in ['y', 'yes', 'o', 'oui']:
            restart_service()
            reload_nginx()
            time.sleep(3)
            print("\n🔍 Vérification après correction...")
            check_service_status()
            check_gunicorn_processes()
            check_port_8000()
            test_application()
    else:
        print("✅ Aucun problème détecté dans les vérifications de base")
        print("💡 Le problème pourrait être temporaire ou lié à la charge")

if __name__ == "__main__":
    main() 