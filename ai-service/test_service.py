import requests
import json

def test_ai_service():
    """Test simple du service RAM Advisor AI."""
    
    # URL du service local
    base_url = "http://localhost:8000"
    
    print("🧪 Test du service RAM Advisor AI")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Test de santé du service...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Service en ligne")
            print(f"   - Statut: {data['status']}")
            print(f"   - Base de connaissances: {'✅' if data['knowledge_base_loaded'] else '❌'}")
            print(f"   - Documents: {data['total_documents']}")
        else:
            print(f"❌ Erreur: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Service non accessible sur http://localhost:8000")
        print("   Assurez-vous que le service est démarré avec 'python main.py'")
        return False
    
    # Test 2: Recherche dans la base de connaissances
    print("\n2. Test de recherche...")
    try:
        response = requests.get(f"{base_url}/search", params={
            "query": "investissement long terme",
            "top_k": 3
        })
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Recherche réussie: {data['total_found']} résultats")
            for i, result in enumerate(data['results'][:2], 1):
                print(f"   {i}. {result['source_file']} (score: {result['score']:.3f})")
                print(f"      {result['text'][:80]}...")
        else:
            print(f"❌ Erreur recherche: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur recherche: {e}")
    
    # Test 3: Simulation d'investissement
    print("\n3. Test de simulation...")
    try:
        simulation_data = {
            "goal": "Acheter une résidence principale dans 10 ans",
            "initial_amount": 10000,
            "monthly_amount": 500,
            "risk_profile": "Équilibré"
        }
        
        response = requests.post(f"{base_url}/simulate", 
                               json=simulation_data,
                               headers={"Content-Type": "application/json"})
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Simulation réussie")
            print(f"   - Confiance: {data['confidence_score']:.2%}")
            print(f"   - Sources: {len(data['sources'])}")
            print(f"   - Réponse: {len(data['response'])} caractères")
            
            # Afficher un extrait de la réponse
            response_text = data['response']
            # Nettoyer les balises HTML pour l'affichage
            import re
            clean_text = re.sub(r'<[^>]+>', '', response_text)
            print(f"   - Extrait: {clean_text[:100]}...")
            
        else:
            print(f"❌ Erreur simulation: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Erreur simulation: {e}")
    
    print("\n✅ Tests terminés!")
    return True

def test_frontend_integration():
    """Test d'intégration avec le frontend."""
    print("\n🌐 Test d'intégration frontend")
    print("=" * 50)
    
    print("Pour tester l'intégration complète:")
    print("1. Démarrez le service AI: python main.py")
    print("2. Ouvrez index.html dans votre navigateur")
    print("3. Allez à la section 'Simulez votre projet d'investissement'")
    print("4. Remplissez le formulaire et cliquez sur 'Lancer la simulation'")
    print("5. Vérifiez que la réponse inclut des sources et un score de confiance")

if __name__ == "__main__":
    success = test_ai_service()
    if success:
        test_frontend_integration()
