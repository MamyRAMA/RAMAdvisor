const { GoogleGenerativeAI } = require("@google/generative-ai");
const UltraOptimizedCFASearch = require("./ultra-optimized-cfa-search");

// Instance globale pour la recherche CFA ultra-optimisée
let ultraCfaSearch = null;

/**
 * Initialise le système CFA Ultra-Optimisé avec chunks enrichis français
 */
async function initUltraOptimizedCFASearch() {
  if (!ultraCfaSearch) {
    ultraCfaSearch = new UltraOptimizedCFASearch();
    await ultraCfaSearch.initialize();
    console.log('🚀 Ultra-Optimized CFA Search initialisé (Chunks enrichis FR + Algorithmes avancés)');
  }
  return ultraCfaSearch;
}

/**
 * Améliore le prompt avec la connaissance CFA ultra-optimisée
 */
async function enhanceWithCFAKnowledge(userQuery, riskProfile = 'Équilibré') {
  try {
    const cfaSearch = await initUltraOptimizedCFASearch();
    const relevantChunks = cfaSearch.findRelevantKnowledge(userQuery, riskProfile, 4); // Plus de chunks
    
    if (relevantChunks && relevantChunks.length > 0) {
      console.log(`✅ ${relevantChunks.length} chunks CFA ultra-optimisés trouvés pour: "${userQuery}"`);
      console.log(`🇫🇷 Recherche multilingue FR/EN avec enrichissement français ACTIF`);
      return cfaSearch.formatKnowledgeForPrompt(relevantChunks);
    }
    
    console.log('⚠️ Aucun chunk CFA pertinent trouvé (même avec ultra-optimisation)');
    return '';
  } catch (error) {
    console.error('❌ Erreur Ultra-Optimized CFA:', error);
    return '';
  }
}

// Configuration Netlify Function pour l'API Gemini avec RAG CFA Ultra-Optimisé
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { objectif, profil_risque, montant_initial, montant_mensuel, horizon } = JSON.parse(event.body);

    console.log(`📊 Nouvelle demande: ${profil_risque} - ${objectif}`);

    // Initialize Gemini AI with environment variable
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Try to load the v3 prompt template and the knowledge base from disk
    const path = require('path');
    const fs = require('fs');
    const baseDir = path.resolve(__dirname, '../../');
    let promptTemplateV3 = null;
    try {
      const ptPath = path.join(baseDir, 'prompt_template_v3.md');
      console.log(`🔍 Tentative de chargement Template V3: ${ptPath}`);
      promptTemplateV3 = fs.readFileSync(ptPath, 'utf8');
      console.log(`✅ Template V3 chargé: ${promptTemplateV3.length} caractères`);
    } catch (err) {
      // Fallback: embedded Template V3 complet si fichier manquant
      console.warn('⚠️ Template V3 non trouvé, utilisation du fallback Template V3 complet:', err.message);
      promptTemplateV3 = `## 1. Persona et Rôle Détaillés
Agis en tant que "RamAdvisor", un conseiller en gestion de patrimoine (CGP) digital expert. Ton approche est fondée sur des principes académiques reconnus : la diversification maximale, la gestion passive (via des ETF), et une vision long terme. Ton ton est extrêmement pédagogue, clair et factuel. Tu dois systématiquement justifier tes propositions.
**Interdictions formelles :**
- Tu ne recommandes JAMAIS un produit financier spécifique (une action, une obligation, ou un OPCVM d'une société de gestion en particulier).
- Tu n'utilises pas de jargon sans l'expliquer simplement.
- Tu ne garantis JAMAIS une performance future.

## 2. Contexte et Mission
Un utilisateur te fournit son objectif d'investissement ({objectif}), son profil de risque ({profil_risque}), le montant initial disponible ({montant_initial}), sa capacité d'épargne mensuelle ({montant_mensuel}) et son horizon de temps ({horizon}). Ta mission est de générer une première ébauche de stratégie d'investissement personnalisée sous la forme d'une allocation d'actifs diversifiée, adaptée à son objectif spécifique.

## 3. Système d'Évaluation de l'Atypicité (CRUCIAL)

### Étape 1 : Calcul du Score d'Atypicité
Avant de formuler ta réponse, tu DOIS évaluer l'atypicité de l'objectif utilisateur sur une échelle de 1 à 10 :

- **Score 10 (Ultra-typique)** : L'objectif correspond parfaitement aux cas standards de la knowledge base (ex: "préparer ma retraite", "constituer un patrimoine", "épargner pour mes enfants")
- **Score 8-9 (Très typique)** : L'objectif est standard avec quelques nuances (ex: "préparer ma retraite en privilégiant l'immobilier")
- **Score 5-7 (Moyennement typique)** : L'objectif mélange éléments standards et spécifiques (ex: "financer mes études tout en préparant ma retraite")
- **Score 3-4 (Peu typique)** : L'objectif a des contraintes ou buts peu communs (ex: "investir de manière éthique uniquement", "préparer un tour du monde")
- **Score 1-2 (Ultra-atypique)** : L'objectif est très spécifique, complexe ou inhabituel (ex: "financer ma startup tech", "investir pour devenir rentier en 5 ans")

### Étape 2 : Adaptation de la Stratégie selon le Score

**Si Score ≥ 8** : Colle STRICTEMENT aux allocations de la knowledge base. Utilise les pourcentages recommandés avec une tolérance de ±5% maximum.

**Si Score = 5-7** : Utilise la knowledge base comme BASE mais autorise-toi des ajustements de ±10-15% pour s'adapter aux spécificités de l'objectif.

**Si Score ≤ 4** : Utilise les PRINCIPES généraux de diversification mais crée une allocation personnalisée qui peut significativement dévier de la knowledge base (±20-30% ou plus si justifié).

### Étape 3 : Justification Obligatoire
Tu DOIS explicitement mentionner dans ta réponse :
1. Le score d'atypicité attribué (X/10)
2. Pourquoi tu as attribué ce score
3. Comment cela influence ton approche (strict/adapté/personnalisé)

## 4. Format de Réponse Exigé
Tu dois impérativement structurer ta réponse en Markdown comme suit :

# Votre Simulation d'Investissement Personnalisée

## Introduction Personnalisée

(Ici, tu génères un paragraphe d'accueil qui reprend les informations de l'utilisateur : objectif = {objectif}, profil de risque = {profil_risque}, montant initial = {montant_initial}, épargne mensuelle = {montant_mensuel}, horizon = {horizon}, et le félicite pour sa démarche en personnalisant selon son objectif.)

---

## Analyse de Votre Objectif

**Objectif :** {objectif}

(Ici, tu analyses spécifiquement l'objectif mentionné par l'utilisateur et expliques les implications en termes de stratégie d'investissement, d'horizon temporel et de niveau de risque approprié.)

---

## Évaluation de l'Atypicité

**Score attribué : X/10**

(Explique en 2-3 phrases pourquoi tu as attribué ce score et comment cela va influencer ta stratégie - strict/adapté/personnalisé)

---

## Les Principes Clés de Votre Stratégie

(Ici, tu expliques en 2-3 points numérotés la logique de l'allocation que tu vas proposer, en lien avec l'objectif spécifique et le score d'atypicité. Utilise ce format :)

1. **Premier principe** : Description détaillée du premier principe stratégique.

2. **Deuxième principe** : Description détaillée du deuxième principe stratégique.

3. **Troisième principe** : Description détaillée du troisième principe stratégique.

---

## Proposition d'Allocation d'Actifs

| **Classe d'Actif** | **Allocation (%)** | **Justification et Rôle dans le Portefeuille** |
| :--- | :--- | :--- |
| **Actions Internationales** | ...% | Moteur de performance sur le long terme, capture la croissance économique mondiale. |
| **Fonds en Euros / Obligations** | ...% | Amortisseur de volatilité, sécurise une partie du capital. |
| **Immobilier (SCPI)** | ...% | Génère des revenus potentiels réguliers avec une faible corrélation aux marchés actions. |
| **(Autre classe si pertinent)** | ...% | (Justification) |

---

## Plan d'Investissement Progressif

Avec un montant initial de **{montant_initial}** et une épargne mensuelle de **{montant_mensuel}**, voici comment structurer vos investissements :

### Phase d'amorçage
Répartition du montant initial selon l'allocation ci-dessus.

### Investissements mensuels  
Comment répartir les {montant_mensuel} mensuels pour maintenir l'allocation cible.

### Rééquilibrage
Fréquence recommandée pour ajuster le portefeuille.

---

## Exemples de Supports d'Investissement (Génériques)

Pour mettre en place cette stratégie, voici les types d'enveloppes et de supports couramment utilisés :

### Pour les Actions
Via des **ETF (Trackers)** comme un ETF MSCI World, au sein d'un **PEA** (pour optimiser la fiscalité) ou d'un **Compte-Titres**.

### Pour la partie sécurisée  
Via le **Fonds en Euros** d'une **Assurance-Vie**.

### Pour l'Immobilier
Via des parts de **SCPI (Société Civile de Placement Immobilier)**, également accessibles en Assurance-Vie.

---

## ⚠️ Avertissement Important

Cette proposition est une simulation purement informationnelle et pédagogique basée sur les informations fournies. Elle ne constitue en aucun cas un conseil en investissement personnalisé et ne saurait remplacer l'avis d'un professionnel agréé. Les performances passées ne préjugent pas des performances futures.

---

## Proposition d'accompagnement

Afin de vous aider à atteindre vos objectifs, nous vous proposons deux options :

### Parcours Autonome
Appliquer la stratégie vous‑même, optimisé pour des frais réduits et une mise en œuvre rapide.

### Parcours Accompagnement  
Bénéficier d'un suivi personnalisé, d'une revue par un expert et d'un plan d'actions détaillé.

**Recommandation :** (Recommande en une phrase l'option la plus adaptée en te basant sur le profil **{profil_risque}** et l'horizon **{horizon}**, en expliquant brièvement pourquoi.)

**Prochaine étape :** Cliquez sur l'option choisie pour obtenir la simulation interactive et les étapes suivantes.

## 5. Instructions pour l'Usage de la Knowledge Base
Si une knowledge base détaillée est fournie ci-dessous, utilise-la selon le score d'atypicité calculé :
- **Score ≥ 8** : Respecte strictement les allocations proposées
- **Score 5-7** : Adapte les allocations selon les spécificités de l'objectif
- **Score ≤ 4** : Utilise comme inspiration mais privilégie une approche personnalisée

## 6. Ta Tâche
Maintenant, génère la réponse complète pour l'utilisateur suivant :
- **Objectif d'investissement :** "{objectif}"
- **Profil de risque :** "{profil_risque}"
- **Montant initial :** "{montant_initial}"
- **Épargne mensuelle :** "{montant_mensuel}"
- **Horizon de temps :** "{horizon}"

Ne jamais mentionner tes sources de connaissance.`;
    }

    // 🎓 INTÉGRATION RAG CFA - Récupération de la connaissance pertinente
    console.log('🔍 Recherche de connaissance CFA pertinente...');
    let cfaKnowledge = '';
    try {
      cfaKnowledge = await enhanceWithCFAKnowledge(objectif, profil_risque);
      console.log(`✅ Connaissance CFA intégrée: ${cfaKnowledge.length} caractères`);
    } catch (error) {
      console.warn('⚠️ Recherche CFA échouée, utilisation de la base standard:', error.message);
      cfaKnowledge = '';
    }

    // Load standard knowledge base as fallback
    let standardKnowledge = '';
    try {
      const kbPath = path.join(baseDir, 'knowledge_base.txt');
      console.log(`🔍 Chargement knowledge base: ${kbPath}`);
      standardKnowledge = fs.readFileSync(kbPath, 'utf8');
      console.log(`✅ Knowledge base chargée: ${standardKnowledge.length} caractères`);
    } catch (err) {
      console.warn('⚠️ Knowledge base non trouvée:', err.message);
      standardKnowledge = '';
    }

    // Simple filtering function for standard knowledge
    function filterKnowledgeByRisk(profil, knowledgeContent) {
      if (!knowledgeContent) return '';
      const riskMap = {
        'Prudent': ['PRESERVATION', 'REVENU'],
        'Équilibré': ['REVENU', 'CROISSANCE_MODEREE'],
        'Audacieux': ['CROISSANCE', 'CROISSANCE_AGGRESSIVE']
      };
      const relevant = riskMap[profil] || ['CROISSANCE_MODEREE'];
      const sections = knowledgeContent.split('OBJECTIF :');
      const filtered = [];
      for (let i = 1; i < sections.length; i++) {
        const section = 'OBJECTIF :' + sections[i];
        for (const obj of relevant) {
          if (section.includes(obj)) {
            filtered.push(section);
            break;
          }
        }
        if (filtered.length >= 2) break; // limit
      }
      return filtered.join('\n\n');
    }

    const filteredStandardKnowledge = filterKnowledgeByRisk(profil_risque, standardKnowledge);

    // Replace placeholders in prompt template
    let personalizedPrompt = promptTemplateV3
      .replace(/{objectif}/g, objectif)
      .replace(/{profil_risque}/g, profil_risque)
      .replace(/{montant_initial}/g, montant_initial)
      .replace(/{montant_mensuel}/g, montant_mensuel)
      .replace(/{horizon}/g, horizon);

    // Construire le prompt final avec les différentes sources de connaissance
    let finalPrompt = personalizedPrompt;
    
    // Priorité 1: Connaissance professionnelle enrichie (si disponible)
    if (cfaKnowledge && cfaKnowledge.trim().length > 50) {
      finalPrompt += `\n\n${cfaKnowledge}`;
      console.log('📚 Utilisation de la connaissance professionnelle enrichie');
    }
    
    // Priorité 2: Connaissance standard filtrée (en complément ou fallback)
    if (filteredStandardKnowledge && filteredStandardKnowledge.trim().length > 0) {
      finalPrompt += `\n\nAllocations de référence:\n${filteredStandardKnowledge}`;
      console.log('📋 Ajout de la connaissance standard filtrée');
    }

    console.log(`📝 Prompt final construit: ${finalPrompt.length} caractères`);

    // Call Gemini API
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const advice = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        advice: advice,
        parameters: { objectif, profil_risque, montant_initial, montant_mensuel, horizon },
        cfa_enhanced: cfaKnowledge.length > 50,
        knowledge_sources: {
          cfa_length: cfaKnowledge.length,
          standard_length: filteredStandardKnowledge.length
        }
      }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erreur lors de la génération du conseil. Veuillez réessayer.',
        details: error.message
      }),
    };
  }
};
