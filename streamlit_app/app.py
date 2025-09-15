import streamlit as st
import google.generativeai as genai
import os
from pathlib import Path
import time

# Configuration de la page
st.set_page_config(
    page_title="RAMAdvisor - Simulation d'Investissement",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS personnalisé pour le style
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        color: #1f2937;
        margin-bottom: 2rem;
    }
    .investment-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 1rem;
        color: white;
        margin: 1rem 0;
    }
    .result-container {
        background-color: #f8fafc;
        padding: 2rem;
        border-radius: 0.5rem;
        border-left: 4px solid #3b82f6;
        margin: 1rem 0;
    }
    .success-message {
        background-color: #d1fae5;
        color: #065f46;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #10b981;
    }
    .error-message {
        background-color: #fee2e2;
        color: #991b1b;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #ef4444;
    }
</style>
""", unsafe_allow_html=True)

# Fonctions utilitaires (identiques au site web)
@st.cache_data
def load_knowledge_base():
    """Charge la base de connaissances"""
    # Essayer plusieurs chemins possibles
    possible_paths = [
        Path(__file__).parent.parent / "knowledge_base.txt",  # Dossier parent
        Path(__file__).parent / "knowledge_base.txt",         # Même dossier
        Path("knowledge_base.txt"),                           # Dossier courant
        Path("../knowledge_base.txt")                         # Dossier parent relatif
    ]
    
    for knowledge_path in possible_paths:
        try:
            if knowledge_path.exists():
                with open(knowledge_path, 'r', encoding='utf-8') as f:
                    return f.read()
        except Exception as e:
            continue
    
    st.error("⚠️ Fichier knowledge_base.txt non trouvé dans les emplacements attendus!")
    st.info("📁 Copiez le fichier knowledge_base.txt dans le dossier streamlit_app/")
    return ""

@st.cache_data
def load_prompt_template():
    """Charge le template de prompt V3"""
    # Essayer plusieurs chemins possibles
    possible_paths = [
        Path(__file__).parent.parent / "prompt_template_v3.md",  # Dossier parent
        Path(__file__).parent / "prompt_template_v3.md",         # Même dossier
        Path("prompt_template_v3.md"),                           # Dossier courant
        Path("../prompt_template_v3.md")                         # Dossier parent relatif
    ]
    
    for template_path in possible_paths:
        try:
            if template_path.exists():
                with open(template_path, 'r', encoding='utf-8') as f:
                    return f.read()
        except Exception as e:
            continue
    
    st.error("⚠️ Fichier prompt_template_v3.md non trouvé dans les emplacements attendus!")
    st.info("📁 Copiez le fichier prompt_template_v3.md dans le dossier streamlit_app/")
    return ""

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

def generate_investment_advice(client_data):
    """Génère un conseil d'investissement (même logique que le site web)"""
    
    # Chargement des données
    prompt_template = load_prompt_template()
    knowledge_base = load_knowledge_base()
    
    if not prompt_template or not knowledge_base:
        return None, "Erreur de chargement des fichiers template ou knowledge base"
    
    try:
        # 1. Personnalisation du prompt V3 (identique au site)
        personalized_prompt = prompt_template.format(**client_data)
        
        # 2. Filtrage knowledge base (logique identique au site)
        filtered_knowledge = filter_knowledge_by_risk(client_data['profil_risque'], knowledge_base)
        
        # 3. Construction du prompt final (identique au site)
        final_prompt = personalized_prompt
        if filtered_knowledge and filtered_knowledge.strip():
            final_prompt += f"\n\nAllocations de référence:\n{filtered_knowledge}"
        
        # 4. Appel Gemini avec le même modèle que le site
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(final_prompt)
        
        return response.text, None
        
    except Exception as e:
        return None, str(e)

# Interface utilisateur
def main():
    # En-tête
    st.markdown('<h1 class="main-header">💰 RAMAdvisor</h1>', unsafe_allow_html=True)
    st.markdown('<div class="investment-card"><h2>Simulation d\'Investissement Personnalisée</h2><p>Obtenez des conseils d\'investissement adaptés à votre profil grâce à l\'IA avancée.</p></div>', unsafe_allow_html=True)
    
    # Configuration API dans la sidebar
    with st.sidebar:
        st.header("🔧 Configuration")
        
        # Vérifier d'abord si une clé API est dans l'environnement
        env_api_key = os.getenv('GEMINI_API_KEY')
        
        if env_api_key:
            # Si clé API dans .env, l'utiliser automatiquement
            genai.configure(api_key=env_api_key)
            st.success("✅ API configurée (depuis .env)")
            api_key = env_api_key
        else:
            # Sinon, demander à l'utilisateur
            api_key = st.text_input(
                "Clé API Gemini:",
                type="password",
                help="Entrez votre clé API Google Gemini",
                placeholder="AIzaSy..."
            )
            
            if api_key:
                genai.configure(api_key=api_key)
                st.success("✅ API configurée")
            else:
                st.warning("⚠️ Clé API requise")
                api_key = None
        
        st.markdown("---")
        st.markdown("### 📋 Informations")
        st.info("Cette application utilise la même logique que le site RAMAdvisor pour générer des conseils d'investissement personnalisés.")
    
    # Formulaire principal
    st.header("📊 Vos Informations d'Investissement")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("🎯 Objectif d'Investissement")
        objectif = st.text_area(
            "Décrivez votre objectif d'investissement:",
            placeholder="Ex: Préparer ma retraite en diversifiant mon portefeuille...",
            height=100
        )
        
        st.subheader("⚖️ Profil de Risque")
        profil_risque = st.selectbox(
            "Quel est votre profil de risque ?",
            ["Prudent", "Équilibré", "Audacieux"],
            help="Prudent: Préservation du capital, Équilibré: Croissance modérée, Audacieux: Croissance agressive"
        )
    
    with col2:
        st.subheader("💵 Montants")
        montant_initial = st.number_input(
            "Montant initial (€):",
            min_value=0,
            value=50000,
            step=1000,
            format="%d"
        )
        
        montant_mensuel = st.number_input(
            "Versement mensuel (€):",
            min_value=0,
            value=1000,
            step=100,
            format="%d"
        )
        
        st.subheader("⏰ Durée")
        horizon = st.number_input(
            "Horizon d'investissement (années):",
            min_value=1,
            max_value=50,
            value=15,
            step=1
        )
    
    # Bouton de génération
    st.markdown("---")
    
    if st.button("🚀 Générer ma Simulation d'Investissement", type="primary", use_container_width=True):
        if not api_key:
            st.error("❌ Veuillez configurer votre clé API Gemini dans la sidebar.")
            return
        
        if not objectif.strip():
            st.error("❌ Veuillez décrire votre objectif d'investissement.")
            return
        
        # Préparation des données client
        client_data = {
            "objectif": objectif.strip(),
            "profil_risque": profil_risque,
            "montant_initial": f"{montant_initial}€",
            "montant_mensuel": f"{montant_mensuel}€",
            "horizon": f"{horizon} ans"
        }
        
        # Génération avec indicateur de progression
        with st.spinner("🤖 Génération de votre conseil d'investissement personnalisé..."):
            advice, error = generate_investment_advice(client_data)
        
        # Affichage des résultats
        if error:
            st.markdown(f'<div class="error-message">❌ <strong>Erreur:</strong> {error}</div>', unsafe_allow_html=True)
        elif advice:
            st.markdown('<div class="success-message">✅ <strong>Conseil généré avec succès!</strong></div>', unsafe_allow_html=True)
            
            # Affichage du conseil dans un container stylé
            st.markdown('<div class="result-container">', unsafe_allow_html=True)
            st.markdown("## 📋 Votre Conseil d'Investissement Personnalisé")
            st.markdown(advice)
            st.markdown('</div>', unsafe_allow_html=True)
            
            # Bouton de téléchargement
            st.download_button(
                label="📥 Télécharger le conseil (PDF)",
                data=advice,
                file_name=f"conseil_investissement_{int(time.time())}.txt",
                mime="text/plain"
            )
        else:
            st.error("❌ Erreur lors de la génération du conseil.")
    
    # Footer
    st.markdown("---")
    st.markdown(
        """
        <div style="text-align: center; color: #6b7280;">
            <p>💡 <strong>RAMAdvisor Streamlit App</strong> - Powered by Google Gemini AI</p>
            <p>⚠️ <em>Les conseils générés sont à titre informatif uniquement. Consultez un conseiller financier professionnel.</em></p>
        </div>
        """, 
        unsafe_allow_html=True
    )

if __name__ == "__main__":
    main()