/**
 * Notification Utilities
 * Centralized notification messages and helper functions
 */

const NotificationMessages = {
  // Purchase messages
  GENERATOR_PURCHASED: (generator, gps) => 
    `${generator.emoji} ${generator.name} gekocht! (+${gps}/sec)`,
  
  BUILDING_BUILT: (building) => 
    `${building.name} gebouwd! ${building.description}`,
  
  UPGRADE_PURCHASED: (name, effect) => 
    `⚒️ ${name} upgrade! ${effect}`,
  
  RESEARCH_COMPLETED: (research) => 
    `🎓 ${research.name} onderzoek voltooid! ${research.effect}`,

  // Combat messages
  COMBAT_VICTORY: (reward) => 
    `🏆 Overwinning! +${GameUtils.formatNumber(reward)}💰`,
  
  COMBAT_DEFEAT: (lost) => 
    `💀 Nederlaag! ${lost} krijgers verloren`,
  
  CAMP_ATTACKED: (campName, warriors) => 
    `⚔️ ${warriors} krijgers vallen ${campName} aan!`,

  // Adventure messages
  ADVENTURE_STARTED: () => '🚀 Avontuur gestart!',
  ADVENTURE_STOPPED: () => '🛑 Avontuur gestopt',
  HERO_LEVEL_UP: (level) => `🌟 Held level ${level}!`,
  ENEMY_DEFEATED: (enemy, exp, gold) => 
    `${enemy.emoji} ${enemy.name} verslagen! +${exp} EXP, +${gold}💰`,

  // Skill messages
  SKILL_ACTIVATED: (skillName, effect) => 
    `✨ ${skillName} geactiveerd! ${effect}`,
  
  SKILL_COOLDOWN: (skillName, time) => 
    `⏱️ ${skillName} nog ${Math.ceil(time/1000)}s cooldown`,

  // Error messages
  NOT_ENOUGH_GOLD: () => '💰 Niet genoeg goud!',
  NOT_ENOUGH_WARRIORS: (needed) => `🛡️ Minimaal ${needed} krijgers nodig!`,
  ALREADY_IN_PROGRESS: () => '⏳ Al bezig met deze actie!',
  COOLDOWN_ACTIVE: () => '⏱️ Nog in cooldown!',
  REQUIREMENT_NOT_MET: (requirement) => `❌ Vereist: ${requirement}`,

  // Success messages
  PRESTIGE_ACTIVATED: (wisdom) => `✨ Prestige! +${wisdom} wijsheid punten`,
  GAME_SAVED: () => '💾 Spel opgeslagen',
  GAME_LOADED: () => '📁 Spel geladen',
  GAME_RESET: () => '🔄 Spel gereset',

  // Info messages
  GENERATOR_WORKING: (generator) => 
    `🔄 ${generator.name} aan het werk...`,
  
  AUTO_SAVE: () => '💾 Automatisch opgeslagen',
  OFFLINE_PROGRESS: (time, gold) => 
    `⏰ Offline voor ${time}, +${GameUtils.formatNumber(gold)}💰 verdiend!`
};

const NotificationHelpers = {
  // Show success notification
  success(message) {
    if (typeof UI !== 'undefined' && UI.showNotification) {
      UI.showNotification(message, NotificationTypes.SUCCESS);
    }
  },

  // Show error notification
  error(message) {
    if (typeof UI !== 'undefined' && UI.showNotification) {
      UI.showNotification(message, NotificationTypes.ERROR);
    }
  },

  // Show info notification
  info(message) {
    if (typeof UI !== 'undefined' && UI.showNotification) {
      UI.showNotification(message, NotificationTypes.INFO);
    }
  },

  // Show warning notification
  warning(message) {
    if (typeof UI !== 'undefined' && UI.showNotification) {
      UI.showNotification(message, NotificationTypes.WARNING);
    }
  },

  // Purchase notifications
  generatorPurchased(generatorType, count, gps) {
    const generator = GameConstants.GENERATORS[generatorType];
    if (generator) {
      this.success(NotificationMessages.GENERATOR_PURCHASED(generator, gps));
    }
  },

  buildingBuilt(buildingInfo) {
    this.success(NotificationMessages.BUILDING_BUILT(buildingInfo));
  },

  upgradeSuccess(name, effect) {
    this.success(NotificationMessages.UPGRADE_PURCHASED(name, effect));
  },

  // Combat notifications
  combatVictory(reward) {
    this.success(NotificationMessages.COMBAT_VICTORY(reward));
  },

  combatDefeat(lostWarriors) {
    this.error(NotificationMessages.COMBAT_DEFEAT(lostWarriors));
  },

  campAttacked(campName, warriorCount) {
    this.info(NotificationMessages.CAMP_ATTACKED(campName, warriorCount));
  },

  // Adventure notifications
  adventureStarted() {
    this.info(NotificationMessages.ADVENTURE_STARTED());
  },

  adventureStopped() {
    this.info(NotificationMessages.ADVENTURE_STOPPED());
  },

  heroLevelUp(newLevel) {
    this.success(NotificationMessages.HERO_LEVEL_UP(newLevel));
  },

  enemyDefeated(enemy, exp, gold) {
    this.success(NotificationMessages.ENEMY_DEFEATED(enemy, exp, gold));
  },

  // Skill notifications
  skillActivated(skillName, effect) {
    this.success(NotificationMessages.SKILL_ACTIVATED(skillName, effect));
  },

  skillOnCooldown(skillName, remainingTime) {
    this.warning(NotificationMessages.SKILL_COOLDOWN(skillName, remainingTime));
  },

  // Error notifications
  notEnoughGold() {
    this.error(NotificationMessages.NOT_ENOUGH_GOLD());
  },

  notEnoughWarriors(needed) {
    this.error(NotificationMessages.NOT_ENOUGH_WARRIORS(needed));
  },

  alreadyInProgress() {
    this.warning(NotificationMessages.ALREADY_IN_PROGRESS());
  },

  cooldownActive() {
    this.warning(NotificationMessages.COOLDOWN_ACTIVE());
  },

  requirementNotMet(requirement) {
    this.error(NotificationMessages.REQUIREMENT_NOT_MET(requirement));
  },

  // System notifications
  prestigeActivated(wisdomGained) {
    this.success(NotificationMessages.PRESTIGE_ACTIVATED(wisdomGained));
  },

  gameSaved() {
    this.info(NotificationMessages.GAME_SAVED());
  },

  gameLoaded() {
    this.info(NotificationMessages.GAME_LOADED());
  },

  gameReset() {
    this.info(NotificationMessages.GAME_RESET());
  },

  autoSave() {
    // Quiet auto-save notification (could be disabled in settings)
    // this.info(NotificationMessages.AUTO_SAVE());
  },

  offlineProgress(timeAway, goldEarned) {
    this.info(NotificationMessages.OFFLINE_PROGRESS(timeAway, goldEarned));
  }
};

// Validation helpers with notifications
const ValidationHelpers = {
  // Check if player can afford something
  canAfford(cost, showError = true) {
    if (typeof GameUtils !== 'undefined' && !GameUtils.canAfford(cost)) {
      if (showError) {
        NotificationHelpers.notEnoughGold();
      }
      return false;
    }
    return true;
  },

  // Check minimum requirement
  hasMinimum(current, required, errorMsg, showError = true) {
    if (current < required) {
      if (showError) {
        NotificationHelpers.error(errorMsg);
      }
      return false;
    }
    return true;
  },

  // Check if action is available (not on cooldown, not busy, etc.)
  isActionAvailable(condition, errorMsg, showError = true) {
    if (!condition) {
      if (showError) {
        NotificationHelpers.warning(errorMsg);
      }
      return false;
    }
    return true;
  },

  // Validate warrior count for combat
  validateWarriorCount(available, toSend, minimum) {
    if (toSend <= 0) {
      NotificationHelpers.error('🛡️ Geen krijgers geselecteerd!');
      return false;
    }
    
    if (toSend > available) {
      NotificationHelpers.error(`🛡️ Niet genoeg krijgers beschikbaar! (${available}/${toSend})`);
      return false;
    }
    
    if (toSend < minimum) {
      NotificationHelpers.notEnoughWarriors(minimum);
      return false;
    }
    
    return true;
  }
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    NotificationMessages, 
    NotificationHelpers, 
    ValidationHelpers 
  };
}