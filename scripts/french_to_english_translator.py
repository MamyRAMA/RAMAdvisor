#!/usr/bin/env python3
"""
Traducteur Français -> Anglais pour requêtes CFA
Améliore la recherche vectorielle en traduisant les requêtes utilisateur
"""

import json
import re
from typing import Dict, List

class FrenchToEnglishTranslator:
    """Traducteur spécialisé finance français -> anglais."""
    
    def __init__(self):
        # Dictionnaire de terminologie financière FR -> EN
        self.financial_terms = {
            # Objectifs d'investissement
            'portefeuille': 'portfolio',
            'diversification': 'diversification',
            'diversifié': 'diversified',
            'retraite': 'retirement',
            'épargne': 'savings',
            'investissement': 'investment',
            'placement': 'investment',
            'allocation': 'allocation',
            'répartition': 'allocation',
            
            # Gestion des risques
            'risque': 'risk',
            'risques': 'risks',
            'minimiser': 'minimize',
            'réduire': 'reduce',
            'volatilité': 'volatility',
            'sécurité': 'security',
            'stabilité': 'stability',
            'prudent': 'conservative',
            'conservateur': 'conservative',
            'prudence': 'conservative',
            'audacieux': 'aggressive',
            'agressif': 'aggressive',
            'équilibré': 'balanced',
            'modéré': 'moderate',
            
            # Types d'actifs
            'actions': 'stocks',
            'obligations': 'bonds',
            'immobilier': 'real estate',
            'liquidité': 'liquidity',
            'cash': 'cash',
            'matières premières': 'commodities',
            'or': 'gold',
            
            # Stratégies
            'croissance': 'growth',
            'rendement': 'yield',
            'revenu': 'income',
            'plus-value': 'capital gains',
            'patrimoine': 'wealth',
            'gestion': 'management',
            'stratégie': 'strategy',
            'planification': 'planning',
            
            # Profils clients
            'client': 'client',
            'investisseur': 'investor',
            'objectif': 'objective',
            'horizon': 'horizon',
            'long terme': 'long term',
            'court terme': 'short term',
            'moyen terme': 'medium term',
            
            # Contexte CFA
            'conseil': 'advice',
            'recommandation': 'recommendation',
            'analyse': 'analysis',
            'évaluation': 'assessment',
            'optimisation': 'optimization',
            'performance': 'performance'
        }
        
        # Expressions complexes FR -> EN
        self.expressions = {
            'constituer un portefeuille': 'build a portfolio',
            'gestion de patrimoine': 'wealth management',
            'allocation d\'actifs': 'asset allocation',
            'profil de risque': 'risk profile',
            'tolérance au risque': 'risk tolerance',
            'horizon d\'investissement': 'investment horizon',
            'objectifs financiers': 'financial objectives',
            'planification financière': 'financial planning',
            'gestion des risques': 'risk management',
            'diversification géographique': 'geographic diversification',
            'répartition sectorielle': 'sector allocation',
            'stratégie d\'investissement': 'investment strategy',
            'optimisation fiscale': 'tax optimization',
            'préparation retraite': 'retirement planning',
            'épargne retraite': 'retirement savings',
            'minimiser les risques': 'minimize risks',
            'maximiser les rendements': 'maximize returns',
            'équilibrer risque et rendement': 'balance risk and return'
        }
    
    def translate_query(self, french_query: str) -> str:
        """
        Traduit une requête française en anglais pour améliorer la recherche CFA.
        
        Args:
            french_query: Requête en français
            
        Returns:
            str: Requête traduite en anglais
        """
        # Nettoyer la requête
        query = french_query.lower().strip()
        
        # 1. Remplacer les expressions complexes d'abord
        for fr_expr, en_expr in self.expressions.items():
            if fr_expr in query:
                query = query.replace(fr_expr, en_expr)
        
        # 2. Remplacer les termes individuels
        words = query.split()
        translated_words = []
        
        for word in words:
            # Nettoyer la ponctuation
            clean_word = re.sub(r'[^\w]', '', word)
            
            # Chercher la traduction
            if clean_word in self.financial_terms:
                translated_words.append(self.financial_terms[clean_word])
            else:
                # Garder le mot original si pas de traduction
                translated_words.append(word)
        
        translated_query = ' '.join(translated_words)
        
        # 3. Nettoyer et optimiser
        translated_query = self._optimize_for_cfa_search(translated_query)
        
        return translated_query
    
    def _optimize_for_cfa_search(self, query: str) -> str:
        """Optimise la requête pour la recherche CFA."""
        # Supprimer les mots vides français restants
        stop_words = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'pour', 'avec', 'sans', 'dans', 'sur', 'en', 'et', 'ou', 'à', 'au', 'aux']
        words = query.split()
        filtered_words = [word for word in words if word not in stop_words]
        
        # Ajouter des termes CFA contextuels
        cfa_context = ['portfolio', 'wealth', 'management', 'strategy', 'allocation']
        
        # Si la requête est courte, ajouter du contexte
        if len(filtered_words) <= 3:
            filtered_words.extend(cfa_context[:2])
        
        return ' '.join(filtered_words)
    
    def get_multilingual_keywords(self, french_query: str) -> List[str]:
        """
        Génère une liste de mots-clés en français et anglais.
        
        Args:
            french_query: Requête en français
            
        Returns:
            List[str]: Liste de mots-clés FR + EN
        """
        # Mots-clés français
        french_words = [word.strip() for word in re.findall(r'\w+', french_query.lower()) if len(word) > 3]
        
        # Traduction
        english_query = self.translate_query(french_query)
        english_words = [word.strip() for word in re.findall(r'\w+', english_query.lower()) if len(word) > 3]
        
        # Combiner et dédupliquer
        all_keywords = list(set(french_words + english_words))
        
        return all_keywords

def test_translator():
    """Test du traducteur avec des exemples typiques."""
    translator = FrenchToEnglishTranslator()
    
    test_queries = [
        "Constituer un portefeuille diversifié pour ma retraite en minimisant les risques",
        "Stratégie d'investissement conservatrice pour épargne retraite",
        "Allocation d'actifs équilibrée avec horizon long terme",
        "Optimiser mon patrimoine avec gestion des risques",
        "Diversification géographique et sectorielle",
        "Planification financière pour objectifs retraite"
    ]
    
    print("🔄 TEST TRADUCTEUR FRANÇAIS -> ANGLAIS")
    print("="*60)
    
    for i, query in enumerate(test_queries, 1):
        translated = translator.translate_query(query)
        keywords = translator.get_multilingual_keywords(query)
        
        print(f"\n📝 Test {i}:")
        print(f"   FR: {query}")
        print(f"   EN: {translated}")
        print(f"   Keywords: {', '.join(keywords[:5])}...")

if __name__ == "__main__":
    test_translator()
