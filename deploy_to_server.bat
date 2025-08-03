@echo off
echo 🚀 Deploiement vers le serveur
echo =============================

REM Demander l'IP du serveur
set /p SERVER_IP="Entrez l'IP du serveur: "
set /p SERVER_USER="Entrez l'utilisateur (root): "

if "%SERVER_USER%"=="" set SERVER_USER=root

echo.
echo 📤 Transfert des fichiers vers le serveur...
echo.

REM Créer un fichier temporaire avec les fichiers à exclure
echo .git > exclude.txt
echo venv >> exclude.txt
echo __pycache__ >> exclude.txt
echo *.pyc >> exclude.txt
echo .env >> exclude.txt

REM Transférer les fichiers
rsync -avz --exclude-from=exclude.txt --delete ./ %SERVER_USER%@%SERVER_IP%:/opt/enviar/

REM Nettoyer le fichier temporaire
del exclude.txt

echo.
echo 🔧 Execution du script de deploiement sur le serveur...
echo.

REM Se connecter au serveur et exécuter le déploiement
ssh %SERVER_USER%@%SERVER_IP% "cd /opt/enviar && chmod +x deploy_local.sh && sudo ./deploy_local.sh"

echo.
echo ✅ Deploiement termine!
echo.
echo 📋 Pour verifier:
echo • http://%SERVER_IP%
echo • ssh %SERVER_USER%@%SERVER_IP% "journalctl -u enviar.service -f"
echo.
pause 