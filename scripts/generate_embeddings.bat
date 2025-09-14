@echo off
REM Script de génération des embeddings CFA pour RAMAdvisor
REM Ce script lance le processus de création des embeddings à partir du PDF CFA

echo ==========================================
echo 🎓 GENERATION EMBEDDINGS CFA - RAMAdvisor
echo ==========================================
echo.

REM Vérification de Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python n'est pas installé ou accessible
    echo Installez Python depuis https://python.org
    pause
    exit /b 1
)

echo ✅ Python détecté

REM Vérification du fichier PDF
if not exist "..\docs\knowledge\course.pdf" (
    echo ❌ Fichier course.pdf non trouvé dans docs\knowledge\
    echo Placez le PDF du cours CFA dans ce répertoire
    pause
    exit /b 1
)

echo ✅ Fichier PDF CFA trouvé

REM Installation des dépendances
echo.
echo 📦 Installation des dépendances...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)

echo ✅ Dépendances installées

REM Exécution du script de génération
echo.
echo 🚀 Génération des embeddings CFA...
python generate_cfa_embeddings.py

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo ✅ GÉNÉRATION RÉUSSIE !
    echo ==========================================
    echo.
    echo Les fichiers suivants ont été créés:
    echo - cfa_knowledge_embeddings.json
    echo - cfa_embedding_config.json  
    echo - cfa_search_index.json
    echo - cfa_stats.json
    echo.
    echo 🔗 Prêt pour déploiement Netlify !
) else (
    echo ❌ Erreur lors de la génération
)

echo.
pause
