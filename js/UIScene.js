import { drawHUD } from './hud.js';

export class UIScene {
  draw(state) {
    drawHUD(state.score, state.level, state.weapon, state.lives);
  }
}
