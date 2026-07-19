# Formation « Les Fondamentaux de l'Investisseur » — Tests et lancement

## 1. Tester en local (mode démo, sans Stripe)

```bash
# Tests automatisés (données, JWT, gating, correction des quiz) :
node scripts/test_formation.mjs        # attendu : 60 OK, 0 échec

# Parcours complet dans le navigateur :
npx netlify dev                        # sert le site + les fonctions sur http://localhost:8888
```

Puis ouvrir `http://localhost:8888/pages/formation.html` → cliquer « Accéder à la formation » :
sans `STRIPE_SECRET_KEY`, un **accès de démonstration** est délivré (bandeau orange « Mode
DÉMONSTRATION ») et tout le parcours est testable : modules verrouillés/déverrouillés, quiz
corrigés côté serveur, progression, attestation imprimable.

Checklist manuelle :
- [ ] Page de vente : programme, limites explicites, FAQ, bouton d'achat.
- [ ] `formation/index.html` sans jeton → écran « Accès à la formation » avec lien d'achat.
- [ ] Après « achat » démo → sommaire, seuls Module 1 accessible.
- [ ] Quiz raté (< 6/8) → explications + bouton « Retenter ».
- [ ] Quiz réussi → module suivant déverrouillé, barre de progression mise à jour.
- [ ] 6 modules validés → bloc félicitations + attestation (impression) + CTA coaching.
- [ ] Vider localStorage → l'accès retombe sur l'écran d'accueil (jeton exigé).

## 2. Mise en production

### a. Stripe (obligatoire)
1. Créer un compte sur stripe.com (ou utiliser l'existant), activer les paiements.
2. Récupérer la **clé secrète** (mode test d'abord : `sk_test_…`, puis `sk_live_…`).
3. Netlify → Site configuration → Environment variables :
   - `STRIPE_SECRET_KEY` = `sk_live_…`
   - `FORMATION_JWT_SECRET` = longue chaîne aléatoire (ex. `openssl rand -hex 32`)
4. Aucun produit à créer côté Stripe : la fonction `formation-checkout` crée le prix
   (45 €) à la volée et tague la session `metadata.product=fondamentaux-v1`.
5. Tester d'abord avec `sk_test_…` + carte de test `4242 4242 4242 4242`.

### b. Récupération d'accès par email (recommandé, optionnel)
1. Créer un compte resend.com, vérifier le domaine d'envoi.
2. Variables : `RESEND_API_KEY` = `re_…`, `FORMATION_EMAIL_FROM` = `RAM Advisor <acces@ramadvisor.fr>`.
3. Sans ces variables, le formulaire « accès perdu » renvoie vers contact@ramadvisor.fr (fonctionnel mais manuel).

### c. Déploiement
- Cette branche de refonte contient déjà tout le nécessaire (fonctions + contenus + refonte UI) : la déployer telle quelle sur Netlify suffit pour les tests (mode démo sans variables Stripe). Pour la production finale : merger la branche retenue dans `main` (déploiement automatique).
- `netlify.toml` inclut déjà `netlify/functions/formation_data/*` dans `included_files`.
- Vérifier en preview Netlify (sans variables Stripe, la preview reste en mode démo — c'est voulu).

### d. Recette en production
- [ ] Achat réel en mode test Stripe (carte 4242…) → redirection → accès immédiat.
- [ ] Email de la session visible dans le dashboard Stripe.
- [ ] « Récupérer mon accès » avec l'email d'achat → réception du lien magique.
- [ ] Passer la clé en `sk_live_…` et faire un achat réel de 45 € (remboursable depuis Stripe).

## 3. Exploitation

- **Suivi des ventes** : dashboard Stripe (source de vérité unique, aucune base de données à gérer).
- **Remboursement geste commercial** : Stripe → Payments → Refund.
- **Remise coaching diplômés (45 €)** : créer si besoin un code promo dans Calendly/facturation ;
  l'app demande simplement de mentionner l'attestation lors de l'appel.
- **Renouvellement d'accès après 1 an** : l'utilisateur peut repasser par « Récupérer mon accès »
  (un nouveau jeton d'1 an est émis tant que l'achat existe chez Stripe) — la promesse
  publique reste « accès 1 an », le renouvellement est un geste commercial automatique.
- **Mise à jour du contenu** : éditer `netlify/functions/formation_data/module*.html` /
  `quizzes.json` puis relancer `node scripts/test_formation.mjs` avant de pousser.

## 4. Fichiers du produit

| Rôle | Fichier |
|---|---|
| Page de vente | `pages/formation.html` |
| App e-learning | `formation/index.html` + `js/formation-app.js` |
| Contenu (gated) | `netlify/functions/formation_data/` (program.json, module1-6.html, quizzes.json) |
| Paiement | `netlify/functions/formation-checkout.js` |
| Accès / récupération | `netlify/functions/formation-access.js` |
| Contenu + correction quiz | `netlify/functions/formation-content.js` |
| Partagé (JWT, Stripe REST) | `netlify/functions/lib/formation-shared.js` |
| Tests | `scripts/test_formation.mjs` |
| Conception | `docs/formation/PLAN.md` |
