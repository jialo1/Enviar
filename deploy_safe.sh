#!/bin/bash

# Script de déploiement sécurisé local
# Auteur: Assistant IA

set -e

echo "🛡️ Déploiement sécurisé local"
echo "=============================="

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
BACKUP_DIR="/opt/enviar_backup_$(date +%Y%m%d_%H%M%S)"
CURRENT_DIR=$(pwd)

# Vérifier si on est root
if [[ $EUID -ne 0 ]]; then
   log_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

# Vérifier les prérequis
log_info "Vérification des prérequis..."
if ! command -v python3 &> /dev/null; then
    log_error "Python3 n'est pas installé"
    exit 1
fi

log_success "Prérequis vérifiés"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "app.py" ] || [ ! -f "requirements.txt" ]; then
    log_error "Ce script doit être exécuté depuis le répertoire de l'application"
    exit 1
fi

log_info "Arrêt des services..."
systemctl stop enviar.service 2>/dev/null || true

log_info "Création du backup..."
mkdir -p $BACKUP_DIR
if [ -d "$APP_DIR" ]; then
    cp -r $APP_DIR/* $BACKUP_DIR/ 2>/dev/null || true
    log_success "Backup créé dans $BACKUP_DIR"
else
    log_warning "Répertoire de destination n'existe pas encore"
fi

log_info "Sauvegarde de la configuration..."
if [ -f "$APP_DIR/gunicorn.conf.py" ]; then
    cp $APP_DIR/gunicorn.conf.py $BACKUP_DIR/ 2>/dev/null || true
fi
if [ -f "$APP_DIR/enviar.service" ]; then
    cp $APP_DIR/enviar.service $BACKUP_DIR/ 2>/dev/null || true
fi

log_info "Création du répertoire de destination..."
mkdir -p $APP_DIR

log_info "Copie des fichiers..."
cp -r * $APP_DIR/
cp -r .* $APP_DIR/ 2>/dev/null || true

log_info "Restauration de la configuration..."
if [ -f "$BACKUP_DIR/gunicorn.conf.py" ]; then
    cp $BACKUP_DIR/gunicorn.conf.py $APP_DIR/
fi
if [ -f "$BACKUP_DIR/enviar.service" ]; then
    cp $BACKUP_DIR/enviar.service $APP_DIR/
fi

log_info "Configuration des permissions..."
chown -R root:root $APP_DIR
chmod -R 755 $APP_DIR
chmod +x $APP_DIR/*.py 2>/dev/null || true
chmod +x $APP_DIR/*.sh 2>/dev/null || true

log_info "Installation des dépendances..."
cd $APP_DIR

# Vérifier si l'environnement virtuel existe
if [ ! -d ".venv" ]; then
    log_info "Création de l'environnement virtuel..."
    python3 -m venv .venv
    log_success "Environnement virtuel créé"
fi

# Activer l'environnement virtuel
log_info "Activation de l'environnement virtuel..."
source .venv/bin/activate

# Installer les dépendances
log_info "Installation des packages Python..."
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
    if [ -d "$BACKUP_DIR" ]; then
        cp -r $BACKUP_DIR/* $APP_DIR/
    fi
    systemctl start enviar.service
    exit 1
fi

log_info "Test de l'application..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ | grep -q "200"; then
    log_success "Application fonctionnelle"
else
    log_error "Application ne répond pas"
    log_warning "Vérifiez les logs: journalctl -u enviar.service -f"
fi

log_success "Déploiement terminé avec succès!"
echo ""
echo "📋 Informations :"
echo "• Backup créé dans : $BACKUP_DIR"
echo "• Application accessible sur : http://localhost"
echo "• Logs : journalctl -u enviar.service -f"
echo ""
echo "🛡️ Ce déploiement est sécurisé car il :"
echo "• Ne supprime pas complètement le répertoire"
echo "• Crée un backup avant modification"
echo "• Restaure automatiquement en cas d'erreur"
echo "• Utilise les fichiers locaux (pas de GitHub)" 