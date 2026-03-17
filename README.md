# Budgeti 💰

Application de gestion de budget personnelle en React.

## Lancer le projet

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer en mode développement
npm run dev
```

L'application sera disponible sur http://localhost:5173

## Structure

```
budgeti/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx      ← point d'entrée
    └── App.jsx       ← toute l'application
```

## Changements vs l'Artefact Claude

- `window.storage` remplacé par `localStorage` → les données persistent entre les sessions
- Toutes les données sont sauvegardées automatiquement (transactions, dettes, projets, catégories, paies)

## Utiliser avec Claude Code

```bash
# Dans le dossier budgeti :
claude
```

Tu peux ensuite demander à Claude Code d'ajouter des fonctionnalités,
corriger des bugs, ou modifier l'interface.
