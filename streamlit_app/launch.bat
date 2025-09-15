@echo off
echo =================================
echo RAMAdvisor Streamlit App - Lancement Rapide
echo =================================
echo.

echo Verification Python...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Erreur: Python non trouve. Installez Python 3.8+ d'abord.
    pause
    exit /b 1
)

echo.
echo Installation des dependances...
pip install streamlit google-generativeai --user --quiet

echo.
echo Lancement de l'application...
echo L'app va s'ouvrir dans votre navigateur sur http://localhost:8501
echo.
echo Appuyez sur Ctrl+C pour arreter l'application.
echo.

streamlit run app.py