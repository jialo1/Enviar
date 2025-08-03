#!/bin/bash
# Script de déploiement pour serveur Linux

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage du déploiement..."

# Vérifier si on est dans le bon répertoire
if [ ! -f "app.py" ]; then
    echo "❌ Erreur: app.py non trouvé. Assurez-vous d'être dans le répertoire de l'application."
    exit 1
fi

# Créer l'environnement virtuel s'il n'existe pas
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source venv/bin/activate

# Mettre à jour pip
echo "⬆️ Mise à jour de pip..."
pip install --upgrade pip

# Installer les dépendances
echo "📚 Installation des dépendances..."
pip install -r requirements.txt

# Vérifier que Gunicorn est installé
if ! command -v gunicorn &> /dev/null; then
    echo "❌ Erreur: Gunicorn n'est pas installé"
    exit 1
fi

echo "✅ Installation terminée avec succès!"

# Démarrer l'application
echo "🚀 Démarrage de l'application avec Gunicorn..."
gunicorn -c gunicorn.conf.py wsgi:app 