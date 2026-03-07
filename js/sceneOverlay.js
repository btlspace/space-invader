// js/sceneOverlay.js

import { SceneGame } from './sceneGame.js';

const overlay = document.getElementById('overlay');
let lastContext = 'start';

const TITLE = 'invader@berthel.me:~$';
const TUTORIAL_SUB = 'Appuyez sur <kbd>ESPACE</kbd> pour commencer';
const RESUME_SUB = 'Appuyez sur <kbd>ECHAP</kbd> pour reprendre';

export function showMenu(context = 'start') {
  lastContext = context;
  if (window.sceneGame && window.sceneGame.mode === 'playing') {
    window.sceneGame.paused = true;
  }

  const subText = context === 'resume' ? RESUME_SUB : TUTORIAL_SUB;
  const buttons = [];

  if (context === 'resume') {
    buttons.push('<button data-mode="resume">REPRENDRE</button>');
  }

  buttons.push('<button data-mode="tutorial">TUTORIEL</button>');
  buttons.push('<button data-mode="credits">CRÉDITS</button>');

  if (context === 'resume') {
    buttons.push('<button data-mode="reset">RESET</button>');
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

export function hideOverlay() {
  overlay.classList.remove('show');
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 300);

  if (window.sceneGame && lastContext === 'resume' && window.sceneGame.mode === 'playing') {
    window.sceneGame.paused = false;
  }
}

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

function bindMenuButtons() {
  overlay.querySelectorAll('.menu-buttons button').forEach((btn) => {
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
        if (window.sceneGame) {
          window.sceneGame.restart();
          window.sceneGame.paused = false;
        }
        hideOverlay();
      }
    };
  });
}

function startTypewriter(subText) {
  const h1 = overlay.querySelector('h1');
  const sub = overlay.querySelector('.subtitle');

  h1.textContent = '';
  let i = 0;
  (function typeTitle() {
    if (i < TITLE.length) {
      h1.textContent += TITLE[i++];
      setTimeout(typeTitle, 50);
    }
  })();

  if (sub && subText) {
    sub.innerHTML = '';

    // Keep rich formatting (for example <kbd>) instead of stripping tags.
    if (/<[^>]+>/.test(subText)) {
      sub.innerHTML = subText;
      return;
    }

    let j = 0;
    (function typeSub() {
      if (j < subText.length) {
        sub.textContent += subText[j++];
        setTimeout(typeSub, 40);
      } else {
        sub.innerHTML += '<span class="underscore"></span>';
      }
    })();
  }
}

function fadeIn() {
  overlay.style.display = 'flex';
  overlay.classList.add('show');
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    if (window.sceneGame && window.sceneGame.mode === 'playing') {
      if (overlay.style.display === 'flex') hideOverlay();
      else showMenu('resume');
    }
    e.preventDefault();
    return;
  }

  if (e.code === 'Space' && overlay.style.display === 'flex' && lastContext === 'start') {
    hideOverlay();
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    if (!window.sceneGame) {
      window.sceneGame = new SceneGame(canvas, ctx);
      window.sceneGame.start();
    }

    e.preventDefault();
  }
});

export function bindPauseButton(btn) {
  btn.onclick = () => {
    if (window.sceneGame && window.sceneGame.mode === 'playing') {
      if (overlay.style.display === 'flex') hideOverlay();
      else showMenu('resume');
    }
  };
}
