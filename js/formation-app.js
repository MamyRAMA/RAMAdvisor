// App e-learning « Les Fondamentaux de l'Investisseur ».
// Accès par jeton signé (émis par formation-access après vérification Stripe),
// contenu servi par formation-content (gated), progression en localStorage.

(function () {
    'use strict';

    var API = '/.netlify/functions';
    var TOKEN_KEY = 'formation_token';
    var PROGRESS_KEY = 'formation_progress';

    var state = { token: null, demo: false, program: null, currentModule: null, quizData: null };

    // ---------- Utilitaires ----------

    function $(id) { return document.getElementById(id); }

    function show(viewId) {
        ['viewGate', 'viewDashboard', 'viewModule'].forEach(function (v) {
            $(v).classList.toggle('hidden', v !== viewId);
        });
        $('btnSommaire').classList.toggle('hidden', viewId !== 'viewModule');
        window.scrollTo(0, 0);
    }

    function tokenPayload(token) {
        try {
            var part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(part));
        } catch (e) { return null; }
    }

    function getProgress() {
        try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || { completed: [], scores: {} }; }
        catch (e) { return { completed: [], scores: {} }; }
    }

    function saveProgress(p) { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); }

    function isCompleted(id) { return getProgress().completed.indexOf(id) !== -1; }

    function isUnlocked(id) { return id === 1 || isCompleted(id - 1); }

    function apiGet(params) {
        return fetch(API + '/formation-content?' + params, {
            headers: state.token ? { Authorization: 'Bearer ' + state.token } : {}
        }).then(function (r) {
            return r.json().then(function (d) {
                if (!r.ok) { var e = new Error(d.error || 'Erreur serveur'); e.status = r.status; throw e; }
                return d;
            });
        });
    }

    // ---------- Acquisition du jeton ----------

    function resolveToken() {
        var params = new URLSearchParams(window.location.search);

        // 1. Lien magique (?token=…)
        if (params.get('token')) {
            var t = params.get('token');
            if (tokenPayload(t)) {
                localStorage.setItem(TOKEN_KEY, t);
                history.replaceState({}, '', window.location.pathname);
            }
            return Promise.resolve(localStorage.getItem(TOKEN_KEY));
        }

        // 2. Retour de paiement Stripe (?session_id=…)
        if (params.get('session_id')) {
            $('gateMessage').textContent = 'Paiement en cours de confirmation…';
            show('viewGate');
            return fetch(API + '/formation-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify', session_id: params.get('session_id') })
            })
                .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
                .then(function (res) {
                    if (res.ok && res.d.token) {
                        localStorage.setItem(TOKEN_KEY, res.d.token);
                        history.replaceState({}, '', window.location.pathname);
                        return res.d.token;
                    }
                    throw new Error(res.d.error || 'Vérification impossible');
                });
        }

        // 3. Jeton déjà présent sur cet appareil
        return Promise.resolve(localStorage.getItem(TOKEN_KEY));
    }

    function showGate(message) {
        $('gateMessage').textContent = message ||
            'Cette page est réservée aux personnes inscrites à la formation.';
        $('gateActions').classList.remove('hidden');
        show('viewGate');
    }

    // ---------- Sommaire ----------

    function renderDashboard() {
        var progress = getProgress();
        var list = $('moduleList');
        list.innerHTML = '';

        state.program.modules.forEach(function (m) {
            var done = isCompleted(m.id);
            var unlocked = isUnlocked(m.id);
            var score = progress.scores[m.id];

            var card = document.createElement('div');
            card.className = 'card flex gap-4 items-start' + (unlocked ? '' : ' opacity-60');
            card.innerHTML =
                '<div class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold ' +
                (done ? 'bg-green-100 text-green-700' : unlocked ? 'bg-violet-100 text-violet-800' : 'bg-gray-100 text-gray-400') +
                '">' + (done ? '✓' : unlocked ? m.id : '🔒') + '</div>' +
                '<div class="flex-grow">' +
                '<h3 class="font-bold text-gray-900">Module ' + m.id + ' — ' + m.title +
                ' <span class="text-sm font-normal text-gray-500">· ' + m.duration + '</span></h3>' +
                '<p class="text-sm text-gray-600 mt-1">' + m.objective + '</p>' +
                (done && score !== undefined ? '<p class="text-xs text-green-700 mt-1 font-semibold">Quiz validé : ' + score + '/' + state.program.questionsPerQuiz + '</p>' : '') +
                '</div>' +
                (unlocked
                    ? '<button data-module="' + m.id + '" class="shrink-0 self-center bg-violet-100 text-violet-800 font-semibold px-4 py-2 rounded-lg hover:bg-violet-200 transition text-sm">' + (done ? 'Revoir' : 'Commencer') + '</button>'
                    : '<span class="shrink-0 self-center text-xs text-gray-400">Validez le module ' + (m.id - 1) + '</span>');
            list.appendChild(card);
        });

        list.querySelectorAll('[data-module]').forEach(function (btn) {
            btn.addEventListener('click', function () { openModule(Number(btn.dataset.module)); });
        });

        renderCompletion();
        updateGlobalProgress();
        show('viewDashboard');
    }

    function updateGlobalProgress() {
        var total = state.program.modules.length;
        var done = getProgress().completed.length;
        $('globalProgress').classList.remove('hidden');
        $('globalProgress').classList.add('flex');
        $('globalProgressBar').style.width = Math.round(100 * done / total) + '%';
        $('globalProgressLabel').textContent = done + '/' + total + ' modules';
    }

    // ---------- Fin de formation / attestation ----------

    function renderCompletion() {
        var total = state.program.modules.length;
        var done = getProgress().completed.length;
        var block = $('certBlock');
        if (done < total) { block.classList.add('hidden'); return; }

        block.classList.remove('hidden');
        block.innerHTML =
            '<div class="card bg-green-50 border-2 border-green-300 text-center">' +
            '<h2 class="text-2xl font-bold text-green-800">🎓 Formation terminée — félicitations !</h2>' +
            '<p class="mt-3 text-gray-700">Vous avez validé les 6 modules. Téléchargez votre attestation de suivi, puis passez à l\'étape suivante : appliquer tout cela à <em>votre</em> situation.</p>' +
            '<div class="mt-5 flex flex-col sm:flex-row justify-center gap-3">' +
            '<button id="btnCert" class="bg-white border-2 border-green-600 text-green-700 font-semibold py-3 px-6 rounded-lg hover:bg-green-100 transition">🖨️ Mon attestation de suivi</button>' +
            '<a href="https://calendly.com/mamy-ramadvisor/ram-advisor-1er-appel-offert-clone" target="_blank" rel="noopener noreferrer" class="cta-gradient text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:scale-[1.02] transition">Réserver mon appel gratuit (coaching)</a>' +
            '</div>' +
            '<p class="mt-4 text-sm text-gray-600">En tant que diplômé·e de la formation, le Coaching Financier Autonomie vous est proposé avec une <strong>remise de 45 €</strong> — mentionnez simplement votre attestation lors de l\'appel.</p>' +
            '</div>';

        $('btnCert').addEventListener('click', printAttestation);
    }

    function printAttestation() {
        var name = window.prompt('Votre prénom et nom (tel qu\'il apparaîtra sur l\'attestation) :', '');
        if (name === null) return;
        var scores = getProgress().scores;
        var totalScore = 0, totalMax = 0;
        state.program.modules.forEach(function (m) {
            totalScore += scores[m.id] || 0;
            totalMax += state.program.questionsPerQuiz;
        });
        var date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

        var att = $('attestation');
        att.classList.remove('hidden');
        att.innerHTML =
            '<div style="border:3px double #6d28d9; padding:3rem; text-align:center; background:#fff; max-width:700px; margin:2rem auto;">' +
            '<p style="font-size:0.8rem; letter-spacing:0.2em; text-transform:uppercase; color:#6d28d9;">RAM Advisor — Formation en ligne</p>' +
            '<h1 style="font-size:1.8rem; font-weight:900; margin:1rem 0;">Attestation de suivi</h1>' +
            '<p style="margin:1.5rem 0 0.5rem;">est délivrée à</p>' +
            '<p style="font-size:1.5rem; font-weight:700;">' + (name || '—') + '</p>' +
            '<p style="margin:1.5rem 0;">pour avoir suivi et validé l\'intégralité de la formation<br><strong>« Les Fondamentaux de l\'Investisseur »</strong><br>(6 modules, quiz validés : ' + totalScore + '/' + totalMax + ')</p>' +
            '<p style="margin-top:1.5rem;">Fait le ' + date + '</p>' +
            '<p style="margin-top:2rem; font-size:0.75rem; color:#6b7280;">Attestation de suivi pédagogique — ne constitue ni une certification professionnelle, ni un diplôme, ni une habilitation à exercer une activité réglementée.</p>' +
            '</div>';
        window.print();
        att.classList.add('hidden');
    }

    // ---------- Lecture d'un module ----------

    function openModule(id) {
        if (!isUnlocked(id)) return;
        var meta = state.program.modules.filter(function (m) { return m.id === id; })[0];

        show('viewModule');
        $('moduleEyebrow').textContent = 'Module ' + id + ' / ' + state.program.modules.length + ' · ' + meta.duration;
        $('moduleTitle').textContent = meta.title;
        $('moduleObjective').textContent = meta.objective;
        $('moduleContent').innerHTML = '<p class="text-gray-500">Chargement du module…</p>';
        $('quizBlock').classList.add('hidden');
        $('quizResult').classList.add('hidden');

        apiGet('resource=module&id=' + id)
            .then(function (d) {
                state.currentModule = id;
                state.quizData = d.questions;
                if (d.demo) $('demoBanner').classList.remove('hidden');
                $('moduleContent').innerHTML = d.html;
                renderQuiz(d.questions);
            })
            .catch(function (e) {
                if (e.status === 401) {
                    localStorage.removeItem(TOKEN_KEY);
                    showGate('Votre accès a expiré ou n\'est plus valide. Reconnectez-vous depuis votre lien d\'accès, ou récupérez-le par email.');
                } else {
                    $('moduleContent').innerHTML = '<p class="text-red-600">Erreur de chargement : ' + e.message + '</p>';
                }
            });
    }

    function renderQuiz(questions) {
        var wrap = $('quizQuestions');
        wrap.innerHTML = '';
        questions.forEach(function (item, qi) {
            var block = document.createElement('div');
            block.innerHTML = '<p class="font-semibold text-gray-900">' + (qi + 1) + '. ' + item.q + '</p>';
            item.options.forEach(function (opt, oi) {
                var label = document.createElement('label');
                label.className = 'quiz-option text-sm text-gray-700';
                label.innerHTML = '<input type="radio" class="mr-2" name="q' + qi + '" value="' + oi + '">' + opt;
                label.addEventListener('click', function () {
                    block.querySelectorAll('.quiz-option').forEach(function (l) { l.classList.remove('selected'); });
                    label.classList.add('selected');
                });
                block.appendChild(label);
            });
            var explain = document.createElement('p');
            explain.className = 'hidden text-sm mt-2 p-3 rounded-lg bg-gray-50 border text-gray-600';
            explain.dataset.explain = qi;
            block.appendChild(explain);
            wrap.appendChild(block);
        });
        $('quizBlock').classList.remove('hidden');
        $('btnSubmitQuiz').disabled = false;
        $('btnSubmitQuiz').textContent = 'Valider mes réponses';
    }

    function submitQuiz() {
        var answers = [];
        for (var i = 0; i < state.quizData.length; i++) {
            var sel = document.querySelector('input[name="q' + i + '"]:checked');
            if (!sel) {
                $('quizResult').classList.remove('hidden');
                $('quizResult').className = 'mt-4 text-center font-semibold text-amber-700';
                $('quizResult').textContent = 'Répondez à toutes les questions (question ' + (i + 1) + ' sans réponse).';
                return;
            }
            answers.push(Number(sel.value));
        }

        $('btnSubmitQuiz').disabled = true;
        $('btnSubmitQuiz').textContent = 'Correction…';

        fetch(API + '/formation-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + state.token },
            body: JSON.stringify({ id: state.currentModule, answers: answers })
        })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
            .then(function (res) {
                if (!res.ok) throw new Error(res.d.error || 'Erreur');
                showQuizResults(answers, res.d);
            })
            .catch(function (e) {
                $('btnSubmitQuiz').disabled = false;
                $('btnSubmitQuiz').textContent = 'Valider mes réponses';
                $('quizResult').classList.remove('hidden');
                $('quizResult').className = 'mt-4 text-center font-semibold text-red-600';
                $('quizResult').textContent = 'Erreur : ' + e.message;
            });
    }

    function showQuizResults(answers, result) {
        result.results.forEach(function (r, qi) {
            var options = document.getElementsByName('q' + qi);
            options.forEach(function (input, oi) {
                var label = input.parentElement;
                if (oi === r.answer) label.classList.add('correct');
                else if (oi === answers[qi] && !r.correct) label.classList.add('wrong');
                input.disabled = true;
            });
            var explain = document.querySelector('[data-explain="' + qi + '"]');
            explain.textContent = (r.correct ? '✅ ' : '❌ ') + r.explain;
            explain.classList.remove('hidden');
        });

        var el = $('quizResult');
        el.classList.remove('hidden');

        if (result.pass) {
            var p = getProgress();
            if (p.completed.indexOf(state.currentModule) === -1) p.completed.push(state.currentModule);
            p.scores[state.currentModule] = Math.max(p.scores[state.currentModule] || 0, result.score);
            saveProgress(p);
            updateGlobalProgress();

            var isLast = state.currentModule === state.program.modules.length;
            el.className = 'mt-4 text-center font-semibold text-green-700';
            el.innerHTML = '🎉 Quiz validé : ' + result.score + '/' + result.total + ' !<br>' +
                '<button id="btnNext" class="mt-3 cta-gradient text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:scale-[1.02] transition">' +
                (isLast ? 'Terminer la formation →' : 'Module suivant →') + '</button>';
            $('btnNext').addEventListener('click', function () {
                if (isLast) renderDashboard();
                else openModule(state.currentModule + 1);
            });
        } else {
            el.className = 'mt-4 text-center font-semibold text-amber-700';
            el.innerHTML = 'Score : ' + result.score + '/' + result.total + ' — il en faut ' + state.program.passThreshold + '. ' +
                'Relisez les explications ci-dessus puis retentez.<br>' +
                '<button id="btnRetry" class="mt-3 bg-violet-100 text-violet-800 font-semibold py-2 px-6 rounded-lg hover:bg-violet-200 transition">Retenter le quiz</button>';
            $('btnRetry').addEventListener('click', function () { renderQuiz(state.quizData); $('quizResult').classList.add('hidden'); });
        }
        $('btnSubmitQuiz').disabled = true;
        $('btnSubmitQuiz').textContent = 'Réponses envoyées';
    }

    // ---------- Démarrage ----------

    document.addEventListener('DOMContentLoaded', function () {
        $('btnSommaire').addEventListener('click', renderDashboard);
        $('btnSubmitQuiz').addEventListener('click', submitQuiz);

        resolveToken()
            .then(function (token) {
                if (!token || !tokenPayload(token)) { showGate(); return null; }
                state.token = token;
                var payload = tokenPayload(token);
                state.demo = Boolean(payload.demo);
                if (state.demo) $('demoBanner').classList.remove('hidden');
                return apiGet('resource=program').then(function (program) {
                    state.program = program;
                    renderDashboard();
                });
            })
            .catch(function (e) {
                showGate(e.message + ' — si le problème persiste, écrivez-nous à contact@ramadvisor.fr avec votre justificatif de paiement.');
            });
    });
})();
