# Jarvis : la bonne réponse à tout. Plus jamais « ok ».

Application Android de Jarvis, l'assistant congolais qui analyse une conversation
(WhatsApp, SMS, Messenger, e-mail) et propose trois réponses : **Sapeur** (élégant),
**Motema** (avec le cœur) et **Mokuse** (court).

## Ce que contient le dossier

| Dossier / fichier | Rôle |
|---|---|
| `www/` | L'interface (HTML, CSS, JavaScript), les polices et les icônes. C'est le cœur de l'app. |
| `www/config.js` | L'adresse du serveur IA. Vide = mode démo. |
| `server/worker.js` | Le petit serveur qui parle à l'IA Gemini en gardant la clé secrète. |
| `android/` | Le projet Android (Capacitor), avec les icônes et l'écran de démarrage Jarvis. |
| `.github/workflows/android.yml` | La recette qui fabrique l'APK automatiquement sur GitHub. |

## Étape 1 : tester tout de suite (2 minutes)

Ouvre `www/index.html` dans Chrome. Jarvis s'affiche en **mode démo** : le premier
exemple (« Calmer un client fâché ») montre une réponse préparée à l'avance.
Les thèmes, le mode voix et l'historique fonctionnent déjà.

## Étape 2 : brancher l'IA gratuite (15 minutes)

L'application ne doit **jamais** contenir la clé de l'IA : n'importe qui pourrait la
voler en ouvrant l'APK. On passe donc par un petit serveur gratuit.

1. Va sur **aistudio.google.com**, connecte-toi avec un compte Google et crée une clé API (« Get API key »).
2. Va sur **dash.cloudflare.com**, crée un compte gratuit, puis *Workers & Pages* → *Create* → *Create Worker*.
   Donne-lui un nom (par exemple `jarvis-ia`) et clique sur *Deploy*.
3. Clique sur *Edit code*, efface tout, colle le contenu de `server/worker.js`, puis *Deploy*.
4. Dans *Settings* → *Variables and Secrets*, ajoute un **Secret** nommé `GEMINI_API_KEY` avec ta clé.
   (Option : une variable `MODEL` si tu veux un autre modèle Gemini ; vérifie son nom exact dans AI Studio.)
5. Copie l'adresse du Worker (du type `https://jarvis-ia.ton-nom.workers.dev`) et colle-la dans `www/config.js` :

```js
window.JARVIS_CONFIG = { endpoint: "https://jarvis-ia.ton-nom.workers.dev" };
```

Recharge `www/index.html` : Jarvis répond maintenant avec la vraie IA.

> L'offre gratuite de Gemini a des quotas, et Google peut utiliser les données envoyées
> pour améliorer ses modèles. Jarvis masque les numéros de téléphone avant l'envoi,
> mais pas encore les noms. Pour un vrai lancement, passez à une offre payante.

## Étape 3 : obtenir l'APK sans rien installer (10 minutes)

1. Crée un compte sur **github.com**, puis un nouveau dépôt (*New repository*), par exemple `jarvis-app`.
2. Clique sur *uploading an existing file* et glisse **tout le contenu** de ce dossier
   (sauf `node_modules` s'il existe). Valide avec *Commit changes*.
   Le dossier caché `.github` doit bien être envoyé : sur Windows/Mac, active l'affichage
   des fichiers cachés avant de glisser les fichiers.
3. Option : pour brancher l'IA sans modifier `config.js`, va dans *Settings* → *Secrets and variables*
   → *Actions* → onglet *Variables*, et crée `JARVIS_ENDPOINT` avec l'adresse de ton Worker.
4. Ouvre l'onglet **Actions** : la recette « Construire l'APK Jarvis » se lance toute seule
   (sinon clique sur *Run workflow*). Attends 5 à 10 minutes.
5. Quand c'est vert, clique sur la recette, puis télécharge **Jarvis-APK** en bas de la page.
   Dézippe-le : tu obtiens `app-debug.apk`.
6. Envoie l'APK sur ton téléphone Android (WhatsApp à toi-même, câble, Drive…), ouvre-le
   et autorise l'installation depuis des sources inconnues.

## Option : compiler sur ton ordinateur

Il faut Node.js 20 et Android Studio.

```bash
npm install
npx cap sync android
npx cap open android
```

Android Studio s'ouvre : clique sur *Run* pour l'installer sur un téléphone branché,
ou *Build → Build APK(s)*.

## Bon à savoir

- **APK de test** : `app-debug.apk` sert aux démonstrations. Pour le Play Store, il faudra
  une version signée (*Build → Generate Signed Bundle* dans Android Studio).
- **Voix** : la lecture à voix haute dépend du téléphone. Dans l'application Android,
  elle peut ne pas fonctionner ; Jarvis affiche alors la réponse à l'écran.
- **Lingala** : faites relire les textes en lingala de l'interface par quelqu'un de l'équipe.
- **Modifier l'interface** : tout est dans `www/index.html`. Après une modification,
  relance `npx cap sync android` (ou renvoie les fichiers sur GitHub pour un nouvel APK).
