# Script de déploiement PowerShell
# Auteur: Assistant IA

Write-Host "🚀 Déploiement vers le serveur" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Demander l'IP du serveur
$SERVER_IP = Read-Host "Entrez l'IP du serveur"
$SERVER_USER = Read-Host "Entrez l'utilisateur (root)"

if ([string]::IsNullOrEmpty($SERVER_USER)) {
    $SERVER_USER = "root"
}

Write-Host ""
Write-Host "📤 Transfert des fichiers vers le serveur..." -ForegroundColor Yellow
Write-Host ""

# Créer un fichier temporaire avec les fichiers à exclure
@"
.git
venv
__pycache__
*.pyc
.env
node_modules
.DS_Store
Thumbs.db
"@ | Out-File -FilePath "exclude.txt" -Encoding UTF8

try {
    # Transférer les fichiers avec rsync (si disponible) ou scp
    if (Get-Command "rsync" -ErrorAction SilentlyContinue) {
        Write-Host "Utilisation de rsync pour le transfert..." -ForegroundColor Green
        rsync -avz --exclude-from=exclude.txt --delete ./ ${SERVER_USER}@${SERVER_IP}:/opt/enviar/
    } else {
        Write-Host "rsync non disponible, utilisation de scp..." -ForegroundColor Yellow
        
        # Créer un tar des fichiers à transférer
        Write-Host "Création de l'archive..." -ForegroundColor Yellow
        tar -czf deploy.tar.gz --exclude='.git' --exclude='venv' --exclude='__pycache__' --exclude='*.pyc' --exclude='.env' .
        
        # Transférer l'archive
        Write-Host "Transfert de l'archive..." -ForegroundColor Yellow
        scp deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/opt/
        
        # Extraire sur le serveur
        Write-Host "Extraction sur le serveur..." -ForegroundColor Yellow
        ssh ${SERVER_USER}@${SERVER_IP} "cd /opt && tar -xzf deploy.tar.gz -C enviar/ && rm deploy.tar.gz"
        
        # Nettoyer l'archive locale
        Remove-Item deploy.tar.gz
    }
    
    Write-Host ""
    Write-Host "🔧 Exécution du script de déploiement sur le serveur..." -ForegroundColor Yellow
    Write-Host ""
    
    # Se connecter au serveur et exécuter le déploiement
    ssh ${SERVER_USER}@${SERVER_IP} "cd /opt/enviar && chmod +x deploy_local.sh && sudo ./deploy_local.sh"
    
    Write-Host ""
    Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Pour vérifier:" -ForegroundColor Cyan
    Write-Host "• http://$SERVER_IP" -ForegroundColor White
    Write-Host "• ssh ${SERVER_USER}@${SERVER_IP} `"journalctl -u enviar.service -f`"" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Erreur lors du déploiement: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Nettoyer le fichier temporaire
    if (Test-Path "exclude.txt") {
        Remove-Item "exclude.txt"
    }
}

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 