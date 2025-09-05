# Script de verification des serveurs de developpement
Write-Host "🔍 Verification des serveurs de developpement..." -ForegroundColor Yellow
Write-Host ""

# Verifier Live Server (port 5500)
$liveServer = netstat -ano | findstr :5500
if ($liveServer) {
    Write-Host "⚠️  Live Server ACTIF sur le port 5500" -ForegroundColor Red
    Write-Host "   Commande pour arreter : Dans VS Code - Ctrl+Shift+P - Live Server: Stop"
} else {
    Write-Host "✅ Live Server : ARRETE" -ForegroundColor Green
}

# Verifier autres ports de dev
$otherPorts = netstat -ano | findstr ":3000 :8000 :8080"
if ($otherPorts) {
    Write-Host "⚠️  Autres serveurs actifs detectes :" -ForegroundColor Red
    $otherPorts
} else {
    Write-Host "✅ Autres ports de dev : LIBRES" -ForegroundColor Green
}

Write-Host ""
Write-Host "📊 Resume complet des ports en ecoute :"
netstat -an | findstr LISTENING | Select-Object -First 5
