// audioManager.js
function readMutedPreference() {
  try {
    return localStorage.getItem('invader:muted') === '1';
  } catch {
    return false;
  }
}

function writeMutedPreference(isMuted) {
  try {
    localStorage.setItem('invader:muted', isMuted ? '1' : '0');
  } catch {
    // Ignore storage errors in private mode/restricted contexts.
  }
}

export class AudioManager {
  constructor() {
    this.sounds = {};
    this.muted = readMutedPreference();
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

  setMuted(nextMuted) {
    this.muted = Boolean(nextMuted);
    writeMutedPreference(this.muted);
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  get isMuted() {
    return this.muted;
  }

  /**
   * Joue le son préalablement chargé sous `name`.
   * Clone l’élément pour pouvoir superposer plusieurs lectures.
   * @param {string} name
   */
  play(name) {
    if (this.muted) return;
    const original = this.sounds[name];
    if (!original) return;
    const audio = original.cloneNode();
    audio.play();
  }
}

// Export d’une instance unique
export const audio = new AudioManager();
