# 📚 Index de la Documentation

## 🎯 Guide de Démarrage Rapide

### Pour commencer immédiatement :
1. **Prévisualiser le site** → [Guide de Prévisualisation](guide-previsualisation.md)
2. **Déployer sur Internet** → [Guide Déploiement Netlify](guide-deploiement-netlify.md)
3. **Maintenir le site** → [Guide de Maintenance](guide-maintenance.md)

---

## 📖 Documentation Complète

### 🔍 [Guide de Prévisualisation](guide-previsualisation.md)
**Quand l'utiliser :** Avant chaque session de développement
- Comment prévisualiser votre site localement
- Différences entre les méthodes (double-clic vs Live Server)
- Vérification que les serveurs sont arrêtés
- Impact mémoire de chaque méthode

### 🚀 [Guide Déploiement Netlify](guide-deploiement-netlify.md)
**Quand l'utiliser :** Pour mettre le site en ligne
- Checklist pré-déploiement
- Configuration Netlify étape par étape
- Options Git vs Drag & Drop
- Configuration domaine personnalisé
- Résolution des problèmes courants

### 🛠️ [Guide de Maintenance](guide-maintenance.md)
**Quand l'utiliser :** Pour l'entretien régulier
- Routine quotidienne/hebdomadaire/mensuelle
- Tests à effectuer régulièrement
- Stratégie de backup
- Monitoring du site
- Plan d'urgence

### 📜 [Scripts PowerShell](scripts-powershell.md)
**Quand l'utiliser :** Pour automatiser les tâches répétitives
- Script de vérification des serveurs
- Script de backup automatique
- Script de nettoyage du projet
- Script de test du site

---

## 🎓 Niveau de Difficulté

### 🟢 **Débutant** (Commencez ici)
1. [Guide de Prévisualisation](guide-previsualisation.md) - Section "Méthode Simple"
2. [Guide Déploiement](guide-deploiement-netlify.md) - Section "Drag & Drop"

### 🟡 **Intermédiaire**
1. [Guide de Maintenance](guide-maintenance.md) - Toutes les sections
2. [Guide Déploiement](guide-deploiement-netlify.md) - Section "Git"

### 🔴 **Avancé**
1. [Scripts PowerShell](scripts-powershell.md) - Automatisation
2. Configuration Git complète
3. Optimisation des performances

---

## 🚨 Aide Rapide

### **Problème le plus courant :**
> *"Mon site ne se met pas à jour"*

**Solution :** 
1. Vérifier que Live Server est arrêté → [Guide Prévisualisation](guide-previsualisation.md)
2. Actualiser le navigateur (Ctrl+F5)
3. Vider le cache navigateur

### **Commandes d'urgence :**
```powershell
# Vérifier les serveurs actifs
netstat -ano | findstr :5500

# Ouvrir le site rapidement
start index.html

# Backup d'urgence (copier-coller dans PowerShell)
Copy-Item -Path "." -Destination "backup-$(Get-Date -Format 'yyyy-MM-dd')" -Recurse
```

---

## 📞 Ressources Externes

### **Support Technique :**
- **Netlify Docs :** [docs.netlify.com](https://docs.netlify.com)
- **VS Code Docs :** [code.visualstudio.com/docs](https://code.visualstudio.com/docs)
- **PowerShell Help :** `Get-Help` dans PowerShell

### **Apprentissage :**
- **HTML/CSS :** [w3schools.com](https://w3schools.com)
- **JavaScript :** [developer.mozilla.org](https://developer.mozilla.org)
- **Git :** [learngitbranching.js.org](https://learngitbranching.js.org)

---

## 🔄 Workflow Recommandé

### **Session de développement type :**
1. **Vérifier** → `netstat -ano | findstr :5500`
2. **Développer** → Utiliser Live Server
3. **Tester** → Différents navigateurs/tailles
4. **Arrêter** → Live Server (important !)
5. **Sauvegarder** → Backup si grosses modifications
6. **Déployer** → Si tout fonctionne

### **Maintenance hebdomadaire :**
1. **Vérifier** → Site en ligne fonctionne
2. **Nettoyer** → Fichiers temporaires
3. **Sauvegarder** → Backup complet
4. **Surveiller** → Performance du site

---

## 📋 Checklist du Débutant

### **À faire avant de commencer :**
- [ ] Lire le [Guide de Prévisualisation](guide-previsualisation.md)
- [ ] Installer l'extension Live Server dans VS Code
- [ ] Tester l'ouverture de `index.html` par double-clic
- [ ] Comprendre comment arrêter Live Server

### **À faire avant le premier déploiement :**
- [ ] Lire le [Guide Déploiement](guide-deploiement-netlify.md)
- [ ] Créer un compte Netlify
- [ ] Tester le site localement sur mobile (F12)
- [ ] Préparer le dossier (sans archive/)

### **À mettre en place rapidement :**
- [ ] Routine de backup régulier
- [ ] Surveillance du site déployé
- [ ] Carnet de modifications

---

*📖 Gardez cet index ouvert dans un onglet pour naviguer rapidement dans la documentation !*

---

## 🏗️ Structure du Projet

```
📁 web/
├── 📄 index.html                    # 🎯 Site principal
├── 📄 README.md                     # 📖 Documentation projet
├── 📁 css/ → style.css              # 🎨 Styles
├── 📁 js/ → script.js               # ⚡ JavaScript
├── 📁 assets/                       # 🖼️ Images, ressources
├── 📁 pages/                        # 📄 Pages supplémentaires
├── 📁 docs/ ← VOUS ÊTES ICI         # 📚 Documentation complète
│   ├── guide-previsualisation.md    # 🔍 Comment prévisualiser
│   ├── guide-deploiement-netlify.md # 🚀 Comment déployer
│   ├── guide-maintenance.md         # 🛠️ Comment maintenir
│   ├── scripts-powershell.md        # 📜 Scripts utiles
│   └── index.md                     # 📋 Ce fichier
└── 📁 archive/                      # 🗃️ Anciennes versions
```
