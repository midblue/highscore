# High Score API

> Created for use in [my team's Ludum Dare 46 project](https://ldjam.com/events/ludum-dare/46/final-flower-petals-of-a-lost-age), this is a dead-simple API for globally displaying and adding high scores in your game.

Made to be run as a Heroku instance, this app uses Firebase (Firestore) and a simple express server to expose a few simple endpoints to be queried from anywhere!

## Endpoints

- Add a score: `[heroku URL]/[game]/add/[username]/[score]/`
- List scores: `[heroku URL]/[game]/[topOrBottom]/[count]/`

## Setup

1. Rename the file called `.env_example` in the project root to `.env`.
1. Set up a new [Firebase](https://firebase.google.com/) project, initialize the Firestore DB from the console, and download your credentials JSON file from Settings / Service Accounts / Create Service Account.
1. From that file, copy the appropriate values into your `.env`. For `FIREBASE_PRIVATE_KEY`,  yes, you really need all the silly `---BEGIN PRIVATE KEY---\n` type stuff.
1. You're ready to install!
```bash
npm install
npm run dev
```

From there, you can query your local server and confirm that everything is running as intended.  
Getting it running on Heroku is easy and free, check [this link](https://devcenter.heroku.com/articles/deploying-nodejs) for guidance.

Have fun!
