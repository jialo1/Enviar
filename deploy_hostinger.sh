#!/bin/bash

echo "=== Déploiement sur Hostinger ==="

# Vérifier que tous les fichiers nécessaires sont présents
echo "Vérification des fichiers..."

if [ ! -f "app.py" ]; then
    echo "❌ app.py manquant"
    exit 1
fi

if [ ! -f "passenger_wsgi.py" ]; then
    echo "❌ passenger_wsgi.py manquant"
    exit 1
fi

if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt manquant"
    exit 1
fi

if [ ! -f ".htaccess" ]; then
    echo "❌ .htaccess manquant"
    exit 1
fi

echo "✅ Tous les fichiers nécessaires sont présents"

# Instructions pour l'upload
echo ""
echo "=== INSTRUCTIONS POUR HOSTINGER ==="
echo ""
echo "1. Connectez-vous à votre panneau de contrôle Hostinger"
echo "2. Allez dans 'Gestionnaire de fichiers' ou utilisez FTP"
echo "3. Naviguez vers le dossier public_html de votre domaine"
echo "4. Uploadez TOUS les fichiers de ce projet dans public_html"
echo ""
echo "Fichiers essentiels à uploader :"
echo "  - app.py"
echo "  - passenger_wsgi.py"
echo "  - requirements.txt"
echo "  - .htaccess"
echo "  - templates/ (dossier complet)"
echo "  - static/ (dossier complet)"
echo "  - taux.json"
echo ""
echo "5. Dans le panneau Hostinger, allez dans 'Hébergement Web' > 'Python'"
echo "6. Activez Python pour votre domaine"
echo "7. Définissez le point d'entrée : passenger_wsgi.py"
echo "8. Redémarrez l'application"
echo ""
echo "=== CONFIGURATION DNS ==="
echo "Assurez-vous que votre domaine enviartransfert.com pointe vers :"
echo "  - Les serveurs de noms Hostinger, OU"
echo "  - Un enregistrement A pointant vers l'IP de votre hébergement"
echo ""
echo "=== VÉRIFICATION ==="
echo "Après le déploiement, testez :"
echo "  - https://enviartransfert.com"
echo "  - https://www.enviartransfert.com"
echo ""
echo "Si vous avez des erreurs, vérifiez les logs dans le panneau Hostinger" 