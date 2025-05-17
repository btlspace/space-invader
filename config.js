// config.js
export const config = {
  // Mouvement
  shipSpeed: 300,
  baseEnemySpeed: 50,
  speedFactor: 1.05,
  countFactor: 1.1,

  // Drops & rarité
  dropRate: 0.05,
  dropWeights: {
    classic:   0.6,
    spread:    0.25,
    explosive: 0.1,
    piercing:  0.05
  },
  maxUpgradeLevel: 5,

  // Grille ennemis
  baseRows: 3,
  baseCols: 5,

  // Mobile
  mobile: { buttonSize: 64, spacing: 16 },

  // Déplacement global des ennemis
  baseMoveDelay: 0.6,
  minMoveDelay: 0.1,
  decrementPerKill: 0.02,
  delayStepPerLevel: 0.05,

  // Tirs ennemis
  enemyFireRate: 1.5,
  enemyBulletSpeed: 200,

  // Réglages spécifiques aux armes
  weaponSettings: {
    baseFireRate:            0.5,            // cadence de tir générale
    fireRateDecreaseFactor:  0.95,           // réduction par niveau pair
    explosiveFireRate:       1.5,            // cadence spéciale explosive
    projectileSpeed:         300,            // px/s pour tous les projectiles

    classic: {
      baseCount:     1,     // tirs au niveau 1
      levelInterval: 3,     // +1 tir tous les 3 niveaux
      spacing:       10      // écart horizontal (px)
    },
    spread: {
      baseCount:     1,           // projectiles au niveau 1
      levelInterval: 2,           // +2 projectiles tous les 2 niveaux
      spreadAngle:   Math.PI/6    // cône ±15°
    },
    explosive: {
      radiusUnits:   1,   // détruit cible + voisins immédiats
      fireRateKey:   'explosiveFireRate'
    },
    piercing: {
      maxPierce:     2    // perfore jusqu’à 2 ennemis max
    }
  },

  // Couleurs pour drops/HUD
  dropColors: {
    classic:   '#ffffff',
    spread:    '#00ff00',
    explosive: '#ff8800',
    piercing:  '#0088ff'
  },
  // Couleurs pour projectiles (peut être identique ou différent)
  projectileColors: {
    classic:   '#ffffff',
    spread:    '#00ff00',
    explosive: '#ff8800',
    piercing:  '#0088ff'
  }
};
