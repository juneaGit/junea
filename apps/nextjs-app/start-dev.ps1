# Script PowerShell pour démarrer le serveur Next.js
Write-Host "🚀 Démarrage du serveur de développement..." -ForegroundColor Green
Write-Host "📍 Répertoire: apps/nextjs-app" -ForegroundColor Yellow

# Changer de répertoire
Set-Location ".\apps\nextjs-app"

# Vérifier que le répertoire existe
if (Test-Path "package.json") {
    Write-Host "✅ Fichier package.json trouvé" -ForegroundColor Green
    
    # Démarrer le serveur
    Write-Host "🔧 Lancement de 'npm run dev'..." -ForegroundColor Cyan
    npm run dev
} else {
    Write-Host "❌ Erreur: package.json non trouvé dans le répertoire apps/nextjs-app" -ForegroundColor Red
    Write-Host "💡 Assurez-vous d'être dans le bon répertoire" -ForegroundColor Yellow
}

# Revenir au répertoire parent
Set-Location ".." 