# Formation « Les Fondamentaux de l'Investisseur » — Document de conception

> Produit d'entrée 100 % en ligne à 45 €, en amont du Coaching Financier Autonomie (350 €).
> Créé le 2026-07-19 (branche `feat/chatbot-pedagogique`).

---

## 1. Benchmark synthétique

| Offre | Prix | Format | Positionnement |
|---|---|---|---|
| MOOC AMF / Swiss Life AM | Gratuit | Modules 1–2 h + quiz + attestation | Institutionnel, généraliste, peu actionnable |
| Bourse Direct, ABC Bourse | Gratuit | Webinaires / fiches | Acquisition client courtier |
| École de la Bourse (Initiation Premium) | ~ plusieurs centaines d'€ (CPF), parcours certifiants 1 240–1 490 € | 10 modules, vidéos, quiz, portefeuille virtuel | Certifiant, orienté « bourse » généraliste |
| Alti Trading | dès 349 € | Vidéos + communauté | Trading actif, tous profils |
| UGK Trading, InvestirZen, CentralCharts | ~300–700 € | Vidéos + communauté + outils | Trading / analyse technique |

**Lecture du marché** : le marché français est bipolaire — du gratuit institutionnel peu engageant d'un côté, des formations trading à 349 €+ de l'autre. **Le créneau 40–80 € « initiation sérieuse à l'investissement long terme, anti-trading » est quasiment vide.**

**Calibrage retenu pour 45 €** :
- 6 modules, ~5–6 h de travail au total (lecture + quiz + exercices) : plus profond qu'un MOOC gratuit, nettement sous une formation à 350 €.
- Texte structuré + schémas + quiz notés + attestation de fin : crédible sans production vidéo.
- Différenciation : rigueur type gestion institutionnelle (fondateur CFA/CAIA), adaptation 100 % française (PEA, assurance-vie, CTO, PER, fiscalité), philosophie passive long terme.

## 2. Proposition de valeur et articulation avec le coaching

**Promesse** : « Comprenez enfin ce que vous faites avec votre argent. Les fondamentaux enseignés aux professionnels de la gestion, traduits pour l'investisseur particulier français. »

**Positionnement** : produit d'**initiation et de mise en action** — pas un substitut au coaching.

| | Formation (45 €) | Coaching Autonomie (350 €) |
|---|---|---|
| Format | 100 % en ligne, autonome | 4 sessions individuelles 1 h |
| Contenu | Savoir généraliste, identique pour tous | Appliqué à VOTRE situation |
| Personnalisation | Aucune (limite explicite) | Totale |
| Accompagnement humain | Aucun (limite explicite) | Individuel |
| Résultat | Comprendre + méthode générique | Votre stratégie personnelle opérationnelle |

**Progression naturelle** : chaque module se termine par « Ce que la formation ne peut pas faire pour vous » (appliquer à votre situation) → CTA coaching. Le module 5 fait rédiger une ébauche de politique d'investissement personnelle : matière première idéale pour démarrer le coaching. Remise de 45 € sur le coaching pour les diplômés de la formation (le produit s'autofinance psychologiquement).

**Sources de contenu** : les concepts sont sélectionnés dans le curriculum CFA 2023 (`docs/courses`) — valeur temps de l'argent, risque/rendement, diversification, classes d'actifs, efficience des marchés, politique d'investissement (IPS), finance comportementale, gestion des risques. **Tout le texte est une rédaction originale en français** : aucune reproduction du curriculum (copyright CFA Institute), aucun usage de la marque CFA dans le nom ou le marketing du produit (seules les certifications individuelles du fondateur sont mentionnées, avec les disclaimers déjà en place sur le site).

## 3. Programme détaillé

Chaque module = sections « Essentiel » (accessible à tous) + encadrés « 🎓 Pour aller plus loin » (niveau intermédiaire/avancé) + quiz de 8 questions (validation à 6/8) + action concrète.

| # | Module | Contenus clés (origine) | Durée |
|---|---|---|---|
| 1 | **Les fondations** | Pourquoi investir, inflation, intérêts composés, valeur temps de l'argent, taux réel vs nominal, épargne de précaution avant tout (CFA L1 Quantitative Methods — TVM) | ~45 min |
| 2 | **Risque et rendement** | Volatilité, distribution des rendements, prime de risque, lien risque/rendement, diversification et corrélation, horizon de placement (CFA L1 Portfolio Management + Quant) | ~50 min |
| 3 | **Les classes d'actifs et les ETF** | Actions, obligations, monétaire, immobilier, matières premières, or ; fonds actifs vs ETF ; efficience des marchés ; frais et leur impact composé (CFA L1 Equity, Fixed Income, Alternatives) | ~60 min |
| 4 | **Les enveloppes françaises** | PEA, assurance-vie, CTO, PER : plafonds, fiscalité, cas d'usage, ordre de priorité type ; adaptation 100 % française (hors CFA — expertise site) | ~50 min |
| 5 | **Construire son portefeuille** | Profil de risque, objectifs, contraintes, allocation stratégique, politique d'investissement personnelle simplifiée, rééquilibrage (CFA L1 Basics of Portfolio Planning & Construction — IPS) | ~60 min |
| 6 | **Psychologie et passage à l'action** | Biais comportementaux (aversion aux pertes, excès de confiance, troupeau…), bulles et krachs, erreurs classiques, DCA, plan d'action en 30 jours, hygiène de suivi (CFA L1 Market Efficiency/Behavioral + L3 Behavioral Finance) | ~55 min |

**Attestation** de suivi (non certifiante, généré côté client) après validation des 6 quiz.

**Limites explicites affichées** (page de vente + app) : aucune personnalisation, aucune recommandation individuelle, aucun accompagnement humain, contenu éducatif ≠ conseil en investissement.

## 4. Parcours utilisateur

1. **Découverte** : page de vente `pages/formation.html` (programme, prix, FAQ, limites, articulation coaching). Entrées : Académie, section Offres de l'accueil, footer.
2. **Paiement** : bouton → fonction `formation-checkout` → session Stripe Checkout (45 €, CB) → paiement chez Stripe (aucune donnée bancaire ne touche notre site).
3. **Accès immédiat** : Stripe redirige vers `formation/index.html?session_id=…` → la fonction `formation-access` vérifie le paiement auprès de Stripe et émet un **jeton d'accès signé (1 an)**, stocké en localStorage. Pas de compte/mot de passe : friction minimale, cohérente avec un produit à 45 €.
4. **Consommation** : app monopage `formation/` — sommaire, lecture séquentielle (modules verrouillés jusqu'à validation du quiz précédent), quiz corrigés avec explications, barre de progression.
5. **Progression** : localStorage (scores de quiz, sections lues). Attestation téléchargeable après le module 6.
6. **Récupération d'accès** (changement d'appareil) : formulaire email → `formation-access` (action `recover`) vérifie l'achat chez Stripe → renvoie un lien magique par email (Resend). Sans clé Resend configurée : message invitant à écrire au support.
7. **Conversion** : CTA coaching en fin de chaque module + écran de fin (remise de 45 €).

## 5. Architecture technique

```
pages/formation.html            Page de vente (publique)
formation/index.html            App e-learning (shell public, contenu gated)
js/formation-app.js             Logique app : accès, sommaire, lecteur, quiz, progression
netlify/functions/
  formation-checkout.js         POST → crée la session Stripe Checkout (ou mode démo)
  formation-access.js           POST verify  : session_id Stripe → JWT signé (HMAC-SHA256)
                                POST recover : email → lien magique si achat retrouvé
  formation-content.js          GET module?id=N + Bearer JWT → JSON du module (sinon 401)
  formation_data/
    program.json                Métadonnées programme (titres, durées, objectifs) — servi sans auth
    module1..6.html             Contenu des modules (gated, jamais servi statiquement)
    quizzes.json                Questions/réponses/explications (gated ; réponses jamais envoyées
                                au client : correction côté serveur via formation-content POST)
```

**Choix structurants**
- **Stripe via API REST + fetch** (pas de dépendance npm) : `checkout.sessions.create`, `checkout.sessions.retrieve`, `customers/search`. Source de vérité des achats = Stripe (pas de base de données à opérer).
- **JWT maison HMAC-SHA256** via `crypto` natif (payload : email, exp 1 an, scope `formation-v1`).
- **Contenu gated côté serveur** : les fichiers de `formation_data/` sont dans `included_files` de netlify.toml et lus par la fonction — jamais exposés en statique.
- **Correction des quiz côté serveur** : le client n'a jamais les bonnes réponses ; `formation-content` corrige et renvoie score + explications.
- **Mode démo** : sans `STRIPE_SECRET_KEY`, `formation-checkout` renvoie un accès de démonstration (bandeau « DÉMO ») pour tester le parcours de bout en bout en local/preview.

**Variables d'environnement** (Netlify → Site settings → Environment variables)
- `STRIPE_SECRET_KEY` (sk_live_… / sk_test_…) — requis en production
- `FORMATION_JWT_SECRET` — chaîne aléatoire longue, requis en production
- `URL` — fournie par Netlify automatiquement (base des redirections)
- `RESEND_API_KEY` — optionnel (récupération d'accès par email)
- `FORMATION_COACHING_COUPON` — optionnel, code promo affiché aux diplômés

## 6. Conformité

- Produit vendu comme **formation / éducation financière** — cohérent avec le statut (pas de CIF, pas d'ORIAS) : aucune promesse de performance, aucune recommandation individualisée.
- Mentions systématiques : « contenu éducatif, ne constitue pas un conseil en investissement ; investir comporte un risque de perte en capital ».
- Droit de rétractation : contenu numérique à exécution immédiate — case de renonciation expresse au droit de rétractation cochée avant paiement (art. L221-28 13° Code conso).
- Marques : ni « CFA » ni « CAIA » dans le nom/l'argumentaire produit ; disclaimers existants conservés sur les pages où les certifications du fondateur apparaissent.
