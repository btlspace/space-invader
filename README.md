# Space Invader Personal Site Game

Un mini-jeu Space Invader à héberger sur GitHub Pages, intégré dans un site personnel (berthel.me).

---

## Table des matières

1. [Aperçu du projet](#aperçu-du-projet)  
2. [Structure du dépôt](#structure-du-dépôt)  
3. [Configuration](#configuration)  
4. [Logique de jeu](#logique-de-jeu)  
   - [Flux des scènes](#flux-des-scènes)  
   - [Vaisseau (Player)](#vaisseau-player)  
   - [Ennemis](#ennemis)  
   - [Armes & améliorations](#armes--améliorations)  
   - [Drops & rarité](#drops--rarité)  
   - [Difficulté & progression](#difficulté--progression)  
5. [Interface & HUD](#interface--hud)  
6. [Contrôles](#contrôles)  
7. [Charte graphique](#charte-graphique)  
8. [Assets & crédits](#assets--crédits)  
9. [Installation & développement](#installation--développement)  
10. [Déploiement sur GitHub Pages](#déploiement-sur-github-pages)  

---

## Aperçu du projet

- **But** : proposer un jeu Space Invader simple et ludique en guise d’easter-egg sur un site perso.  
- **Tech stack** : HTML/CSS vanilla + ES Modules, API Canvas ou Phaser 3.  
- **Mobile-friendly** : contrôles tactiles (flèches + bouton “Tirer”).  
- **Hosting** : GitHub Pages.  

---

## Structure du dépôt

```

/
├ index.html
├ style.css
├ config.js         ← configuration globale (vitesse, rareté, drop rate…)
├ README.md
├ js/
│  ├ main.js
│  ├ sceneBoot.js
│  ├ sceneTuto.js
│  ├ sceneGame.js
│  ├ sceneOver.js
│  ├ player.js
│  ├ enemies.js
│  ├ weapons.js
│  ├ drops.js
│  ├ hud.js
│  └ audioManager.js
└ assets/
├ img/
└ sounds/

````

---

## Configuration

Un fichier **`config.js`** permet de régler :

- **Vitesse initiale** du vaisseau et des ennemis  
- **Facteur de progression** exponentiel (`SPEED_FACTOR`, `COUNT_FACTOR`)  
- **Taux de drop** global (ex. 0.05)  
- **Poids** de chaque type d’arme dans les drops  
- **Niveaux max** d’amélioration  
- **Paramètres mobiles** (taille des boutons tactiles…)  

> Modifier `config.js` suffit pour ajuster la difficulté et la rareté sans toucher au code.

---

## Logique de jeu

### Flux des scènes

1. **Boot** : précharge assets, configure entrées.  
2. **Tuto** : overlay d’accueil “`invader@berthel.me:~$_`” avec clignotant, mini-tutoriel, crédits.  
3. **Game** : boucle principale (update, collisions, génération).  
4. **Game Over** : overlay “GAME OVER”, score, bouton “Rejouer”.  

### Vaisseau (Player)

- Déplacement horizontal entre `0` et `canvas.width - ship.width`.  
- 3 vies (♥ ×3).  
- Touche Espace ou bouton mobile pour tirer.

### Ennemis

- **Génération procédurale** :
  ```js
  rows = config.baseRows + Math.floor(level / 2);
  cols = config.baseCols + (level % config.baseCols);
````

* **Vitesse** :

  ```js
  enemySpeed = config.baseSpeed * Math.pow(config.speedFactor, level-1);
  ```
* **Descente de groupe** quand le bord est atteint.

### Armes & améliorations

4 types, chacun jusqu’à 5 niveaux :

1. **Classic** : laser droit (1 projectile).
2. **Spread** : éventail de lasers (niveau projectiles).
3. **Explosive** : projectile explose (rayon \~ niveau × 10 px).
4. **Piercing** : traverse jusqu’à `level` ennemis.

* Pickup d’un même type → niveau++ (max 5), puis bonus de score.
* Pickup d’un autre type → reset niveau à 1 pour le nouveau type.

### Drops & rarité

* À chaque ennemi tué :

  1. Tirage pour drop (`config.dropRate`, ex. 5 %).
  2. Si oui : sélection pondérée selon `config.dropWeights = { classic:0.6, spread:0.25, explosive:0.1, piercing:0.05 }`.
* Drops tombent et sont ramassés au contact.

### Difficulté & progression

* **Exponentielle** : vitesse et nombre d’ennemis, cadence tirs, diminution dropRate.
* **Réglables** dans `config.js`.

---

## Interface & HUD

* **HUD** coin supérieur gauche : Score, Niveau, Arme courante + niveau.
* **Vies** coin supérieur droit : cœurs ♥.
* **Footer** : lien vers GitHub (Toujours visible).

---

## Contrôles

* **Desktop** :

  * ← / → : déplacer
  * Espace : tirer
* **Mobile** :

  * Flèches tactiles à l’écran
  * Bouton “Tirer”

---

## Charte graphique

### Palette de couleurs

| Usage            | Code                  |
| ---------------- | --------------------- |
| Fond principal   | `#0A1B2A`             |
| Étoiles & texte  | `#00DBE8`             |
| HUD background   | `rgba(10,27,42,0.85)` |
| Bordures & hover | `#00AABF`             |
| Vies (cœurs)     | `red`                 |

### Typographie

* **Police** : `JetBrains Mono`, monospace.
* **Clignotant** `_` via CSS :

  ```css
  #overlay-title::after {
    content: '_';
    animation: blink 1s infinite;
  }
  @keyframes blink { 0%,50%{opacity:1;}51%,100%{opacity:0;} }
  ```

---

## Assets & crédits

* **Sprites** : `/assets/img/` (vaisseau, saucers, drops).
* **Sons** : `/assets/sounds/` (shoot.wav, explosion.wav, hit.wav).
* **Crédits** : classicgaming.cc (sprites & effets sonores).

---

## Installation & développement

1. `git clone https://github.com/TONPROFIL/mon-space-invader.git`
2. `cd mon-space-invader`
3. `npx http-server .` ou Live Server VS Code
4. Modifier `config.js` et les modules sous `js/`

---

## Déploiement sur GitHub Pages

1. Pousser sur `main`.
2. GitHub → Settings → Pages → Source : `main` / root.
3. Attendre la publication sur
   `https://TONPROFIL.github.io/mon-space-invader/`.

---

