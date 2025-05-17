// js/sceneOverlay.js

import { SceneGame } from './sceneGame.js';

const overlay      = document.getElementById('overlay');
let lastContext    = 'start'; // 'start' or 'resume'

// Constants
const TITLE        = 'invader@berthel.me:~$';
const TUTORIAL_SUB = 'Appuyez sur <kbd>ESPACE</kbd> pour commencer';
const RESUME_SUB   = 'Appuyez sur <kbd>ECHAP</kbd> pour reprendre';

/**
 * Affiche le menu overlay.
 * @param {'start'|'resume'} context – 'start' au lancement, 'resume' en pause
 */
export function showMenu(context = 'start') {
  lastContext = context;
  // Met le jeu en pause (si déjà démarré)
  if (window.sceneGame) window.sceneGame.paused = true;

  const subText = context === 'resume' ? RESUME_SUB : TUTORIAL_SUB;
  const buttons = [];

  if (context === 'resume') {
    buttons.push(`<button data-mode="resume">REPRENDRE</button>`);
  }
  buttons.push(
    `<button data-mode="tutorial">TUTORIEL</button>`,
    `<button data-mode="credits">CRÉDITS</button>`
  );
  if (context === 'resume') {
    buttons.push(`<button data-mode="reset">RESET</button>`);
  }

  overlay.innerHTML = `
    <div class="overlay-content">
      <h1>${TITLE}<span class="typed-cursor"></span></h1>
      <p class="subtitle blinking">${subText}</p>
      <div class="menu-buttons">
        ${buttons.join('')}
      </div>
    </div>
  `;
  bindMenuButtons();
  fadeIn();
  startTypewriter(subText);
}

/** Masque l’overlay et reprend la partie si on était en 'resume' */
export function hideOverlay() {
  overlay.classList.remove('show');
  setTimeout(() => overlay.style.display = 'none', 300);
  if (window.sceneGame && lastContext === 'resume') {
    window.sceneGame.paused = false;
  }
}

/** Affiche le tutoriel, sans modifier lastContext */
function showTutorial() {
  overlay.innerHTML = `
    <div class="overlay-content">
      <h1>${TITLE}<span class="typed-cursor"></span></h1>
      <ul class="tutorial-list">
        <li><kbd>←</kbd> <kbd>→</kbd> Déplacer le vaisseau</li>
        <li><kbd>ESPACE</kbd> Tirer</li>
        <li><kbd>ECHAP</kbd> Pause</li>
        <li><kbd>TAB</kbd> Cheat menu</li>
      </ul>
      <button class="menu-back">◀ RETOUR</button>
    </div>
  `;
  overlay.querySelector('.menu-back').onclick = () => showMenu(lastContext);
  fadeIn();
  startTypewriter(lastContext === 'resume' ? RESUME_SUB : TUTORIAL_SUB);
}

/** Affiche les crédits, sans modifier lastContext */
function showCredits() {
  overlay.innerHTML = `
    <div class="overlay-content">
      <h1>${TITLE}<span class="typed-cursor"></span></h1>
      <div class="credits-list">
        <p>Sprites & sons : classicgaming.cc</p>
        <p>Fond animé : Particles.js</p>
        <p>Canvas & DOM : JavaScript natif</p>
        <p>Police : JetBrains Mono</p>
      </div>
      <button class="menu-back">◀ RETOUR</button>
    </div>
  `;
  overlay.querySelector('.menu-back').onclick = () => showMenu(lastContext);
  fadeIn();
  startTypewriter(lastContext === 'resume' ? RESUME_SUB : TUTORIAL_SUB);
}

/** Lie les boutons du menu principal / reprise */
function bindMenuButtons() {
  overlay.querySelectorAll('.menu-buttons button').forEach(btn => {
    btn.onclick = () => {
      const mode = btn.dataset.mode;
      btn.blur();
      if (mode === 'resume') {
        hideOverlay();
      } else if (mode === 'tutorial') {
        showTutorial();
      } else if (mode === 'credits') {
        showCredits();
      } else if (mode === 'reset') {
        location.reload();
      }
    };
  });
}

/** Effet machine à écrire */
function startTypewriter(subText) {
  const h1  = overlay.querySelector('h1');
  const sub = overlay.querySelector('.subtitle');
  // titre
  h1.textContent = '';
  let i = 0;
  (function typeTitle() {
    if (i < TITLE.length) {
      h1.textContent += TITLE[i++];
      setTimeout(typeTitle, 50);
    }
  })();
  // sous-titre
  if (sub && subText) {
    sub.innerHTML = '';
    const tmp = document.createElement('div');
    tmp.innerHTML = subText;
    const text = tmp.textContent || '';
    let j = 0;
    (function typeSub() {
      if (j < text.length) {
        sub.textContent += text[j++];
        setTimeout(typeSub, 40);
      } else {
        sub.innerHTML += '<span class="underscore"></span>';
      }
    })();
  }
}

/** Applique le fade-in */
function fadeIn() {
  overlay.style.display = 'flex';
  overlay.classList.add('show');
}

// Gestion globale des touches
window.addEventListener('keydown', e => {
  if (e.code === 'Escape') {
    // Toggle pause menu uniquement si le jeu a démarré
    if (window.sceneGame && !window.sceneGame.gameOver) {
      if (overlay.style.display === 'flex') hideOverlay();
      else showMenu('resume');
    }
    e.preventDefault();
    return;
  }
  if (
    e.code === 'Space' &&
    overlay.style.display === 'flex' &&
    lastContext === 'start'
  ) {
    // lancement initial
    hideOverlay();
    const canvas = document.getElementById('gameCanvas');
    const ctx    = canvas.getContext('2d');
    window.sceneGame = new SceneGame(canvas, ctx);
    window.sceneGame.start();
    e.preventDefault();
  }
});

/**
 * Lie un bouton «Pause» pour ouvrir/fermer le menu
 * (à appeler depuis HUD.js)
 * @param {HTMLButtonElement} btn
 */
export function bindPauseButton(btn) {
  btn.onclick = () => {
    if (window.sceneGame && !window.sceneGame.gameOver) {
      if (overlay.style.display === 'flex') hideOverlay();
      else showMenu('resume');
    }
  };
}
