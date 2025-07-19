@echo off
echo.
echo 🚀 Demarrage du serveur de developpement...
echo 📍 Repertoire: apps/nextjs-app
echo.

cd /d "%~dp0"

if exist "package.json" (
    echo ✅ Fichier package.json trouve
    echo 🔧 Lancement de 'npm run dev'...
    echo.
    npm run dev
) else (
    echo ❌ Erreur: package.json non trouve dans le repertoire
    echo 💡 Assurez-vous d'etre dans le bon repertoire
    pause
)

echo.
echo Serveur arrete.
pause 