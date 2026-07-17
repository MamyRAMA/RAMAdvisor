#!/usr/bin/env python3
"""
Enrichissement de la base CFA avec traductions françaises
Ajoute des termes français aux chunks CFA pour améliorer la recherche directe
"""

import json
import os
from pathlib import Path

class CFAFrenchEnricher:
    """Enrichit les chunks CFA avec des traductions françaises."""
    
    def __init__(self):
        self.french_mappings = {
            # Termes financiers de base
            'portfolio': 'portefeuille',
            'allocation': 'allocation',
            'diversification': 'diversification',
            'risk': 'risque',
            'wealth': 'patrimoine',
            'management': 'gestion',
            'investment': 'investissement',
            'strategy': 'stratégie',
            'planning': 'planification',
            'retirement': 'retraite',
            'savings': 'épargne',
            
            # Profils de risque
            'conservative': 'prudent',
            'balanced': 'équilibré',
            'aggressive': 'audacieux',
            'moderate': 'modéré',
            'prudent': 'prudent',
            
            # Types d'actifs
            'stocks': 'actions',
            'bonds': 'obligations',
            'equity': 'actions',
            'fixed income': 'revenus fixes',
            'real estate': 'immobilier',
            'commodities': 'matières premières',
            'cash': 'liquidités',
            
            # Objectifs
            'growth': 'croissance',
            'income': 'revenus',
            'preservation': 'préservation',
            'accumulation': 'accumulation',
            'stability': 'stabilité',
            'liquidity': 'liquidité',
            
            # Concepts avancés
            'volatility': 'volatilité',
            'correlation': 'corrélation',
            'optimization': 'optimisation',
            'performance': 'performance',
            'benchmark': 'référence',
            'duration': 'durée',
            'yield': 'rendement',
            'return': 'rendement'
        }
        
        # Expressions complexes
        self.phrase_mappings = {
            'asset allocation': 'allocation d\'actifs',
            'risk management': 'gestion des risques',
            'wealth management': 'gestion de patrimoine',
            'investment strategy': 'stratégie d\'investissement',
            'portfolio construction': 'construction de portefeuille',
            'retirement planning': 'planification retraite',
            'risk tolerance': 'tolérance au risque',
            'time horizon': 'horizon temporel',
            'capital preservation': 'préservation du capital',
            'income generation': 'génération de revenus'
        }
    
    def enrich_chunk_text(self, english_text):
        """
        Enrichit un chunk anglais avec des termes français équivalents.
        
        Args:
            english_text: Texte CFA en anglais
            
        Returns:
            str: Texte enrichi avec traductions françaises
        """
        enriched_text = english_text
        
        # Ajouter les traductions comme termes additionnels
        french_terms = []
        
        # Chercher les expressions complexes d'abord
        for en_phrase, fr_phrase in self.phrase_mappings.items():
            if en_phrase.lower() in english_text.lower():
                french_terms.append(fr_phrase)
        
        # Chercher les termes individuels
        words = english_text.lower().split()
        for word in words:
            # Nettoyer la ponctuation
            clean_word = ''.join(c for c in word if c.isalnum())
            if clean_word in self.french_mappings:
                french_terms.append(self.french_mappings[clean_word])
        
        # Ajouter les termes français au chunk
        if french_terms:
            unique_french_terms = list(set(french_terms))
            french_addition = f" [Termes FR: {', '.join(unique_french_terms)}]"
            enriched_text += french_addition
        
        return enriched_text
    
    def enrich_keywords(self, english_keywords):
        """
        Enrichit les mots-clés avec les équivalents français.
        
        Args:
            english_keywords: Liste de mots-clés anglais
            
        Returns:
            list: Mots-clés enrichis FR + EN
        """
        if not english_keywords:
            return []
        
        enriched_keywords = list(english_keywords)  # Copie
        
        for keyword in english_keywords:
            if keyword.lower() in self.french_mappings:
                enriched_keywords.append(self.french_mappings[keyword.lower()])
        
        # Supprimer les doublons et retourner
        return list(set(enriched_keywords))
    
    def enrich_cfa_data_file(self, input_file, output_file):
        """
        Enrichit un fichier de données CFA avec des traductions françaises.
        
        Args:
            input_file: Fichier JSON d'entrée
            output_file: Fichier JSON de sortie enrichi
        """
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                cfa_data = json.load(f)
            
            print(f"📂 Chargement: {len(cfa_data)} chunks depuis {input_file}")
            
            enriched_chunks = []
            
            for i, chunk in enumerate(cfa_data):
                # Enrichir le texte
                original_text = chunk.get('text', '')
                enriched_text = self.enrich_chunk_text(original_text)
                
                # Enrichir les mots-clés
                original_keywords = chunk.get('relevance_keywords', [])
                enriched_keywords = self.enrich_keywords(original_keywords)
                
                # Créer le chunk enrichi
                enriched_chunk = chunk.copy()
                enriched_chunk['text'] = enriched_text
                enriched_chunk['relevance_keywords'] = enriched_keywords
                enriched_chunk['enriched_with_french'] = True
                
                enriched_chunks.append(enriched_chunk)
                
                if (i + 1) % 100 == 0:
                    print(f"   ✅ {i + 1} chunks enrichis...")
            
            # Sauvegarder le fichier enrichi
            with open(output_file, 'w', encoding='utf-8') as f:
                # JSON compact : indispensable pour rester sous les limites Netlify
                json.dump(enriched_chunks, f, ensure_ascii=False, separators=(',', ':'))
            
            print(f"💾 Sauvegarde: {len(enriched_chunks)} chunks enrichis dans {output_file}")
            
            # Statistiques
            french_term_count = sum(1 for chunk in enriched_chunks if '[Termes FR:' in chunk['text'])
            print(f"📊 Statistiques:")
            print(f"   - Chunks avec termes FR: {french_term_count}/{len(enriched_chunks)}")
            print(f"   - Taux d'enrichissement: {french_term_count/len(enriched_chunks):.1%}")
            
            return True
            
        except Exception as e:
            print(f"❌ Erreur enrichissement: {e}")
            return False

def main():
    """Fonction principale d'enrichissement."""
    
    print("🇫🇷 ENRICHISSEMENT CFA AVEC TRADUCTIONS FRANÇAISES")
    print("="*60)
    
    enricher = CFAFrenchEnricher()
    
    # Chemins des fichiers
    cfa_data_dir = Path("../netlify/functions/cfa_data")
    input_file = cfa_data_dir / "cfa_knowledge_embeddings.json"
    output_file = cfa_data_dir / "cfa_knowledge_embeddings_french_enriched.json"
    
    if not input_file.exists():
        print(f"❌ Fichier non trouvé: {input_file}")
        print("   Générez d'abord les données CFA avec generate_cfa_embeddings.py")
        return False
    
    # Enrichissement
    success = enricher.enrich_cfa_data_file(input_file, output_file)
    
    if success:
        print(f"\n✅ ENRICHISSEMENT TERMINÉ")
        print(f"   Fichier créé: {output_file}")
        print(f"   Utilisation: Modifier enhanced-cfa-vector-search.js pour charger ce fichier")
        
        # Instructions pour l'utilisation
        print(f"\n📋 INSTRUCTIONS D'UTILISATION:")
        print(f"1. Modifier enhanced-cfa-vector-search.js")
        print(f"2. Changer 'cfa_knowledge_embeddings.json' -> 'cfa_knowledge_embeddings_french_enriched.json'")
        print(f"3. Redéployer la fonction Netlify")
        print(f"4. Tester avec les requêtes françaises")
    else:
        print(f"\n❌ ÉCHEC DE L'ENRICHISSEMENT")
    
    return success

if __name__ == "__main__":
    main()
