#!/bin/bash

# Script de résolution rapide pour les erreurs 502 Bad Gateway
# Auteur: Assistant IA

set -e

echo "🔧 Résolution rapide de l'erreur 502 Bad Gateway"
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

log_info "Étape 1: Vérification des services..."

# Vérifier le statut des services
if systemctl is-active --quiet enviar.service; then
    log_success "Service enviar: ACTIF"
else
    log_warning "Service enviar: INACTIF - Redémarrage..."
    systemctl start enviar.service
fi

if systemctl is-active --quiet nginx; then
    log_success "Service nginx: ACTIF"
else
    log_warning "Service nginx: INACTIF - Redémarrage..."
    systemctl start nginx
fi

log_info "Étape 2: Redémarrage des services..."

# Redémarrer les services
log_info "Redémarrage du service enviar..."
systemctl restart enviar.service

log_info "Redémarrage de nginx..."
systemctl reload nginx

log_info "Étape 3: Attente du démarrage..."
sleep 10

log_info "Étape 4: Vérification du port 8000..."

# Vérifier si le port 8000 est en écoute
if netstat -tlnp | grep -q ":8000"; then
    log_success "Port 8000 en écoute"
else
    log_error "Port 8000 non en écoute - Problème avec Gunicorn"
    log_info "Vérification des logs..."
    journalctl -u enviar.service --no-pager -n 20
    exit 1
fi

log_info "Étape 5: Test de l'application..."

# Test de l'application
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 http://localhost:8000/ | grep -q "200"; then
    log_success "Application répond correctement sur le port 8000"
else
    log_error "Application ne répond pas sur le port 8000"
    log_info "Vérification des logs..."
    journalctl -u enviar.service --no-pager -n 20
    exit 1
fi

log_info "Étape 6: Test via nginx..."

# Test via nginx
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 http://localhost/ | grep -q "200"; then
    log_success "Application accessible via nginx"
else
    log_warning "Application non accessible via nginx"
    log_info "Vérification de la configuration nginx..."
    nginx -t
fi

log_info "Étape 7: Vérification des ressources système..."

# Vérifier l'espace disque
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log_warning "Utilisation disque élevée: ${DISK_USAGE}%"
else
    log_success "Espace disque OK: ${DISK_USAGE}%"
fi

# Vérifier la mémoire
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    log_warning "Utilisation mémoire élevée: ${MEMORY_USAGE}%"
else
    log_success "Mémoire OK: ${MEMORY_USAGE}%"
fi

echo ""
log_success "✅ Résolution terminée!"
echo ""
echo "📋 Statut final:"
echo "================"
echo "• Service enviar: $(systemctl is-active enviar.service)"
echo "• Service nginx: $(systemctl is-active nginx)"
echo "• Port 8000: $(netstat -tlnp | grep :8000 >/dev/null && echo 'EN ÉCOUTE' || echo 'FERMÉ')"
echo "• Application: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ 2>/dev/null || echo 'ERREUR')"
echo ""
echo "🔍 Pour plus de détails, utilisez:"
echo "• journalctl -u enviar.service -f"
echo "• python3 diagnostic_502.py"
echo ""

# Si tout va bien, proposer d'activer le moniteur
if systemctl is-active --quiet enviar.service && systemctl is-active --quiet nginx; then
    echo "💡 Voulez-vous activer la surveillance automatique? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log_info "Activation du service de monitoring..."
        systemctl enable enviar-monitor.service 2>/dev/null || true
        systemctl start enviar-monitor.service 2>/dev/null || true
        log_success "Surveillance automatique activée!"
    fi
fi 