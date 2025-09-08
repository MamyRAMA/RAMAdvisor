@echo off
echo.
echo ========================================
echo   RAM Advisor - Generateur d'Embeddings
echo ========================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installé ou pas dans le PATH
    echo Veuillez installer Python 3.8+ depuis https://python.org
    pause
    exit /b 1
)

echo [INFO] Python detecte, verification des dependances...

REM Installer les dépendances si nécessaire
echo [INFO] Installation des dependances...
pip install -r requirements.txt

if errorlevel 1 (
    echo [ERREUR] Impossible d'installer les dependances
    pause
    exit /b 1
)

echo.
echo [INFO] Lancement de la generation des embeddings...
echo.

REM Exécuter le script de génération
python generate_static_embeddings.py

echo.
if errorlevel 1 (
    echo [ERREUR] La generation a echoue
) else (
    echo [SUCCES] Generation terminee avec succes!
    echo.
    echo Les fichiers suivants ont ete generes dans ../frontend/data/ :
    echo - knowledge_embeddings.json
    echo - embedding_config.json  
    echo - search_index.json
    echo.
    echo Vous pouvez maintenant utiliser votre frontend avec la recherche vectorielle!
)

echo.
pause
