#!/bin/bash

# Script de déploiement amélioré pour résoudre les erreurs 502 Bad Gateway
# Auteur: Assistant IA
# Date: $(date)

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement amélioré d'Enviar - Résolution des erreurs 502"
echo "=========================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si on est root
if [[ $EUID -ne 0 ]]; then
   log_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

# Variables
APP_DIR="/opt/enviar"
VENV_DIR="$APP_DIR/venv"
SERVICE_FILE="/etc/systemd/system/enviar.service"
MONITOR_SERVICE_FILE="/etc/systemd/system/enviar-monitor.service"

log_info "Arrêt des services existants..."
systemctl stop enviar.service 2>/dev/null || true
systemctl stop enviar-monitor.service 2>/dev/null || true

log_info "Création du répertoire de l'application..."
mkdir -p $APP_DIR

log_info "Copie des fichiers de l'application..."
cp -r . $APP_DIR/
cd $APP_DIR

log_info "Création de l'environnement virtuel..."
python3 -m venv $VENV_DIR

log_info "Activation de l'environnement virtuel..."
source $VENV_DIR/bin/activate

log_info "Installation des dépendances..."
pip install --upgrade pip
pip install -r requirements.txt

# Installation de psutil pour le monitoring
log_info "Installation des dépendances de monitoring..."
pip install psutil

log_info "Configuration des permissions..."
chown -R root:root $APP_DIR
chmod -R 755 $APP_DIR
chmod +x $APP_DIR/*.py
chmod +x $APP_DIR/*.sh

log_info "Installation du service principal..."
cp enviar.service $SERVICE_FILE
systemctl daemon-reload
systemctl enable enviar.service

log_info "Installation du service de monitoring..."
cp enviar-monitor.service $MONITOR_SERVICE_FILE
systemctl daemon-reload
systemctl enable enviar-monitor.service

log_info "Configuration de nginx..."
# Vérifier si la configuration nginx existe
if [ ! -f /etc/nginx/sites-available/enviar ]; then
    log_warning "Configuration nginx non trouvée. Création d'une configuration de base..."
    
    cat > /etc/nginx/sites-available/enviar << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    location /static/ {
        alias /opt/enviar/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /images/ {
        alias /opt/enviar/images/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Activer le site
    ln -sf /etc/nginx/sites-available/enviar /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
fi

log_info "Test de la configuration nginx..."
nginx -t

log_info "Redémarrage de nginx..."
systemctl restart nginx

log_info "Démarrage des services..."
systemctl start enviar.service
sleep 5
systemctl start enviar-monitor.service

log_info "Vérification du statut des services..."
echo ""
echo "📊 Statut des services:"
echo "======================"

# Vérifier le service principal
if systemctl is-active --quiet enviar.service; then
    log_success "Service enviar: ACTIF"
else
    log_error "Service enviar: INACTIF"
fi

# Vérifier le service de monitoring
if systemctl is-active --quiet enviar-monitor.service; then
    log_success "Service enviar-monitor: ACTIF"
else
    log_error "Service enviar-monitor: INACTIF"
fi

# Vérifier nginx
if systemctl is-active --quiet nginx; then
    log_success "Service nginx: ACTIF"
else
    log_error "Service nginx: INACTIF"
fi

echo ""
log_info "Test de l'application..."
sleep 3

# Test de l'application
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ | grep -q "200"; then
    log_success "Application répond correctement sur le port 8000"
else
    log_error "Application ne répond pas sur le port 8000"
fi

# Test via nginx
if curl -s -o /dev/null -w "%{http_code}" http://localhost/ | grep -q "200"; then
    log_success "Application accessible via nginx"
else
    log_warning "Application non accessible via nginx (vérifiez la configuration)"
fi

echo ""
log_info "Configuration des logs..."
# Créer le fichier de log pour le moniteur
touch /var/log/enviar_monitor.log
chmod 644 /var/log/enviar_monitor.log

echo ""
log_success "Déploiement terminé avec succès!"
echo ""
echo "📋 Commandes utiles:"
echo "==================="
echo "• Vérifier le statut: systemctl status enviar.service"
echo "• Voir les logs: journalctl -u enviar.service -f"
echo "• Voir les logs du moniteur: tail -f /var/log/enviar_monitor.log"
echo "• Redémarrer: systemctl restart enviar.service"
echo "• Diagnostic: python3 diagnostic_502.py"
echo ""
echo "🔧 Surveillance automatique activée"
echo "Le service sera automatiquement redémarré en cas de problème 502"
echo ""
echo "🌐 Votre application devrait être accessible sur:"
echo "   - http://localhost (via nginx)"
echo "   - http://localhost:8000 (directement)"
echo ""

# Afficher les dernières lignes des logs pour vérification
echo "📋 Dernières lignes des logs du service:"
echo "========================================"
journalctl -u enviar.service --no-pager -n 10

echo ""
log_success "Déploiement terminé! 🎉" 