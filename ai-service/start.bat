@echo off
echo 🚀 Installation et démarrage du service RAM Advisor AI

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python n'est pas installé ou non accessible
    echo Veuillez installer Python 3.8+ depuis https://python.org
    pause
    exit /b 1
)

echo ✅ Python détecté

REM Créer l'environnement virtuel s'il n'existe pas
if not exist "venv" (
    echo 📦 Création de l'environnement virtuel...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Erreur lors de la création de l'environnement virtuel
        pause
        exit /b 1
    )
)

REM Activer l'environnement virtuel
echo 🔧 Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

REM Installer les dépendances
echo 📥 Installation des dépendances...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)

REM Copier le fichier de configuration s'il n'existe pas
if not exist ".env" (
    echo ⚙️ Création du fichier de configuration...
    copy .env.example .env
    echo ℹ️ Vous pouvez éditer le fichier .env pour ajouter votre clé OpenAI
)

REM Vérifier si l'index existe
if not exist "indexes\faiss_index.bin" (
    echo 📚 Index non trouvé, lancement de l'ingestion des documents...
    python ingest_documents.py
    if errorlevel 1 (
        echo ❌ Erreur lors de l'ingestion des documents
        pause
        exit /b 1
    )
)

echo ✅ Configuration terminée !
echo.
echo 🌐 Démarrage du service sur http://localhost:8000
echo 💡 Appuyez sur Ctrl+C pour arrêter le service
echo.

REM Démarrer le service
python main.py
