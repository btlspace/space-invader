// js/config.js

export const config = {
  // ——— Mouvement ———
  shipSpeed:      300,
  baseEnemySpeed: 50,
  speedFactor:    1.05,
  countFactor:    1.1,

  // ——— Vies ———
  maxLives:       3,

  // ——— Grille ennemis ———
  baseRows: 3,
  baseCols: 5,

  // ——— UI mobile ———
  mobile: {
    buttonSize: 64,
    spacing:    16
  },

  // ——— Déplacement global ennemis ———
  baseMoveDelay:     0.6,
  minMoveDelay:      0.1,
  decrementPerKill:  0.02,
  delayStepPerLevel: 0.05,

  // ——— Tirs ennemis ———
  enemyFireRate:    1.5,
  enemyBulletSpeed: 200,

  // ——— Taux de drop global ———
  dropRate:         0.05,

  // ——— Réglages globaux armes ———
  weaponSettings: {
    baseFireRate:           0.5,
    fireRateDecreaseFactor: 0.95,
    explosiveFireRate:      1.5,
    projectileSpeed:        300
  },

  // ——— Config par arme ———
  weaponConfigs: {
    classic: {
      displayName: 'Classique',
      mode:        'projectile',
      color:       '#ffffff',
      maxLevel:    5,
      fireRateKey: 'baseFireRate',
      dropWeight:  0.6,
      params: {
        baseCount:     1,
        levelInterval: 3,
        spacing:       10,
        spreadAngle:   0,
        radiusUnits:   0,
        maxPierce:     0
      }
    },
    spread: {
      displayName: 'Dispersé',
      mode:        'spread',
      color:       '#00ff00',
      maxLevel:    5,
      fireRateKey: 'baseFireRate',
      dropWeight:  0.25,
      params: {
        baseCount:     1,
        levelInterval: 2,
        spacing:       0,
        spreadAngle:   Math.PI/6,
        radiusUnits:   0,
        maxPierce:     0
      }
    },
    explosive: {
      displayName: 'Explosif',
      mode:        'explosive',
      color:       '#ff8800',
      maxLevel:    1,
      fireRateKey: 'explosiveFireRate',
      dropWeight:  0.1,
      params: {
        baseCount:     0,
        levelInterval: 0,
        spacing:       0,
        spreadAngle:   0,
        radiusUnits:   1,
        maxPierce:     0
      }
    },
    piercing: {
      displayName: 'Perçant',
      mode:        'piercing',
      color:       '#0088ff',
      maxLevel:    5,
      fireRateKey: 'baseFireRate',
      dropWeight:  0.05,
      params: {
        baseCount:     0,
        levelInterval: 0,
        spacing:       0,
        spreadAngle:   0,
        radiusUnits:   0,
        maxPierce:     2
      }
    }
  }
};
