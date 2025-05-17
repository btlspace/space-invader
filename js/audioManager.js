// audioManager.js
export class AudioManager {
  constructor() {
    this.sounds = {};
  }

  /**
   * Charge un son et le stocke sous la clé `name`.
   * @param {string} name
   * @param {string} src
   * @returns {Promise<void>}
   */
  load(name, src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      audio.addEventListener('canplaythrough', () => {
        this.sounds[name] = audio;
        resolve();
      });
      audio.addEventListener('error', reject);
    });
  }

  /**
   * Joue le son préalablement chargé sous `name`.
   * Clone l’élément pour pouvoir superposer plusieurs lectures.
   * @param {string} name
   */
  play(name) {
    const original = this.sounds[name];
    if (!original) return;
    const audio = original.cloneNode();
    audio.play();
  }
}

// Export d’une instance unique
export const audio = new AudioManager();
