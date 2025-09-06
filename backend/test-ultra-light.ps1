# 🧪 Test Local - Version Ultra Allégée

Write-Host "🚀 Test RAM Advisor - Version Ultra Allégée" -ForegroundColor Cyan
Write-Host ""

# Test 1: Démarrage du serveur
Write-Host "1. Démarrage du serveur en arrière-plan..." -ForegroundColor Green
$process = Start-Process python -ArgumentList "main-ultra-light.py" -PassThru -NoNewWindow
Start-Sleep 3

# Test 2: Test de base
Write-Host "2. Test de l'endpoint racine..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/" -Method GET
    Write-Host "✅ Service actif: $($response.message)" -ForegroundColor Green
    Write-Host "   Version: $($response.version)" -ForegroundColor White
} catch {
    Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Health check
Write-Host "`n3. Test de santé..." -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET
    Write-Host "✅ Statut: $($health.status)" -ForegroundColor Green
    Write-Host "✅ Base de connaissances: $($health.knowledge_base_loaded)" -ForegroundColor Green
    Write-Host "✅ Gemini configuré: $($health.gemini_configured)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check échoué: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Simulation (si Gemini configuré)
if ($health.gemini_configured) {
    Write-Host "`n4. Test de simulation..." -ForegroundColor Green
    $simulationData = @{
        goal = "épargne retraite"
        initial_amount = 10000
        monthly_amount = 500
        risk_profile = "modéré"
    } | ConvertTo-Json

    try {
        $simulation = Invoke-RestMethod -Uri "http://localhost:8000/simulate" -Method POST -Body $simulationData -ContentType "application/json"
        Write-Host "✅ Simulation générée avec succès" -ForegroundColor Green
        Write-Host "   Début: $($simulation.response.substring(0,100))..." -ForegroundColor White
    } catch {
        Write-Host "❌ Simulation échouée: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n4. ⚠️ Test de simulation ignoré (Gemini non configuré)" -ForegroundColor Yellow
    Write-Host "   Pour tester: Set-Item -Path Env:GEMINI_API_KEY -Value 'votre_clé'" -ForegroundColor White
}

# Arrêt du serveur
Write-Host "`n5. Arrêt du serveur..." -ForegroundColor Green
Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue

Write-Host "`n🎉 Tests terminés!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour déployer sur Render :" -ForegroundColor Yellow
Write-Host "- Utilisez 'requirements-ultra-light.txt'" -ForegroundColor White
Write-Host "- Commande de démarrage: 'python main-ultra-light.py'" -ForegroundColor White
Write-Host "- Configurez GEMINI_API_KEY dans les variables d'environnement" -ForegroundColor White
