# Script de déploiement Git automatique
# Auteur: Assistant IA

Write-Host "🚀 Déploiement Git automatique pour Enviar" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Couleurs
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Fonction pour afficher les messages
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Vérifier que Git est installé
Write-Info "Vérification de Git..."
try {
    $gitVersion = git --version
    Write-Success "Git détecté: $gitVersion"
} catch {
    Write-Error "Git n'est pas installé ou n'est pas dans le PATH"
    exit 1
}

# Vérifier l'état du dépôt
Write-Info "Vérification de l'état du dépôt Git..."
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Info "Fichiers modifiés détectés:"
    $gitStatus | ForEach-Object { Write-Host "  $_" -ForegroundColor $White }
} else {
    Write-Warning "Aucun fichier modifié détecté"
}

# Ajouter tous les fichiers
Write-Info "Ajout de tous les fichiers au staging..."
git add .

# Vérifier ce qui a été ajouté
Write-Info "Fichiers ajoutés au staging:"
git diff --cached --name-only | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor $Green }

# Créer le commit
Write-Info "Création du commit..."
$commitMessage = Get-Content "commit_message.txt" -Raw
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Success "Commit créé avec succès!"
} else {
    Write-Error "Erreur lors de la création du commit"
    exit 1
}

# Vérifier la branche actuelle
Write-Info "Vérification de la branche actuelle..."
$currentBranch = git branch --show-current
Write-Info "Branche actuelle: $currentBranch"

# Pousser vers GitHub
Write-Info "Poussée vers GitHub..."
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Success "Code poussé vers GitHub avec succès!"
} else {
    Write-Error "Erreur lors de la poussée vers GitHub"
    exit 1
}

# Afficher le résumé
Write-Host ""
Write-Success "🎉 Déploiement Git terminé avec succès!"
Write-Host ""
Write-Host "📋 Résumé des actions effectuées:" -ForegroundColor $White
Write-Host "• ✅ Fichiers ajoutés au staging" -ForegroundColor $Green
Write-Host "• ✅ Commit créé avec le message de sécurisation" -ForegroundColor $Green
Write-Host "• ✅ Code poussé vers GitHub" -ForegroundColor $Green
Write-Host ""
Write-Host "🔄 Prochaines étapes:" -ForegroundColor $Yellow
Write-Host "1. Connectez-vous à votre serveur de production" -ForegroundColor $White
Write-Host "2. Exécutez le script de déploiement approprié" -ForegroundColor $White
Write-Host "3. Verifiez que l'application fonctionne" -ForegroundColor $White
Write-Host ""
Write-Host "🌐 Votre code sécurisé est maintenant disponible sur GitHub!" -ForegroundColor $Green

# Nettoyer le fichier temporaire
if (Test-Path "commit_message.txt") {
    Remove-Item "commit_message.txt"
    Write-Info "Fichier temporaire nettoyé"
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor $Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
