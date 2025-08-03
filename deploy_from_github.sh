#!/bin/bash

# Script de déploiement automatique depuis GitHub
# Auteur: Assistant IA

set -e

echo "🚀 Déploiement depuis GitHub"
echo "============================"

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

# Variables
APP_DIR="/opt/enviar"
GITHUB_REPO="https://github.com/jialo1/Enviar.git"
BACKUP_DIR="/opt/enviar_backup_$(date +%Y%m%d_%H%M%S)"

# Vérifier si on est root
if [[ $EUID -ne 0 ]]; then
   log_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

log_info "Arrêt des services..."
systemctl stop enviar.service 2>/dev/null || true

log_info "Création du backup..."
mkdir -p $BACKUP_DIR
cp -r $APP_DIR/* $BACKUP_DIR/ 2>/dev/null || true

log_info "Sauvegarde de la configuration..."
cp $APP_DIR/gunicorn.conf.py $BACKUP_DIR/ 2>/dev/null || true
cp $APP_DIR/enviar.service $BACKUP_DIR/ 2>/dev/null || true

log_info "Nettoyage du répertoire..."
rm -rf $APP_DIR/*

log_info "Clonage depuis GitHub..."
cd /opt
git clone $GITHUB_REPO enviar_temp
cp -r enviar_temp/* enviar/
rm -rf enviar_temp

log_info "Restauration de la configuration..."
cp $BACKUP_DIR/gunicorn.conf.py $APP_DIR/ 2>/dev/null || true
cp $BACKUP_DIR/enviar.service $APP_DIR/ 2>/dev/null || true

log_info "Configuration des permissions..."
chown -R root:root $APP_DIR
chmod -R 755 $APP_DIR
chmod +x $APP_DIR/*.py
chmod +x $APP_DIR/*.sh

log_info "Installation des dépendances..."
cd $APP_DIR
source venv/bin/activate
pip install -r requirements.txt

log_info "Redémarrage des services..."
systemctl daemon-reload
systemctl start enviar.service
systemctl reload nginx

log_info "Vérification du déploiement..."
sleep 5

if systemctl is-active --quiet enviar.service; then
    log_success "Service actif"
else
    log_error "Service inactif"
    log_info "Restauration du backup..."
    systemctl stop enviar.service
    rm -rf $APP_DIR/*
    cp -r $BACKUP_DIR/* $APP_DIR/
    systemctl start enviar.service
    exit 1
fi

log_info "Test de l'application..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ | grep -q "200"; then
    log_success "Application fonctionnelle"
else
    log_error "Application ne répond pas"
fi

log_success "Déploiement terminé avec succès!"
echo ""
echo "📋 Informations :"
echo "• Backup créé dans : $BACKUP_DIR"
echo "• Application accessible sur : http://localhost"
echo "• Logs : journalctl -u enviar.service -f"
echo ""
echo "🔄 Pour les prochaines mises à jour :"
echo "1. Faites vos modifications localement"
echo "2. git add . && git commit -m 'message' && git push"
echo "3. Exécutez ce script sur le serveur" 