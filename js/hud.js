// js/hud.js
import { config } from '../config.js';
import { bindPauseButton } from './sceneOverlay.js';
import { audio } from './audioManager.js';

function bindMuteButton(btn) {
  btn.onclick = () => {
    const muted = audio.toggleMuted();
    btn.textContent = muted ? 'Unmute' : 'Mute';
  };
}

export function drawHUD(score, level, weapon, health, highScore = 0) {
  const hearts = Array.from({ length: config.maxLives }, (_, i) =>
    i < health ? '❤️' : '🤍'
  ).join(' ');

  const wc = config.weaponConfigs[weapon.type];
  const cur = weapon.level;
  const max = wc.maxLevel;
  const lvlT = cur >= max ? 'Niv. MAX' : `Niv. ${cur}/${max}`;
  const label = `🔫 ${wc.displayName} ${lvlT}`;

  document.getElementById('hud').innerHTML = `
    <div class="hud-container">
      <span>💯 Score: ${score}</span>
      <span>🏆 Record: ${highScore}</span>
      <span>🧬 Niveau: ${level}</span>
      <span style="color:${wc.color}">${label}</span>
      <span class="hearts">${hearts}</span>
    </div>
  `;

  if (!document.getElementById('pauseBtn')) {
    const btn = document.createElement('button');
    btn.id = 'pauseBtn';
    btn.textContent = 'Pause';
    document.body.appendChild(btn);
    bindPauseButton(btn);
  }

  let muteBtn = document.getElementById('muteBtn');
  if (!muteBtn) {
    muteBtn = document.createElement('button');
    muteBtn.id = 'muteBtn';
    document.body.appendChild(muteBtn);
    bindMuteButton(muteBtn);
  }
  muteBtn.textContent = audio.isMuted ? 'Unmute' : 'Mute';
}
