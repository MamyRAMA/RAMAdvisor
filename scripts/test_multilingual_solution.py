#!/usr/bin/env python3
"""
Test de la solution multilingue pour RAG CFA
Valide que la traduction FR->EN améliore la recherche vectorielle
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import du traducteur
try:
    from french_to_english_translator import FrenchToEnglishTranslator
except ImportError:
    print("❌ Erreur: Impossible d'importer FrenchToEnglishTranslator")
    sys.exit(1)

def test_translation_improvement():
    """Test l'amélioration apportée par la traduction."""
    
    print("🧪 TEST AMÉLIORATION TRADUCTION FR -> EN")
    print("="*60)
    
    translator = FrenchToEnglishTranslator()
    
    # Requêtes français typiques du site
    test_cases = [
        {
            'french': 'Constituer un portefeuille diversifié pour ma retraite en minimisant les risques',
            'expected_en_terms': ['portfolio', 'diversified', 'retirement', 'minimize', 'risks']
        },
        {
            'french': 'Stratégie d\'investissement prudente avec allocation équilibrée',
            'expected_en_terms': ['investment', 'strategy', 'conservative', 'allocation', 'balanced']
        },
        {
            'french': 'Optimiser mon patrimoine avec gestion des risques',
            'expected_en_terms': ['wealth', 'optimization', 'risk', 'management']
        },
        {
            'french': 'Épargne retraite avec croissance long terme',
            'expected_en_terms': ['retirement', 'savings', 'growth', 'long', 'term']
        }
    ]
    
    success_count = 0
    
    for i, case in enumerate(test_cases, 1):
        french_query = case['french']
        expected_terms = case['expected_en_terms']
        
        # Traduction
        english_query = translator.translate_query(french_query)
        multilingual_keywords = translator.get_multilingual_keywords(french_query)
        
        print(f"\n📝 Test {i}:")
        print(f"   FR: {french_query}")
        print(f"   EN: {english_query}")
        print(f"   Keywords: {', '.join(multilingual_keywords[:8])}")
        
        # Vérifier que les termes attendus sont présents
        found_terms = []
        for term in expected_terms:
            if any(term.lower() in keyword.lower() for keyword in multilingual_keywords):
                found_terms.append(term)
        
        coverage = len(found_terms) / len(expected_terms)
        print(f"   ✅ Termes trouvés: {len(found_terms)}/{len(expected_terms)} ({coverage:.1%})")
        
        if coverage >= 0.6:  # 60% de couverture minimum
            success_count += 1
            print(f"   🎯 SUCCÈS - Bonne traduction")
        else:
            print(f"   ⚠️ PARTIEL - Traduction incomplète")
        
        print(f"   📋 Détails: {', '.join(found_terms)}")
    
    # Résultat global
    global_success = success_count / len(test_cases)
    print(f"\n🎯 RÉSULTAT GLOBAL:")
    print(f"   Taux de succès: {success_count}/{len(test_cases)} ({global_success:.1%})")
    
    if global_success >= 0.75:
        print("   ✅ EXCELLENT - Traduction multilingue opérationnelle")
    elif global_success >= 0.5:
        print("   ⚖️ ACCEPTABLE - Amélioration possible")
    else:
        print("   ❌ INSUFFISANT - Traducteur à revoir")
    
    return global_success

def test_cfa_term_mapping():
    """Test le mapping des termes financiers CFA."""
    
    print(f"\n🏦 TEST MAPPING TERMINOLOGIE CFA")
    print("-"*50)
    
    translator = FrenchToEnglishTranslator()
    
    # Termes CFA critiques
    cfa_critical_terms = {
        'portefeuille': 'portfolio',
        'allocation': 'allocation',
        'diversification': 'diversification',
        'risque': 'risk',
        'patrimoine': 'wealth',
        'gestion': 'management',
        'investissement': 'investment',
        'retraite': 'retirement',
        'prudent': 'conservative',
        'équilibré': 'balanced',
        'audacieux': 'aggressive'
    }
    
    mapping_success = 0
    
    for french_term, expected_english in cfa_critical_terms.items():
        english_query = translator.translate_query(french_term)
        
        # Vérifier si le terme anglais attendu est présent
        if expected_english.lower() in english_query.lower():
            mapping_success += 1
            print(f"   ✅ {french_term} -> {expected_english} (trouvé)")
        else:
            print(f"   ❌ {french_term} -> {expected_english} (manqué: '{english_query}')")
    
    mapping_rate = mapping_success / len(cfa_critical_terms)
    print(f"\n📊 Taux de mapping: {mapping_success}/{len(cfa_critical_terms)} ({mapping_rate:.1%})")
    
    return mapping_rate

def simulate_improved_search():
    """Simule une recherche CFA améliorée avec traduction."""
    
    print(f"\n🔍 SIMULATION RECHERCHE CFA AMÉLIORÉE")
    print("-"*50)
    
    translator = FrenchToEnglishTranslator()
    
    # Simulation de chunks CFA (anglais)
    mock_cfa_chunks = [
        {
            'text': 'Asset allocation is fundamental to portfolio construction and risk management in wealth management',
            'category': 'Asset Allocation',
            'keywords': ['asset', 'allocation', 'portfolio', 'construction', 'risk', 'management', 'wealth']
        },
        {
            'text': 'Conservative investment strategies focus on capital preservation and stable income generation',
            'category': 'Risk Management', 
            'keywords': ['conservative', 'investment', 'strategies', 'capital', 'preservation', 'stable', 'income']
        },
        {
            'text': 'Retirement planning requires long-term portfolio diversification across multiple asset classes',
            'category': 'Investment Strategy',
            'keywords': ['retirement', 'planning', 'long-term', 'portfolio', 'diversification', 'asset', 'classes']
        }
    ]
    
    # Requête test français
    french_query = "Constituer un portefeuille diversifié pour ma retraite en minimisant les risques"
    
    print(f"🔍 Requête FR: {french_query}")
    
    # Méthode standard (sans traduction)
    french_words = french_query.lower().split()
    standard_scores = []
    
    for chunk in mock_cfa_chunks:
        score = 0
        for word in french_words:
            if any(word in keyword.lower() for keyword in chunk['keywords']):
                score += 1
        standard_scores.append((score, chunk['category']))
    
    # Méthode améliorée (avec traduction)
    english_query = translator.translate_query(french_query)
    multilingual_keywords = translator.get_multilingual_keywords(french_query)
    
    print(f"🔄 Traduction EN: {english_query}")
    print(f"🔑 Keywords: {', '.join(multilingual_keywords[:6])}")
    
    enhanced_scores = []
    for chunk in mock_cfa_chunks:
        score = 0
        for keyword in multilingual_keywords:
            if any(keyword.lower() in chunk_keyword.lower() for chunk_keyword in chunk['keywords']):
                score += 1
        enhanced_scores.append((score, chunk['category']))
    
    # Comparaison
    print(f"\n📊 COMPARAISON SCORES:")
    for i, chunk in enumerate(mock_cfa_chunks):
        std_score = standard_scores[i][0]
        enh_score = enhanced_scores[i][0]
        improvement = enh_score - std_score
        
        print(f"   {chunk['category'][:20]:20} | Standard: {std_score} | Enhanced: {enh_score} | +{improvement}")
    
    total_std = sum(score for score, _ in standard_scores)
    total_enh = sum(score for score, _ in enhanced_scores)
    improvement_pct = ((total_enh - total_std) / max(total_std, 1)) * 100
    
    print(f"\n🎯 AMÉLIORATION GLOBALE:")
    print(f"   Standard: {total_std} matches")
    print(f"   Enhanced: {total_enh} matches")
    print(f"   Amélioration: +{improvement_pct:.1f}%")
    
    if improvement_pct > 50:
        print("   ✅ EXCELLENT - Amélioration significative")
    elif improvement_pct > 20:
        print("   ⚖️ ACCEPTABLE - Amélioration notable")
    else:
        print("   ⚠️ MODESTE - Amélioration limitée")
    
    return improvement_pct

def main():
    """Fonction principale de test."""
    
    print("🚀 TEST COMPLET SOLUTION MULTILINGUE RAG CFA")
    print("="*70)
    
    try:
        # Test 1: Traduction
        translation_success = test_translation_improvement()
        
        # Test 2: Mapping terminologique
        mapping_success = test_cfa_term_mapping()
        
        # Test 3: Simulation recherche
        improvement = simulate_improved_search()
        
        # Verdict final
        print(f"\n🏆 VERDICT FINAL:")
        print(f"   Traduction: {translation_success:.1%}")
        print(f"   Mapping CFA: {mapping_success:.1%}")
        print(f"   Amélioration: +{improvement:.1f}%")
        
        overall_success = (translation_success + mapping_success) / 2
        
        if overall_success >= 0.8 and improvement > 30:
            print("\n✅ SOLUTION MULTILINGUE VALIDÉE")
            print("   Recommandation: Déployer la version Enhanced")
        elif overall_success >= 0.6 and improvement > 15:
            print("\n⚖️ SOLUTION ACCEPTABLE")
            print("   Recommandation: Améliorer et tester davantage")
        else:
            print("\n⚠️ SOLUTION À AMÉLIORER")
            print("   Recommandation: Envisager des alternatives")
            
    except Exception as e:
        print(f"❌ Erreur lors des tests: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()
