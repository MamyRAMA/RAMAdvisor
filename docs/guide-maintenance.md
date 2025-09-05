# 🛠️ Guide de Maintenance du Site Web

## 📅 Routine de Maintenance Régulière

### **Quotidienne** (si développement actif)
- [ ] Sauvegarder les fichiers modifiés
- [ ] Tester les modifications localement
- [ ] Vérifier que Live Server est arrêté après usage

### **Hebdomadaire**
- [ ] Vérifier que le site en ligne fonctionne
- [ ] Nettoyer les fichiers temporaires
- [ ] Organiser les nouveaux assets

### **Mensuelle**
- [ ] Backup complet du projet
- [ ] Vérifier les performances du site
- [ ] Mettre à jour la documentation
- [ ] Vérifier les liens externes

---

## 📁 Structure de Fichiers à Maintenir

### **Fichiers de Production** (à ne pas toucher sans raison) :
```
✅ index.html          # Page principale
✅ css/style.css       # Styles du site
✅ js/script.js        # Fonctionnalités JavaScript
✅ assets/             # Images et ressources
✅ pages/              # Pages supplémentaires
```

### **Fichiers de Développement** :
```
📁 docs/               # Documentation (ce dossier)
📁 archive/            # Anciennes versions
📄 README.md           # Documentation principale
📄 web.code-workspace  # Configuration VS Code
```

---

## ✏️ Workflow de Modification

### **Pour une petite modification** (texte, couleur) :
1. **Backup** : Copier le fichier avant modification
2. **Modifier** : Faire le changement
3. **Tester** : Double-clic sur `index.html`
4. **Déployer** : Upload sur Netlify si OK

### **Pour une grosse modification** (nouvelle section) :
1. **Créer une branche** (si Git)
2. **Développer** avec Live Server
3. **Tester** sur plusieurs navigateurs
4. **Merger** et déployer

---

## 🔍 Tests à Effectuer Régulièrement

### **Tests Fonctionnels** :
- [ ] Tous les liens fonctionnent
- [ ] Formulaires s'envoient correctement
- [ ] JavaScript n'a pas d'erreurs (F12 → Console)
- [ ] Images se chargent

### **Tests Responsive** :
- [ ] Mobile (iPhone/Android)
- [ ] Tablet (iPad)
- [ ] Desktop (différentes tailles)

### **Tests Performance** :
- [ ] Temps de chargement < 3 secondes
- [ ] Images optimisées
- [ ] CSS/JS minifiés (pour plus tard)

---

## 📊 Monitoring du Site

### **Outils Gratuits de Monitoring** :
1. **Google PageSpeed Insights**
   - URL : [pagespeed.web.dev](https://pagespeed.web.dev)
   - Test : Entrer votre URL Netlify
   - Objectif : Score > 90

2. **GTmetrix**
   - URL : [gtmetrix.com](https://gtmetrix.com)
   - Test gratuit de performance

3. **Uptime Robot** (optionnel)
   - Surveillance 24h/24 du site
   - Alerte si le site tombe

### **Métriques à surveiller** :
- Temps de chargement
- Taille des pages
- Erreurs JavaScript
- Accessibilité

---

## 🗃️ Stratégie de Backup

### **Backup Automatique** (recommandé) :
```powershell
# Script de backup à lancer 1x/semaine
$date = Get-Date -Format "yyyy-MM-dd"
$source = "G:\Drive partagés\BLACKROB\web"
$destination = "G:\Backups\web-backup-$date"
Copy-Item -Path $source -Destination $destination -Recurse
```

### **Backup Manuel** :
1. Copier tout le dossier `web`
2. Renommer avec la date : `web-backup-2025-09-05`
3. Stocker sur un disque externe ou cloud

### **Backup Git** (si utilisé) :
```powershell
# Tout est sauvegardé automatiquement sur GitHub
git push
```

---

## 🔧 Outils de Développement Recommandés

### **Extensions VS Code Essentielles** :
- **Live Server** : Prévisualisation temps réel
- **Auto Rename Tag** : Renomme les balises HTML automatiquement
- **Prettier** : Formatage automatique du code
- **HTML CSS Support** : Autocomplétion améliorée

### **Navigateurs pour Tests** :
- **Chrome/Edge** : Principal développement
- **Firefox** : Test de compatibilité
- **Safari** (si possible) : Test mobile iOS

---

## 📝 Documentation des Changements

### **Tenir un journal des modifications** :
```
Date : 05/09/2025
Modification : Ajout section "À propos"
Fichiers modifiés : index.html, css/style.css
Test effectué : ✅ Chrome, ✅ Mobile
Déployé : ✅ Netlify
```

### **Nommer les commits Git** (si utilisé) :
```
✅ Bon : "Ajouter section témoignages clients"
❌ Mauvais : "modif"
```

---

## 🚨 Plan d'Urgence

### **Si le site ne fonctionne plus** :
1. **Ne pas paniquer** 
2. **Revenir à la dernière version qui marchait**
3. **Identifier le problème** (console navigateur)
4. **Contacter support** si nécessaire

### **Contacts d'urgence** :
- **Netlify Support** : Via le dashboard
- **Registrar du domaine** : (OVH, Gandi, etc.)
- **Votre développeur** : (vous ou aide externe)

---

## 📚 Ressources d'Apprentissage

### **Pour améliorer vos compétences** :
- **HTML/CSS** : [w3schools.com](https://w3schools.com)
- **JavaScript** : [javascript.info](https://javascript.info)
- **Git** : [learngitbranching.js.org](https://learngitbranching.js.org)
- **Design** : [dribbble.com](https://dribbble.com) (inspiration)

---

*💡 Conseil : Gardez ce guide à portée de main et cochez les tâches au fur et à mesure !*
