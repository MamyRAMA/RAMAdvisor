# 🔍 Guide de Prévisualisation du Site Web

## 📋 Méthodes pour prévisualiser votre site

### 1. **Méthode Simple** (Recommandée pour débutants)
```
Double-cliquez sur index.html
```
- ✅ **Avantages** : Instantané, aucune installation
- ✅ **Mémoire** : Aucun impact supplémentaire
- ❌ **Inconvénient** : Pas de rechargement automatique

---

### 2. **Live Server VS Code** (Pour le développement)

#### Installation :
1. Ouvrir VS Code
2. Extensions (Ctrl+Shift+X)
3. Chercher "Live Server"
4. Installer l'extension de Ritwick Dey

#### Utilisation :
1. Clic droit sur `index.html`
2. **"Open with Live Server"**
3. Le site s'ouvre sur `http://127.0.0.1:5500`

#### ⚠️ IMPORTANT - Arrêter Live Server :
- **Méthode 1** : Clic sur "Port: 5500" dans la barre du bas
- **Méthode 2** : Ctrl+Shift+P → "Live Server: Stop"
- **Méthode 3** : Fermer l'onglet terminal

---

## 🔍 Vérification des Serveurs Actifs

### Commandes PowerShell à retenir :

#### Vérifier si Live Server tourne :
```powershell
netstat -ano | findstr :5500
```

#### Vérifier tous les serveurs de développement :
```powershell
netstat -ano | findstr ":3000 :5500 :8000 :8080"
```

#### Voir tous les ports en écoute :
```powershell
netstat -an | findstr LISTENING | Select-Object -First 10
```

### 📊 Interprétation des résultats :

**Si aucun résultat** → ✅ Aucun serveur actif
```
PS > netstat -ano | findstr :5500
PS > 
```

**Si résultat affiché** → ⚠️ Serveur actif à arrêter
```
TCP    127.0.0.1:5500    0.0.0.0:0    LISTENING    1234
```

### 🛑 Arrêter un processus bloqué :
```powershell
# Remplacer 1234 par le vrai PID affiché
taskkill /PID 1234 /F
```

---

## 🧠 Impact Mémoire par Méthode

| Méthode | RAM utilisée | À arrêter ? |
|---------|--------------|-------------|
| Double-clic sur index.html | 0 MB | ❌ Non |
| Live Server VS Code | 20-50 MB | ✅ Oui |
| Python http.server | 10-30 MB | ✅ Oui (Ctrl+C) |
| Node.js serveur | 15-40 MB | ✅ Oui (Ctrl+C) |

---

## 🎯 Routine Recommandée

### Avant de commencer :
```powershell
# Vérifier qu'aucun serveur ne tourne
netstat -ano | findstr :5500
```

### Pour développer :
1. Ouvrir VS Code
2. Utiliser Live Server
3. **TOUJOURS l'arrêter après usage**

### Pour un aperçu rapide :
1. Double-cliquer sur `index.html`
2. Actualiser manuellement le navigateur après modifications

---

## ⚡ Raccourcis VS Code Utiles

- `Ctrl+Shift+P` : Palette de commandes
- `Ctrl+Shift+X` : Extensions
- `Ctrl+` ` : Terminal intégré
- `Alt+Shift+F` : Formater le document
- `Ctrl+S` : Sauvegarder

---

*📝 Note : Gardez ce guide ouvert pendant vos sessions de développement !*
