#!/usr/bin/env python3
"""
RAM Advisor - Version Ultra Allégée
Compatible Python 3.13 + Render gratuit
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any

import google.generativeai as genai
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleKnowledgeBase:
    """Base de connaissances ultra-simplifiée."""
    
    def __init__(self):
        self.knowledge_text = """
        Guide d'investissement RAM Advisor:
        
        1. ÉPARGNE RETRAITE:
        - Jeunes (20-35 ans): 70% actions, 30% obligations
        - Adultes (35-50 ans): 60% actions, 40% obligations  
        - Seniors (50+ ans): 40% actions, 60% obligations
        
        2. PROFILS DE RISQUE:
        - Conservateur: Obligations, livrets, fonds euros
        - Modéré: Mix équilibré actions/obligations
        - Dynamique: Forte proportion d'actions
        
        3. MONTANTS RECOMMANDÉS:
        - Épargne d'urgence: 3-6 mois de charges
        - Investissement mensuel: 10-20% des revenus
        - Diversification géographique recommandée
        
        4. VÉHICULES D'INVESTISSEMENT:
        - PEA: Actions européennes (avantage fiscal)
        - Assurance-vie: Diversification, transmission
        - CTO: Flexibilité maximale
        - PER: Déduction fiscale, épargne retraite
        """
        
    def search(self, query: str) -> str:
        """Recherche simple dans la base de connaissances."""
        return self.knowledge_text

class GeminiAI:
    """Client Gemini AI simplifié."""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY manquante")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        
    def generate_advice(self, user_data: Dict[str, Any], knowledge: str) -> str:
        """Génère un conseil d'investissement."""
        
        prompt = f"""
        Tu es un conseiller financier expert. Voici les informations du client :
        
        Objectif: {user_data.get('goal', 'Non spécifié')}
        Montant initial: {user_data.get('initial_amount', 0)}€
        Versement mensuel: {user_data.get('monthly_amount', 0)}€
        Profil de risque: {user_data.get('risk_profile', 'Non spécifié')}
        
        Base de connaissances:
        {knowledge}
        
        Donne un conseil personnalisé en français, structuré avec:
        1. Stratégie recommandée
        2. Allocation d'actifs suggérée
        3. Véhicules d'investissement conseillés
        4. Points d'attention
        
        Sois concis mais précis (200-300 mots).
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Erreur Gemini: {e}")
            return f"Erreur lors de la génération du conseil: {str(e)}"

# HTTP Server simple avec Python standard
import http.server
import socketserver
import urllib.parse
import json
from http import HTTPStatus

class RAMAdvisorHandler(http.server.BaseHTTPRequestHandler):
    
    def __init__(self, *args, **kwargs):
        self.kb = SimpleKnowledgeBase()
        try:
            self.ai = GeminiAI()
            self.ai_available = True
        except Exception as e:
            logger.error(f"Erreur initialisation Gemini: {e}")
            self.ai_available = False
        super().__init__(*args, **kwargs)
    
    def _set_headers(self, status=HTTPStatus.OK):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers()
    
    def do_GET(self):
        if self.path == '/':
            self._set_headers()
            response = {
                "message": "RAM Advisor AI Service (Version Ultra Allégée)",
                "status": "active",
                "version": "1.0.0-ultra-light"
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif self.path == '/health':
            self._set_headers()
            response = {
                "status": "healthy",
                "knowledge_base_loaded": True,
                "gemini_configured": self.ai_available
            }
            self.wfile.write(json.dumps(response).encode())
            
        else:
            self._set_headers(HTTPStatus.NOT_FOUND)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_POST(self):
        if self.path == '/simulate':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                user_data = json.loads(post_data.decode())
                
                if not self.ai_available:
                    self._set_headers(HTTPStatus.SERVICE_UNAVAILABLE)
                    self.wfile.write(json.dumps({
                        "error": "Service IA indisponible",
                        "details": "Vérifiez GEMINI_API_KEY"
                    }).encode())
                    return
                
                # Recherche dans la base de connaissances
                knowledge = self.kb.search(user_data.get('goal', ''))
                
                # Génération du conseil
                advice = self.ai.generate_advice(user_data, knowledge)
                
                self._set_headers()
                response = {
                    "response": advice,
                    "sources": [{"type": "knowledge_base", "content": "Guide RAM Advisor"}],
                    "confidence_score": 0.8
                }
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                logger.error(f"Erreur simulation: {e}")
                self._set_headers(HTTPStatus.INTERNAL_SERVER_ERROR)
                self.wfile.write(json.dumps({
                    "error": "Erreur lors de la simulation",
                    "details": str(e)
                }).encode())
        else:
            self._set_headers(HTTPStatus.NOT_FOUND)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

def run_server():
    """Lance le serveur HTTP."""
    port = int(os.environ.get('PORT', 8000))
    
    with socketserver.TCPServer(("", port), RAMAdvisorHandler) as httpd:
        logger.info(f"🚀 RAM Advisor démarré sur le port {port}")
        logger.info(f"🌐 URL: http://localhost:{port}")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            logger.info("🛑 Arrêt du serveur")

if __name__ == "__main__":
    run_server()
