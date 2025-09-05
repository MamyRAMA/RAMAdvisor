# 🧪 Test de Validation - RAM Advisor Version Allégée

# Teste l'API déployée sur Render
param(
    [string]$Url = "https://ramadvisor-backend-light.onrender.com"
)

Write-Host "🚀 Test de l'API RAM Advisor - Version Allégée" -ForegroundColor Cyan
Write-Host "URL: $Url" -ForegroundColor Yellow
Write-Host ""

# Test 1: Santé de base
Write-Host "1. Test de base..." -ForegroundColor Green
try {
    $response1 = Invoke-RestMethod -Uri "$Url/" -Method GET
    Write-Host "✅ Service actif: $($response1.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Health check
Write-Host "`n2. Test de santé..." -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "$Url/health" -Method GET
    Write-Host "✅ Statut: $($health.status)" -ForegroundColor Green
    Write-Host "✅ Base de connaissances: $($health.knowledge_base_loaded)" -ForegroundColor Green
    Write-Host "✅ Documents: $($health.total_documents)" -ForegroundColor Green
    Write-Host "✅ Gemini configuré: $($health.gemini_configured)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check échoué: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Simulation simple
Write-Host "`n3. Test de simulation..." -ForegroundColor Green
$simulationData = @{
    age = 30
    income = 50000
    goals = "épargne retraite"
    risk_tolerance = "modéré"
} | ConvertTo-Json

try {
    $simulation = Invoke-RestMethod -Uri "$Url/simulate" -Method POST -Body $simulationData -ContentType "application/json"
    Write-Host "✅ Simulation générée:" -ForegroundColor Green
    Write-Host "   Stratégie: $($simulation.strategy.substring(0,100))..." -ForegroundColor White
    Write-Host "   Allocation: $($simulation.allocation)" -ForegroundColor White
} catch {
    Write-Host "❌ Simulation échouée: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Performance
Write-Host "`n4. Test de performance..." -ForegroundColor Green
$startTime = Get-Date
try {
    $perf = Invoke-RestMethod -Uri "$Url/health" -Method GET
    $endTime = Get-Date
    $responseTime = ($endTime - $startTime).TotalMilliseconds
    Write-Host "✅ Temps de réponse: $([math]::Round($responseTime, 2)) ms" -ForegroundColor Green
    
    if ($responseTime -lt 3000) {
        Write-Host "✅ Performance excellente (< 3s)" -ForegroundColor Green
    } elseif ($responseTime -lt 10000) {
        Write-Host "⚠️ Performance acceptable (< 10s)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Performance lente (> 10s)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test de performance échoué" -ForegroundColor Red
}

Write-Host "`n🎉 Tests terminés!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour tester localement :" -ForegroundColor Yellow
Write-Host "cd backend && python main-light.py" -ForegroundColor White
Write-Host ""
Write-Host "Pour tester en production :" -ForegroundColor Yellow
Write-Host ".\docs\check-deployment.ps1 -Url https://ramadvisor-backend-light.onrender.com" -ForegroundColor White
