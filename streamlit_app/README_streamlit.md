# 🚀 RAMAdvisor - Application Streamlit

Une application Streamlit qui reproduit fidèlement la simulation d'investissement de votre site RAMAdvisor, utilisant la même logique et les mêmes templates.

## ✨ Fonctionnalités

- **Interface utilisateur intuitive** avec Streamlit
- **Même logique que le site web** : template V3, filtrage knowledge base, API Gemini
- **Conseils personnalisés** basés sur le profil de risque
- **Design responsive** avec CSS personnalisé
- **Configuration flexible** des clés API (fichier .env ou interface)
- **Téléchargement des résultats**

## 📋 Prérequis

- Python 3.8 ou plus récent
- Une clé API Google Gemini
- Les fichiers `knowledge_base.txt` et `prompt_template_v3.md` (inclus)

## 🛠️ Installation Simple

### Méthode rapide (recommandée)
Double-cliquez sur `launch.bat` - le script installera automatiquement les dépendances et lancera l'application.

### Installation manuelle
```bash
cd "g:\Drive partagés\BLACKROB\5. web\RAMAdvisor\streamlit_app"
pip install streamlit google-generativeai
streamlit run app.py
```

## 🔑 Configuration de l'API

**Option 1 : Via l'interface (recommandée)**
- Lancez l'application
- Entrez votre clé API Gemini directement dans la barre latérale

**Option 2 : Fichier .env**
Créez un fichier `.env` avec :
```env
GOOGLE_API_KEY=votre_cle_api_gemini_ici
```

## 🚀 Lancement de l'application

```bash
streamlit run app.py
```

L'application sera accessible à l'adresse : `http://localhost:8501`

## 📱 Utilisation

1. **Configuration** : Entrez votre clé API Gemini dans la sidebar (si non configurée dans .env)
2. **Objectif** : Décrivez votre objectif d'investissement
3. **Profil de risque** : Sélectionnez Prudent, Équilibré ou Audacieux
4. **Montants** : Définissez votre montant initial et versements mensuels
5. **Horizon** : Choisissez votre durée d'investissement
6. **Génération** : Cliquez sur "Générer ma Simulation"

## 🔧 Structure du projet

```
streamlit_app/
├── app.py                    # Application principale Streamlit
├── launch.bat               # Script de lancement rapide
├── requirements.txt         # Dépendances Python minimales
├── knowledge_base.txt       # Base de connaissances CFA
├── prompt_template_v3.md    # Template de prompt V3
└── README_streamlit.md      # Cette documentation
```

## ⚡ Fonctionnalités avancées

### Logique identique au site web
- **Template V3** : Utilise le même `prompt_template_v3.md`
- **Knowledge base** : Filtrage intelligent selon le profil de risque
- **API Gemini** : Même modèle configurable que le site (`GEMINI_MODEL`, défaut: `gemini-flash-lite-latest`)
- **Validation** : Mêmes critères de qualité des réponses

### Interface utilisateur
- **Design moderne** avec CSS personnalisé
- **Responsive** : fonctionne sur mobile et desktop
- **Feedback en temps réel** : indicateurs de progression
- **Messages d'erreur** : gestion élégante des erreurs
- **Cache intelligent** : optimisation des performances

### Sécurité
- **Clés API flexibles** : via interface ou fichier .env
- **Validation des entrées** : vérification des données utilisateur
- **Gestion d'erreurs** : traitement robuste des exceptions

## 🐛 Dépannage

### Erreur "Fichier non trouvé"
Vérifiez que les fichiers `knowledge_base.txt` et `prompt_template_v3.md` sont présents dans le dossier parent.

### Erreur API Gemini
- Vérifiez que votre clé API est valide
- Assurez-vous d'avoir des crédits Gemini disponibles
- Vérifiez votre connexion internet

### Problèmes d'installation
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## 🚀 Déploiement

### Streamlit Cloud
1. Pushez votre code sur GitHub
2. Connectez-vous à [Streamlit Cloud](https://streamlit.io/cloud)
3. Déployez depuis votre repository
4. Configurez les secrets (GEMINI_API_KEY) dans les paramètres

### Heroku
1. Créez un `Procfile` :
```
web: streamlit run app.py --server.port=$PORT --server.address=0.0.0.0
```

2. Déployez avec les variables d'environnement appropriées

## 📊 Comparaison avec le site web

| Fonctionnalité | Site Web | App Streamlit |
|---|---|---|
| Template V3 | ✅ | ✅ |
| Knowledge base | ✅ | ✅ |
| API Gemini | ✅ | ✅ |
| Profils de risque | ✅ | ✅ |
| Interface utilisateur | HTML/CSS/JS | Streamlit |
| Hébergement | Netlify | Streamlit Cloud |

## 🤝 Contribution

Pour contribuer à cette application :
1. Forkez le projet
2. Créez une branche feature
3. Committez vos changements
4. Créez une Pull Request

## 📞 Support

Pour toute question ou problème :
- Vérifiez d'abord cette documentation
- Consultez les logs Streamlit
- Vérifiez la configuration des fichiers

## 📝 Licence

Cette application fait partie du projet RAMAdvisor et utilise les mêmes conditions.

---

💡 **Astuce** : Pour une expérience optimale, utilisez l'application en plein écran et assurez-vous d'avoir une connexion internet stable pour les appels API Gemini.