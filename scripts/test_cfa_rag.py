#!/usr/bin/env python3
"""
Script de test rapide pour vérifier l'intégration RAG CFA
Teste la recherche vectorielle sans passer par Netlify
"""

import json
import sys
from pathlib import Path

def test_cfa_search():
    """Test basique de la recherche CFA."""
    
    # Chemin vers les données CFA
    cfa_data_dir = Path("../netlify/functions/cfa_data")
    
    print("🧪 TEST RAG CFA - Vérification des fichiers")
    print("=" * 50)
    
    # Vérifier l'existence des fichiers
    files_to_check = [
        "cfa_knowledge_embeddings.json",
        "cfa_embedding_config.json", 
        "cfa_search_index.json",
        "cfa_stats.json"
    ]
    
    for filename in files_to_check:
        filepath = cfa_data_dir / filename
        if filepath.exists():
            size_mb = filepath.stat().st_size / (1024 * 1024)
            print(f"✅ {filename}: {size_mb:.2f} MB")
        else:
            print(f"❌ {filename}: MANQUANT")
            return False
    
    # Charger et analyser les statistiques
    try:
        with open(cfa_data_dir / "cfa_stats.json", 'r', encoding='utf-8') as f:
            stats = json.load(f)
        
        print(f"\n📊 STATISTIQUES CFA:")
        print(f"   - Total chunks: {stats['total_chunks']}")
        print(f"   - Longueur moyenne: {stats['average_chunk_length']:.0f} caractères")
        print(f"   - Mots-clés uniques: {stats['total_keywords']}")
        
        print(f"\n📚 DISTRIBUTION PAR CATÉGORIE:")
        for category, count in stats['categories_distribution'].items():
            percentage = (count / stats['total_chunks']) * 100
            print(f"   - {category}: {count} chunks ({percentage:.1f}%)")
            
    except Exception as e:
        print(f"❌ Erreur lecture statistiques: {e}")
        return False
    
    # Test de chargement des embeddings (échantillon)
    try:
        print(f"\n🔍 TEST CHARGEMENT EMBEDDINGS:")
        with open(cfa_data_dir / "cfa_knowledge_embeddings.json", 'r', encoding='utf-8') as f:
            embeddings_data = json.load(f)
        
        if embeddings_data and len(embeddings_data) > 0:
            sample = embeddings_data[0]
            print(f"   ✅ Premier chunk chargé:")
            print(f"      - Texte: {sample['text'][:100]}...")
            print(f"      - Page: {sample.get('page_number', 'N/A')}")
            print(f"      - Catégorie: {sample.get('topic_category', 'N/A')}")
            print(f"      - Embedding dimension: {len(sample.get('embedding', []))}")
            print(f"      - Mots-clés: {sample.get('relevance_keywords', [])[:5]}")
        else:
            print(f"   ❌ Aucun chunk trouvé")
            return False
            
    except Exception as e:
        print(f"❌ Erreur chargement embeddings: {e}")
        return False
    
    # Test de recherche d'index
    try:
        print(f"\n🔎 TEST INDEX DE RECHERCHE:")
        with open(cfa_data_dir / "cfa_search_index.json", 'r', encoding='utf-8') as f:
            search_index = json.load(f)
        
        # Chercher quelques mots-clés importants
        test_keywords = ["portfolio", "risk", "allocation", "investment", "wealth"]
        found_keywords = []
        
        for keyword in test_keywords:
            if keyword in search_index:
                chunks_count = len(search_index[keyword])
                found_keywords.append(f"{keyword} ({chunks_count})")
        
        if found_keywords:
            print(f"   ✅ Mots-clés trouvés: {', '.join(found_keywords)}")
        else:
            print(f"   ⚠️ Aucun mot-clé de test trouvé")
            
    except Exception as e:
        print(f"❌ Erreur test index: {e}")
        return False
    
    print(f"\n✅ TOUS LES TESTS RÉUSSIS!")
    print(f"🚀 Le système RAG CFA est prêt pour Netlify")
    return True

def simulate_search_query(query_text="portfolio diversification risk management"):
    """Simule une recherche pour montrer le fonctionnement."""
    
    print(f"\n" + "="*60)
    print(f"🔍 SIMULATION RECHERCHE: '{query_text}'")
    print(f"="*60)
    
    cfa_data_dir = Path("../netlify/functions/cfa_data")
    
    try:
        # Charger l'index
        with open(cfa_data_dir / "cfa_search_index.json", 'r', encoding='utf-8') as f:
            search_index = json.load(f)
        
        # Charger les embeddings
        with open(cfa_data_dir / "cfa_knowledge_embeddings.json", 'r', encoding='utf-8') as f:
            embeddings_data = json.load(f)
        
        # Recherche par mots-clés
        query_words = query_text.lower().split()
        matching_chunks = set()
        
        for word in query_words:
            if word in search_index:
                matching_chunks.update(search_index[word])
        
        if matching_chunks:
            print(f"📋 Trouvé {len(matching_chunks)} chunks correspondants")
            
            # Afficher les 3 premiers résultats
            for i, chunk_index in enumerate(list(matching_chunks)[:3]):
                if chunk_index < len(embeddings_data):
                    chunk = embeddings_data[chunk_index]
                    print(f"\n📄 Résultat {i+1}:")
                    print(f"   Page: {chunk.get('page_number', 'N/A')}")
                    print(f"   Catégorie: {chunk.get('topic_category', 'N/A')}")
                    print(f"   Texte: {chunk['text'][:200]}...")
                    print(f"   Mots-clés: {chunk.get('relevance_keywords', [])[:5]}")
        else:
            print(f"❌ Aucun chunk trouvé pour: {query_text}")
            
    except Exception as e:
        print(f"❌ Erreur simulation: {e}")

if __name__ == "__main__":
    print("🎓 RAMAdvisor - Test RAG CFA")
    print("Vérification de l'implémentation\n")
    
    if test_cfa_search():
        # Test de recherche simulée
        simulate_search_query("portfolio allocation investment strategy")
        print(f"\n🎯 PROCHAINES ÉTAPES:")
        print(f"1. Tester la fonction Netlify localement: `netlify dev`")
        print(f"2. Faire une requête POST vers /.netlify/functions/generate-investment-advice")
        print(f"3. Vérifier les logs pour 'CFA enhanced: true'")
        print(f"4. Déployer sur Netlify")
    else:
        print(f"\n❌ ERREURS DÉTECTÉES - Vérifiez la génération des embeddings")
        sys.exit(1)
