/**
 * Centralized Game Constants
 * All magic numbers, strings, and configuration values
 */

const GameConstants = {
  // Time constants (in milliseconds)
  TIME: {
    TICK_INTERVAL: 1000,
    AUTO_SAVE_INTERVAL: 30000,
    GENERATOR_WORK_TIMES: {
      villager: 2000,
      trader: 4000,
      warrior: 6000,
      seer: 10000,
      elite: 15000
    },
    HERO_REST_BASE: 20000,
    CHIEF_COOLDOWN_BASE: 5000,
    SKILL_COOLDOWNS: {
      rally: 60000,
      inspire: 90000,
      fortune: 120000
    },
    PROGRESS_BAR_MIN_ANIMATION: 500
  },

  // Cost constants
  COSTS: {
    GENERATORS: {
      villager: 5,
      trader: 25,
      warrior: 100,
      seer: 500,
      elite: 2000
    },
    CHIEF_UPGRADES: {
      GOLD_BASE: 25,
      COOLDOWN_BASE: 75
    },
    BUILDINGS: {
      WOODEN_SHED: 500,
      STONE_HOUSE: 2500,
      MANOR: 12500,
      CASTLE: 50000,
      FORTRESS: 200000
    },
    UNIVERSITY_BASE: 100000,
    PRESTIGE_REQUIREMENT: 1000000
  },

  // Multiplier constants
  MULTIPLIERS: {
    COST_SCALING: {
      EARLY: 1.15,  // First 10 purchases
      MID: 1.25,    // 10-25 purchases
      LATE: 1.4     // 25+ purchases
    },
    PRESTIGE_BASE: 0.1,
    BUILDING_BONUS: {
      WOODEN_SHED: 1.1,
      STONE_HOUSE: 1.25,
      MANOR: 1.5,
      CASTLE: 2.0,
      FORTRESS: 3.0
    },
    SKILL_EFFECTS: {
      RALLY_SPEED: 2.0,
      INSPIRE_COST: 0.75,
      FORTUNE_GPS: 2.0
    },
    LUCK_BONUS_MAX: 0.5
  },

  // Generator properties
  GENERATORS: {
    villager: {
      name: 'Dorpelingen',
      emoji: '👨‍🌾',
      baseGPS: 1,
      baseCost: 5,
      workTime: 2000
    },
    trader: {
      name: 'Handelsui',
      emoji: '🏺',
      baseGPS: 3,
      baseCost: 25,
      workTime: 4000
    },
    warrior: {
      name: 'Krijgers',
      emoji: '🛡️',
      baseGPS: 5,
      baseCost: 100,
      workTime: 6000
    },
    seer: {
      name: 'Zieners',
      emoji: '🔮',
      baseGPS: 20,
      baseCost: 500,
      workTime: 10000
    },
    elite: {
      name: 'Elite Krijgers',
      emoji: '⚔️',
      baseGPS: 100,
      baseCost: 2000,
      workTime: 15000
    }
  },

  // Combat constants
  COMBAT: {
    CAMPS: {
      camp1: {
        name: 'Klein kamp',
        emoji: '🏕️',
        minWarriors: 5,
        baseReward: 100,
        riskLevel: 'low'
      },
      camp2: {
        name: 'Middelgroot kamp',
        emoji: '🏰',
        minWarriors: 20,
        baseReward: 400,
        riskLevel: 'medium'
      },
      camp3: {
        name: 'Groot fort',
        emoji: '🏛️',
        minWarriors: 50,
        baseReward: 1500,
        riskLevel: 'high'
      }
    },
    HERO_BASE_STATS: {
      hp: 100,
      attack: 10,
      defense: 5,
      level: 1
    },
    ENEMY_SCALING: {
      HP_PER_WAVE: 10,
      ATTACK_PER_WAVE: 2,
      REWARD_PER_WAVE: 5
    }
  },

  // UI constants
  UI: {
    NOTIFICATION_DURATION: 3000,
    ANIMATION_DURATION: 300,
    FLOATING_TEXT_DURATION: 1500,
    PROGRESS_UPDATE_INTERVAL: 100
  }
};

// Enum-like constants for better type safety
const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

const GeneratorTypes = {
  VILLAGER: 'villager',
  TRADER: 'trader',
  WARRIOR: 'warrior',
  SEER: 'seer',
  ELITE: 'elite'
};

const SkillTypes = {
  RALLY: 'rally',
  INSPIRE: 'inspire',
  FORTUNE: 'fortune'
};

const BuildingTypes = {
  NONE: 'none',
  WOODEN_SHED: 'wooden_shed',
  STONE_HOUSE: 'stone_house',
  MANOR: 'manor',
  CASTLE: 'castle',
  FORTRESS: 'fortress'
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    GameConstants, 
    NotificationTypes, 
    GeneratorTypes, 
    SkillTypes, 
    BuildingTypes 
  };
}