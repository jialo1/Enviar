#!/bin/bash
# Script de démarrage pour la production

# Activer l'environnement virtuel si il existe
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Installer les dépendances
pip install -r requirements.txt

# Démarrer Gunicorn
gunicorn -c gunicorn.conf.py wsgi:app 