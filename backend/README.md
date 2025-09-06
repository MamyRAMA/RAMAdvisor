# 🚀 RAM Advisor Backend - Version Ultra Allégée

## 📋 Description

Backend ultra-optimisé pour RAM Advisor utilisant :
- **Serveur HTTP natif Python** (pas de FastAPI)
- **Google Gemini AI** pour les conseils
- **Compatible Render gratuit** (512MB)
- **Seulement 2 dépendances**

## ⚡ Installation

```bash
# Installer les dépendances
pip install -r requirements-ultra-light.txt

# Configurer l'environnement
cp .env.example .env
# Éditez .env avec votre GEMINI_API_KEY
```

## 🚀 Démarrage

```bash
# Démarrage local
python main-ultra-light.py

# Test automatisé
.\test-ultra-light.ps1
```

## 🌐 API Endpoints

- `GET /` - Informations du service
- `GET /health` - État de santé
- `POST /simulate` - Simulation d'investissement

## 📊 Performance

- **Mémoire** : ~150MB
- **Démarrage** : 5-15 secondes
- **Compatibilité** : Python 3.7+

## 🚀 Déploiement

Voir `docs/guide-deployment-light.md` pour le déploiement sur Render.
