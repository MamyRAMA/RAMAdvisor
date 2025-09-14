# Configuration et test de la clé API Gemini
import google.generativeai as genai
import os
from pathlib import Path

# Configuration API Gemini
API_KEY = os.getenv('GEMINI_API_KEY')
if not API_KEY:
    try:
        from getpass import getpass
        API_KEY = getpass("Entrez votre clé API Gemini: ")
    except:
        API_KEY = input("Entrez votre clé API Gemini: ")
    os.environ['GEMINI_API_KEY'] = API_KEY

genai.configure(api_key=API_KEY)

# Test de la clé API
try:
    model = genai.GenerativeModel("gemini-2.0-flash")
    test_response = model.generate_content("Réponds simplement 'OK' si tu me reçois.")
    print("✅ Clé API Gemini fonctionne correctement")
    print(f"   Réponse test: {test_response.text}")
except Exception as e:
    print(f"❌ Erreur clé API: {e}")
    raise

# Chargement des fichiers (même logique que le site web)
with open('prompt_template_v3.md', 'r', encoding='utf-8') as f:
    prompt_template_v3 = f.read()

with open('knowledge_base.txt', 'r', encoding='utf-8') as f:
    knowledge_base = f.read()

print(f"✅ Template V3 chargé: {len(prompt_template_v3)} caractères")
print(f"✅ Knowledge base chargée: {len(knowledge_base)} caractères")

# Fonction de filtrage identique au site web
def filter_knowledge_by_risk(profil_risque, knowledge_content):
    """Filtre la knowledge base selon le profil de risque (logique identique au site)."""
    if not knowledge_content:
        return ''
    
    risk_map = {
        'Prudent': ['PRESERVATION', 'REVENU'],
        'Équilibré': ['REVENU', 'CROISSANCE_MODEREE'],
        'Audacieux': ['CROISSANCE', 'CROISSANCE_AGGRESSIVE']
    }
    
    relevant = risk_map.get(profil_risque, ['CROISSANCE_MODEREE'])
    sections = knowledge_content.split('OBJECTIF :')
    filtered = []
    
    for i in range(1, len(sections)):
        section = 'OBJECTIF :' + sections[i]
        for obj in relevant:
            if obj in section:
                filtered.append(section)
                break
        if len(filtered) >= 2:
            break
    
    return '\n\n'.join(filtered)

def generate_advice_like_website(client_data):
    """Génère un conseil exactement comme le site web (même logique, même prompt)."""
    
    # 1. Personnalisation du prompt V3 (identique au site)
    personalized_prompt = prompt_template_v3.format(**client_data)
    
    # 2. Filtrage knowledge base (logique identique au site)
    filtered_knowledge = filter_knowledge_by_risk(client_data['profil_risque'], knowledge_base)
    
    # 3. Construction du prompt final (identique au site)
    final_prompt = personalized_prompt
    if filtered_knowledge and filtered_knowledge.strip():
        final_prompt += f"\n\nAllocations de référence:\n{filtered_knowledge}"
    
    # 4. Appel Gemini avec le même modèle que le site
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(final_prompt)
    
    return response.text, len(final_prompt)

print("🔧 Fonctions utilitaires chargées (logique identique au site web)")
