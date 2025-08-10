@echo off
echo 🚀 Deploiement Git automatique pour Enviar
echo ==========================================
echo.

REM Vérifier que Git est installé
echo [INFO] Verification de Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git n'est pas installe ou n'est pas dans le PATH
    pause
    exit /b 1
)
echo [SUCCESS] Git detecte

REM Vérifier l'état du dépôt
echo [INFO] Verification de l'etat du depot Git...
git status --porcelain > temp_status.txt
if %errorlevel% neq 0 (
    echo [ERROR] Erreur lors de la verification du statut Git
    pause
    exit /b 1
)

REM Afficher les fichiers modifiés
echo [INFO] Fichiers modifies detectes:
type temp_status.txt
if %errorlevel% neq 0 (
    echo [WARNING] Aucun fichier modifie detecte
)

REM Ajouter tous les fichiers
echo [INFO] Ajout de tous les fichiers au staging...
git add .
if %errorlevel% neq 0 (
    echo [ERROR] Erreur lors de l'ajout des fichiers
    pause
    exit /b 1
)

REM Vérifier ce qui a été ajouté
echo [INFO] Fichiers ajoutes au staging:
git diff --cached --name-only
if %errorlevel% neq 0 (
    echo [ERROR] Erreur lors de la verification des fichiers ajoutes
    pause
    exit /b 1
)

REM Créer le commit
echo [INFO] Creation du commit...
git commit -m "🛡️ Sécurisation complète de l'application Enviar

✅ Corrections de sécurité majeures :
- Suppression des identifiants hardcodés
- Ajout de logging et gestion d'erreurs robuste
- Configuration externalisée (config.py)
- Validation des données d'entrée
- Gestion sécurisée des sessions et cookies
- Amélioration de la robustesse générale

🔧 Fichiers modifiés :
- app.py (sécurisation complète)
- config.py (nouveau fichier de configuration)
- requirements.txt (ajout python-dotenv)
- .env (variables d'environnement)

🚀 Prêt pour le déploiement en production !"

if %errorlevel% neq 0 (
    echo [ERROR] Erreur lors de la creation du commit
    pause
    exit /b 1
)
echo [SUCCESS] Commit cree avec succes!

REM Vérifier la branche actuelle
echo [INFO] Verification de la branche actuelle...
for /f "tokens=2" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo [INFO] Branche actuelle: %CURRENT_BRANCH%

REM Pousser vers GitHub
echo [INFO] Poussee vers GitHub...
git push origin %CURRENT_BRANCH%
if %errorlevel% neq 0 (
    echo [ERROR] Erreur lors de la poussee vers GitHub
    pause
    exit /b 1
)
echo [SUCCESS] Code pousse vers GitHub avec succes!

REM Afficher le résumé
echo.
echo [SUCCESS] 🎉 Deploiement Git termine avec succes!
echo.
echo 📋 Resume des actions effectuees:
echo • ✅ Fichiers ajoutes au staging
echo • ✅ Commit cree avec le message de securisation
echo • ✅ Code pousse vers GitHub
echo.
echo 🔄 Prochaines etapes:
echo 1. Connectez-vous a votre serveur de production
echo 2. Executez le script de deploiement approprie
echo 3. Verifiez que l'application fonctionne
echo.
echo 🌐 Votre code securise est maintenant disponible sur GitHub!
echo.

REM Nettoyer les fichiers temporaires
if exist temp_status.txt del temp_status.txt
if exist commit_message.txt del commit_message.txt
echo [INFO] Fichiers temporaires nettoyes

echo.
echo Appuyez sur une touche pour continuer...
pause >nul
