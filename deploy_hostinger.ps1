Write-Host "=== Déploiement sur Hostinger ===" -ForegroundColor Green

# Vérifier que tous les fichiers nécessaires sont présents
Write-Host "Vérification des fichiers..." -ForegroundColor Yellow

$requiredFiles = @(
    "app.py",
    "passenger_wsgi.py", 
    "requirements.txt",
    ".htaccess",
    "taux.json"
)

$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file manquant" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "Erreur: Fichiers manquants!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Tous les fichiers nécessaires sont présents" -ForegroundColor Green

# Instructions pour l'upload
Write-Host "`n=== INSTRUCTIONS POUR HOSTINGER ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Connectez-vous à votre panneau de contrôle Hostinger" -ForegroundColor White
Write-Host "2. Allez dans 'Gestionnaire de fichiers' ou utilisez FTP" -ForegroundColor White
Write-Host "3. Naviguez vers le dossier public_html de votre domaine" -ForegroundColor White
Write-Host "4. Uploadez TOUS les fichiers de ce projet dans public_html" -ForegroundColor White
Write-Host ""
Write-Host "Fichiers essentiels à uploader :" -ForegroundColor Yellow
Write-Host "  - app.py" -ForegroundColor White
Write-Host "  - passenger_wsgi.py" -ForegroundColor White
Write-Host "  - requirements.txt" -ForegroundColor White
Write-Host "  - .htaccess" -ForegroundColor White
Write-Host "  - templates/ (dossier complet)" -ForegroundColor White
Write-Host "  - static/ (dossier complet)" -ForegroundColor White
Write-Host "  - taux.json" -ForegroundColor White
Write-Host ""
Write-Host "5. Dans le panneau Hostinger, allez dans 'Hébergement Web' > 'Python'" -ForegroundColor White
Write-Host "6. Activez Python pour votre domaine" -ForegroundColor White
Write-Host "7. Définissez le point d'entrée : passenger_wsgi.py" -ForegroundColor White
Write-Host "8. Redémarrez l'application" -ForegroundColor White
Write-Host ""
Write-Host "=== CONFIGURATION DNS ===" -ForegroundColor Cyan
Write-Host "Assurez-vous que votre domaine enviartransfert.com pointe vers :" -ForegroundColor White
Write-Host "  - Les serveurs de noms Hostinger, OU" -ForegroundColor White
Write-Host "  - Un enregistrement A pointant vers l'IP de votre hébergement" -ForegroundColor White
Write-Host ""
Write-Host "=== VÉRIFICATION ===" -ForegroundColor Cyan
Write-Host "Après le déploiement, testez :" -ForegroundColor White
Write-Host "  - https://enviartransfert.com" -ForegroundColor White
Write-Host "  - https://www.enviartransfert.com" -ForegroundColor White
Write-Host ""
Write-Host "Si vous avez des erreurs, vérifiez les logs dans le panneau Hostinger" -ForegroundColor Yellow 