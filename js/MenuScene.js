import { showMenu, hideOverlay } from './sceneOverlay.js';

export class MenuScene {
  showStart() {
    showMenu('start');
  }

  showResume() {
    showMenu('resume');
  }

  hide() {
    hideOverlay();
  }
}
