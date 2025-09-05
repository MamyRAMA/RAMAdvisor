# 🚀 Guide de Déploiement Netlify

## 📋 Checklist Pré-Déploiement

### ✅ Vérifications avant déploiement :

1. **Structure des fichiers** ✅
   ```
   ├── index.html (page principale)
   ├── css/style.css
   ├── js/script.js
   ├── assets/ (images)
   └── pages/ (pages supplémentaires)
   ```

2. **Test local** ✅
   - Ouvrir `index.html` dans le navigateur
   - Vérifier que tout fonctionne
   - Tester sur mobile (F12 → mode responsive)

3. **Liens relatifs** ✅
   - Vérifier que tous les liens utilisent des chemins relatifs
   - Exemple : `css/style.css` (et non `C:\Users\...`)

---

## 🌐 Étapes de Déploiement Netlify

### 1. **Créer un compte Netlify**
- Aller sur [netlify.com](https://netlify.com)
- S'inscrire avec GitHub, GitLab ou email

### 2. **Préparer votre code**

#### Option A : Drag & Drop (Débutant recommandé)
1. Zipper tout le contenu du dossier `web` (sauf `archive/`)
2. Glisser le zip sur Netlify
3. Site déployé instantanément !

#### Option B : Git (Plus professionnel)
1. Initialiser Git dans votre projet
2. Pousser sur GitHub/GitLab
3. Connecter le dépôt à Netlify

---

## ⚙️ Configuration Netlify

### Paramètres de Build :
```
Build command: (laisser vide)
Publish directory: ./
```

### Paramètres de Site :
- **Site name** : Choisir un nom unique
- **Domain** : `votre-nom.netlify.app`
- **HTTPS** : Activé automatiquement

---

## 🔧 Commandes Git (si vous choisissez l'Option B)

### Initialisation du projet :
```powershell
# Dans le dossier web
git init
git add .
git commit -m "Premier commit - Site RAM Advisor"
```

### Liaison avec GitHub :
```powershell
# Remplacer USERNAME et REPO par vos valeurs
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

### Mises à jour futures :
```powershell
# Après chaque modification
git add .
git commit -m "Description des changements"
git push
```

---

## 🎯 Workflow de Déploiement Recommandé

### Pour débutant (Drag & Drop) :
1. Modifier les fichiers localement
2. Tester avec double-clic sur `index.html`
3. Zipper le dossier `web` (sans `archive/`)
4. Glisser sur Netlify → **Deploy**

### Pour plus avancé (Git) :
1. Modifier les fichiers
2. Tester localement
3. `git add . && git commit -m "Description"`
4. `git push` → **Auto-deploy**

---

## 🌍 Domaine Personnalisé

### Domaine .fr (recommandé pour votre business) :
1. Acheter sur Gandi, OVH, ou Namecheap
2. Dans Netlify : **Domain settings**
3. Ajouter votre domaine
4. Configurer les DNS :
   ```
   Type: CNAME
   Name: www
   Value: votre-site.netlify.app
   
   Type: A
   Name: @
   Value: 75.2.60.5
   ```

---

## 📊 Monitoring Post-Déploiement

### URLs à vérifier :
- `https://votre-site.netlify.app`
- `https://www.votre-domaine.fr` (si domaine personnalisé)

### Tests à effectuer :
- ✅ Page se charge correctement
- ✅ Styles CSS appliqués
- ✅ JavaScript fonctionne
- ✅ Formulaires de contact
- ✅ Responsive design (mobile/tablet)

### Analytics (optionnel) :
- Google Analytics
- Netlify Analytics (payant)

---

## 🚨 Résolution de Problèmes Courants

### Site ne s'affiche pas :
1. Vérifier `index.html` à la racine
2. Vérifier les chemins CSS/JS
3. Consulter les logs Netlify

### CSS ne se charge pas :
1. Vérifier le chemin : `css/style.css`
2. Vérifier la casse (sensible)
3. Regarder la console du navigateur (F12)

### Erreur 404 sur les pages :
1. Vérifier l'existence du fichier
2. Vérifier l'extension `.html`
3. Configurer les redirections si nécessaire

---

## 📞 Support

- **Documentation Netlify** : [docs.netlify.com](https://docs.netlify.com)
- **Communauté** : [community.netlify.com](https://community.netlify.com)
- **Status** : [netlifystatus.com](https://netlifystatus.com)

---

*🎉 Une fois déployé, votre site sera accessible 24h/24 dans le monde entier !*
