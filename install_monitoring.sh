#!/bin/bash

# Script d'installation du monitoring Enviar
# Auteur: Assistant IA

set -e

echo "🔔 Installation du système de monitoring Enviar"
echo "================================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log_info "Installation des dépendances Python..."
pip3 install requests

log_info "Configuration des permissions..."
chmod +x /opt/enviar/monitor_502.py

log_info "Installation du service systemd..."
cp /opt/enviar/enviar-monitor-502.service /etc/systemd/system/
systemctl daemon-reload

log_info "Activation du service..."
systemctl enable enviar-monitor-502.service
systemctl start enviar-monitor-502.service

log_info "Vérification du service..."
if systemctl is-active --quiet enviar-monitor-502.service; then
    log_success "Service de monitoring actif"
else
    log_error "Service de monitoring inactif"
    exit 1
fi

log_success "Installation terminée!"
echo ""
echo "📋 Commandes utiles :"
echo "• Voir les logs : journalctl -u enviar-monitor-502.service -f"
echo "• Arrêter : systemctl stop enviar-monitor-502.service"
echo "• Démarrer : systemctl start enviar-monitor-502.service"
echo "• Redémarrer : systemctl restart enviar-monitor-502.service"
echo ""
echo "🔧 Configuration :"
echo "• Modifier les alertes : nano /opt/enviar/monitor_502.py"
echo "• Logs du monitoring : tail -f /var/log/enviar_monitor.log"
echo ""
echo "📱 Alertes disponibles :"
echo "• Email (Gmail)"
echo "• Telegram"
echo "• Logs automatiques"
echo ""
echo "⚠️ N'oubliez pas de configurer vos alertes dans monitor_502.py !" 