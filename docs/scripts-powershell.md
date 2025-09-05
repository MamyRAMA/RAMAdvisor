# 📜 Scripts PowerShell Utiles

## 🔍 Script de Vérification des Serveurs

### **check-servers.ps1**
```powershell
# Script pour vérifier les serveurs de développement actifs
Write-Host "🔍 Vérification des serveurs de développement..." -ForegroundColor Yellow
Write-Host ""

# Vérifier Live Server (port 5500)
$liveServer = netstat -ano | findstr :5500
if ($liveServer) {
    Write-Host "⚠️  Live Server ACTIF sur le port 5500" -ForegroundColor Red
    Write-Host "   Commande pour arrêter : Dans VS Code > Ctrl+Shift+P > 'Live Server: Stop'"
} else {
    Write-Host "✅ Live Server : ARRÊTÉ" -ForegroundColor Green
}

# Vérifier autres ports de dev
$otherPorts = netstat -ano | findstr ":3000 :8000 :8080"
if ($otherPorts) {
    Write-Host "⚠️  Autres serveurs actifs détectés :" -ForegroundColor Red
    $otherPorts
} else {
    Write-Host "✅ Autres ports de dev : LIBRES" -ForegroundColor Green
}

Write-Host ""
Write-Host "📊 Résumé complet des ports en écoute :"
netstat -an | findstr LISTENING | Select-Object -First 5
```

### **Utilisation :**
```powershell
# Sauvegarder ce script dans docs/check-servers.ps1
# Puis l'exécuter avec :
.\docs\check-servers.ps1
```

---

## 📁 Script de Backup Automatique

### **backup-site.ps1**
```powershell
# Script de sauvegarde automatique du site
param(
    [string]$SourcePath = "G:\Drive partagés\BLACKROB\web",
    [string]$BackupRoot = "G:\Backups"
)

$date = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupName = "web-backup-$date"
$backupPath = Join-Path $BackupRoot $backupName

Write-Host "🗃️  Sauvegarde en cours..." -ForegroundColor Yellow
Write-Host "Source : $SourcePath"
Write-Host "Destination : $backupPath"

try {
    # Créer le dossier de backup s'il n'existe pas
    if (!(Test-Path $BackupRoot)) {
        New-Item -ItemType Directory -Path $BackupRoot -Force
    }
    
    # Copier les fichiers (exclure le dossier archive)
    robocopy $SourcePath $backupPath /E /XD archive
    
    Write-Host "✅ Sauvegarde terminée avec succès !" -ForegroundColor Green
    Write-Host "📁 Backup situé dans : $backupPath"
    
    # Lister les fichiers sauvegardés
    $fileCount = (Get-ChildItem $backupPath -Recurse | Measure-Object).Count
    Write-Host "📊 $fileCount fichiers sauvegardés"
    
} catch {
    Write-Host "❌ Erreur lors de la sauvegarde :" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
```

### **Utilisation :**
```powershell
# Sauvegarde simple
.\docs\backup-site.ps1

# Sauvegarde avec chemin personnalisé
.\docs\backup-site.ps1 -BackupRoot "D:\MesSauvegardes"
```

---

## 🧹 Script de Nettoyage

### **clean-project.ps1**
```powershell
# Script de nettoyage du projet
$projectPath = "G:\Drive partagés\BLACKROB\web"

Write-Host "🧹 Nettoyage du projet..." -ForegroundColor Yellow

# Fichiers temporaires à supprimer
$tempFiles = @(
    "*.tmp",
    "*.log",
    "*.bak",
    "*~",
    "Thumbs.db",
    ".DS_Store"
)

$deletedCount = 0

foreach ($pattern in $tempFiles) {
    $files = Get-ChildItem -Path $projectPath -Filter $pattern -Recurse -Force
    foreach ($file in $files) {
        try {
            Remove-Item $file.FullName -Force
            Write-Host "🗑️  Supprimé : $($file.Name)" -ForegroundColor Gray
            $deletedCount++
        } catch {
            Write-Host "⚠️  Impossible de supprimer : $($file.Name)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
if ($deletedCount -gt 0) {
    Write-Host "✅ Nettoyage terminé : $deletedCount fichiers supprimés" -ForegroundColor Green
} else {
    Write-Host "✅ Projet déjà propre : aucun fichier temporaire trouvé" -ForegroundColor Green
}
```

---

## 🚀 Script de Déploiement Local

### **deploy-local.ps1**
```powershell
# Script pour préparer un déploiement
param(
    [string]$ProjectPath = "G:\Drive partagés\BLACKROB\web"
)

Write-Host "🚀 Préparation du déploiement..." -ForegroundColor Yellow

# Vérifications pré-déploiement
$checks = @()

# 1. Vérifier que index.html existe
if (Test-Path "$ProjectPath\index.html") {
    $checks += "✅ index.html présent"
} else {
    $checks += "❌ index.html MANQUANT"
}

# 2. Vérifier CSS
if (Test-Path "$ProjectPath\css\style.css") {
    $checks += "✅ CSS présent"
} else {
    $checks += "❌ CSS MANQUANT"
}

# 3. Vérifier JavaScript
if (Test-Path "$ProjectPath\js\script.js") {
    $checks += "✅ JavaScript présent"
} else {
    $checks += "❌ JavaScript MANQUANT"
}

# 4. Vérifier qu'aucun serveur ne tourne
$activeServers = netstat -ano | findstr ":5500 :3000 :8000 :8080"
if (!$activeServers) {
    $checks += "✅ Aucun serveur de dev actif"
} else {
    $checks += "⚠️  Serveurs de dev encore actifs"
}

# Afficher les résultats
Write-Host ""
Write-Host "📋 Checklist de déploiement :" -ForegroundColor Cyan
foreach ($check in $checks) {
    Write-Host "  $check"
}

# Créer un package pour Netlify (optionnel)
$hasErrors = $checks | Where-Object { $_ -like "*❌*" }
if (!$hasErrors) {
    Write-Host ""
    Write-Host "🎉 Projet prêt pour le déploiement !" -ForegroundColor Green
    Write-Host "💡 Vous pouvez maintenant :"
    Write-Host "   1. Zipper le dossier (sans 'archive')"
    Write-Host "   2. Glisser sur Netlify"
    Write-Host "   3. Ou utiliser Git pour pousser les changements"
} else {
    Write-Host ""
    Write-Host "⚠️  Corrigez les erreurs avant de déployer" -ForegroundColor Red
}
```

---

## 📊 Script de Test du Site

### **test-site.ps1**
```powershell
# Script de test automatique du site
param(
    [string]$HtmlFile = "G:\Drive partagés\BLACKROB\web\index.html"
)

Write-Host "🧪 Test du site web..." -ForegroundColor Yellow

# Test 1 : Fichier HTML existe et n'est pas vide
if (Test-Path $HtmlFile) {
    $htmlContent = Get-Content $HtmlFile -Raw
    if ($htmlContent.Length -gt 100) {
        Write-Host "✅ Fichier HTML valide" -ForegroundColor Green
    } else {
        Write-Host "❌ Fichier HTML trop petit" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier HTML introuvable" -ForegroundColor Red
    return
}

# Test 2 : Vérifier les liens CSS
$cssLinks = [regex]::Matches($htmlContent, 'href="([^"]*\.css[^"]*)"')
foreach ($match in $cssLinks) {
    $cssPath = $match.Groups[1].Value
    $fullCssPath = Join-Path (Split-Path $HtmlFile) $cssPath
    if (Test-Path $fullCssPath) {
        Write-Host "✅ CSS trouvé : $cssPath" -ForegroundColor Green
    } else {
        Write-Host "❌ CSS manquant : $cssPath" -ForegroundColor Red
    }
}

# Test 3 : Vérifier les liens JavaScript
$jsLinks = [regex]::Matches($htmlContent, 'src="([^"]*\.js[^"]*)"')
foreach ($match in $jsLinks) {
    $jsPath = $match.Groups[1].Value
    # Ignorer les CDN externes
    if (!$jsPath.StartsWith("http")) {
        $fullJsPath = Join-Path (Split-Path $HtmlFile) $jsPath
        if (Test-Path $fullJsPath) {
            Write-Host "✅ JavaScript trouvé : $jsPath" -ForegroundColor Green
        } else {
            Write-Host "❌ JavaScript manquant : $jsPath" -ForegroundColor Red
        }
    }
}

# Test 4 : Ouvrir le site dans le navigateur pour test visuel
Write-Host ""
Write-Host "🌐 Ouverture du site pour test visuel..." -ForegroundColor Cyan
Start-Process $HtmlFile
```

---

## 📝 Installation des Scripts

### **Pour utiliser ces scripts :**

1. **Créer le fichier script** dans le dossier `docs`
2. **Autoriser l'exécution** (une seule fois) :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3. **Lancer un script** :
```powershell
.\docs\check-servers.ps1
```

### **Raccourcis suggérés :**
```powershell
# Créer des alias pour aller plus vite
New-Alias -Name "check" -Value ".\docs\check-servers.ps1"
New-Alias -Name "backup" -Value ".\docs\backup-site.ps1"
New-Alias -Name "test" -Value ".\docs\test-site.ps1"
```

---

*💡 Ces scripts vous feront gagner beaucoup de temps en automatisant les tâches répétitives !*
