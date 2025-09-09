/**
 * Central Building System
 * Manages the central building upgrades and generator enhancements
 */

const Building = {
  // Initialize building system
  init() {
    this.setupEventListeners();
    this.startLuckTimer();
  },

  // Setup event listeners
  setupEventListeners() {
    const upgradeBuildingBtn = document.getElementById('upgradeBuildingBtn');
    if (upgradeBuildingBtn) {
      upgradeBuildingBtn.addEventListener('click', () => this.upgradeBuilding());
    }

    // Generator upgrade listeners
    ['villager', 'warrior', 'seer', 'elite'].forEach(type => {
      const speedBtn = document.getElementById(`${type}SpeedBtn`);
      const goldBtn = document.getElementById(`${type}GoldBonusBtn`);
      const luckBtn = document.getElementById(`${type}LuckBonusBtn`);

      if (speedBtn) speedBtn.addEventListener('click', () => this.upgradeGenerator(type, 'speed'));
      if (goldBtn) goldBtn.addEventListener('click', () => this.upgradeGenerator(type, 'goldBonus'));
      if (luckBtn) luckBtn.addEventListener('click', () => this.upgradeGenerator(type, 'luckBonus'));
    });
  },

  // Upgrade the central building
  upgradeBuilding() {
    const currentLevel = GameState.building.level;
    const maxLevel = GameState.buildingLevels.length - 1;

    if (currentLevel >= maxLevel) {
      UI.showNotification('Gebouw is al maximaal geupgraded!', 'error');
      return false;
    }

    const nextLevel = currentLevel + 1;
    const cost = GameState.buildingLevels[nextLevel].cost;

    if (!GameUtils.canAfford(cost)) {
      UI.showNotification('Niet genoeg goud voor gebouw upgrade!', 'error');
      return false;
    }

    if (GameUtils.spendGold(cost)) {
      GameState.building.level = nextLevel;
      GameState.building.upgradeCost = nextLevel < maxLevel ? 
        GameState.buildingLevels[nextLevel + 1].cost : 0;

      // Visual feedback
      const buildingSprite = document.getElementById('buildingSprite');
      if (buildingSprite) {
        VisualEffects.createParticles(buildingSprite);
        VisualEffects.flashElement(buildingSprite, '#4caf50');
      }

      const buildingInfo = GameState.buildingLevels[nextLevel];
      UI.showNotification(`${buildingInfo.name} gebouwd! ${buildingInfo.description}`, 'success');

      GameEvents.emit('buildingChanged');
      return true;
    }

    return false;
  },

  // Upgrade generator enhancement
  upgradeGenerator(generatorType, upgradeType) {
    const buildingLevel = GameState.building.level;
    
    if (buildingLevel === 0) {
      UI.showNotification('Bouw eerst een centraal gebouw!', 'error');
      return false;
    }

    const currentLevel = GameState.building.upgrades[generatorType][upgradeType];
    const maxLevel = this.getMaxUpgradeLevel(buildingLevel);

    if (currentLevel >= maxLevel) {
      UI.showNotification('Maximum upgrade niveau bereikt voor dit gebouw!', 'error');
      return false;
    }

    const cost = this.getUpgradeCost(generatorType, upgradeType, currentLevel);

    if (!GameUtils.canAfford(cost)) {
      UI.showNotification('Niet genoeg goud voor deze upgrade!', 'error');
      return false;
    }

    if (GameUtils.spendGold(cost)) {
      GameState.building.upgrades[generatorType][upgradeType]++;
      
      // Visual feedback
      const upgradeBtn = document.getElementById(`${generatorType}${this.capitalizeFirst(upgradeType)}Btn`);
      if (upgradeBtn) {
        VisualEffects.flashElement(upgradeBtn, '#ff9800');
        VisualEffects.pulseButton(`${generatorType}${this.capitalizeFirst(upgradeType)}Btn`);
      }

      const upgradeNames = {
        speed: 'Snelheid',
        goldBonus: 'Goud bonus',
        luckBonus: 'Geluk bonus'
      };

      UI.showNotification(
        `${this.capitalizeFirst(generatorType)} ${upgradeNames[upgradeType]} upgrade! Niveau ${currentLevel + 1}`,
        'success'
      );

      GameEvents.emit('buildingChanged');
      GameEvents.emit('generatorsChanged');
      return true;
    }

    return false;
  },

  // Get maximum upgrade level based on building level
  getMaxUpgradeLevel(buildingLevel) {
    return buildingLevel * 2; // Each building level allows 2 more upgrade levels
  },

  // Calculate upgrade cost
  getUpgradeCost(generatorType, upgradeType, currentLevel) {
    const baseCosts = {
      villager: { speed: 100, goldBonus: 150, luckBonus: 200 },
      warrior: { speed: 300, goldBonus: 450, luckBonus: 600 },
      seer: { speed: 800, goldBonus: 1200, luckBonus: 1600 },
      elite: { speed: 2000, goldBonus: 3000, luckBonus: 4000 }
    };

    const baseCost = baseCosts[generatorType][upgradeType];
    return Math.floor(baseCost * Math.pow(1.8, currentLevel));
  },

  // Get generator speed multiplier
  getSpeedMultiplier(generatorType) {
    const speedLevel = GameState.building.upgrades[generatorType].speed;
    return 1 + (speedLevel * 0.2); // +20% speed per level
  },

  // Get generator gold bonus
  getGoldBonus(generatorType) {
    const goldLevel = GameState.building.upgrades[generatorType].goldBonus;
    return goldLevel * 0.5; // +50% of base GPS per level
  },

  // Get generator luck bonus
  getLuckBonus(generatorType) {
    const luckLevel = GameState.building.upgrades[generatorType].luckBonus;
    return luckLevel * 0.1; // +10% chance per level for bonus gold
  },

  // Start luck timer for random bonuses
  startLuckTimer() {
    setInterval(() => {
      this.processLuckBonuses();
    }, 1000); // Check every second
  },

  // Process luck-based bonuses
  processLuckBonuses() {
    if (GameState.building.luckTimer > 0) {
      GameState.building.luckTimer--;
      return;
    }

    // Check each generator type for luck bonus
    for (const [type, generator] of Object.entries(GameState.generators)) {
      if (generator.count === 0) continue;

      const luckBonus = this.getLuckBonus(type);
      if (luckBonus === 0) continue;

      // Roll for luck bonus (per generator)
      for (let i = 0; i < generator.count; i++) {
        if (Math.random() < luckBonus / 100) {
          const bonusGold = Math.floor(generator.gps * 2); // 2x normal GPS as bonus
          GameUtils.addGold(bonusGold);

          // Visual feedback
          const generatorElement = document.querySelector(`.${type}-sprite`);
          if (generatorElement) {
            VisualEffects.createFloatingGold(generatorElement, bonusGold, '#ffd700');
            VisualEffects.createParticles(generatorElement, '#ffd700');
          }

          UI.showNotification(`Geluksbonus! +${bonusGold}💰 van ${this.capitalizeFirst(type)}`, 'success');
          
          // Set cooldown to prevent spam
          GameState.building.luckTimer = Math.floor(GameState.building.luckCooldown / 1000);
          return; // Only one bonus per cycle
        }
      }
    }
  },

  // Get building info for display
  getBuildingInfo() {
    const level = GameState.building.level;
    const buildingInfo = GameState.buildingLevels[level];
    const nextLevel = level < GameState.buildingLevels.length - 1 ? level + 1 : null;
    const nextBuildingInfo = nextLevel ? GameState.buildingLevels[nextLevel] : null;

    return {
      current: buildingInfo,
      next: nextBuildingInfo,
      canUpgrade: nextBuildingInfo && GameUtils.canAfford(nextBuildingInfo.cost)
    };
  },

  // Get generator upgrade info
  getGeneratorUpgradeInfo(generatorType) {
    const upgrades = GameState.building.upgrades[generatorType];
    const maxLevel = this.getMaxUpgradeLevel(GameState.building.level);

    return {
      speed: {
        current: upgrades.speed,
        max: maxLevel,
        cost: upgrades.speed < maxLevel ? this.getUpgradeCost(generatorType, 'speed', upgrades.speed) : 0,
        effect: `+${(upgrades.speed * 20)}% snelheid`
      },
      goldBonus: {
        current: upgrades.goldBonus,
        max: maxLevel,
        cost: upgrades.goldBonus < maxLevel ? this.getUpgradeCost(generatorType, 'goldBonus', upgrades.goldBonus) : 0,
        effect: `+${(upgrades.goldBonus * 50)}% goud`
      },
      luckBonus: {
        current: upgrades.luckBonus,
        max: maxLevel,
        cost: upgrades.luckBonus < maxLevel ? this.getUpgradeCost(generatorType, 'luckBonus', upgrades.luckBonus) : 0,
        effect: `${(upgrades.luckBonus * 10)}% kans op bonus goud`
      }
    };
  },

  // Check if generator upgrades are available
  canUpgradeGenerator(generatorType, upgradeType) {
    if (GameState.building.level === 0) return false;
    
    const currentLevel = GameState.building.upgrades[generatorType][upgradeType];
    const maxLevel = this.getMaxUpgradeLevel(GameState.building.level);
    const cost = this.getUpgradeCost(generatorType, upgradeType, currentLevel);

    return currentLevel < maxLevel && GameUtils.canAfford(cost);
  },

  // Utility function to capitalize first letter
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Get enhanced GPS for a generator (including bonuses)
  getEnhancedGPS(generatorType) {
    const baseGPS = GameState.generators[generatorType].gps;
    const speedMultiplier = this.getSpeedMultiplier(generatorType);
    const goldBonus = this.getGoldBonus(generatorType);
    
    return (baseGPS * speedMultiplier) + (baseGPS * goldBonus);
  },

  // Reset building to initial state
  reset() {
    GameState.building = {
      level: 0,
      upgradeCost: 500,
      upgrades: {
        villager: { speed: 0, goldBonus: 0, luckBonus: 0 },
        warrior: { speed: 0, goldBonus: 0, luckBonus: 0 },
        seer: { speed: 0, goldBonus: 0, luckBonus: 0 },
        elite: { speed: 0, goldBonus: 0, luckBonus: 0 }
      },
      luckTimer: 0,
      luckCooldown: 30000
    };
    
    GameEvents.emit('buildingChanged');
  }
};