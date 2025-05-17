// js/hud.js
import { config } from '../config.js';
import { bindPauseButton } from './sceneOverlay.js';

export function drawHUD(score, level, weapon, health) {
  // cœurs
  const hearts = Array.from({ length: config.maxLives }, (_, i) =>
    i < health ? '❤️' : '🤍'
  ).join(' ');

  // libellé arme avec X/MAX ou MAX
  const wc   = config.weaponConfigs[weapon.type];
  const cur  = weapon.level;
  const max  = wc.maxLevel;
  const lvlT = cur >= max ? 'Niv. MAX' : `Niv. ${cur}/${max}`;
  const label= `🔫 ${wc.displayName} ${lvlT}`;

  document.getElementById('hud').innerHTML = `
    <div class="hud-container">
      <span>💯 Score: ${score}</span>
      <span>🧬 Niveau: ${level}</span>
      <span style="color:${wc.color}">${label}</span>
      <span class="hearts">${hearts}</span>
    </div>
  `;

  // Pause btn
  if (!document.getElementById('pauseBtn')) {
    const btn = document.createElement('button');
    btn.id = 'pauseBtn'; btn.textContent = 'Pause';
    document.body.appendChild(btn);
    bindPauseButton(btn);
  }
}
