/**
 * Game State Management
 * Centralized state management for the Gallisch Dorp game
 */

// Main game state object
const GameState = {
  // Gold currency
  gold: 0,

  // Chief stats
  chief: {
    gold: 1,
    cooldown: 5000,
    busy: false,
    goldCost: 25,
    cooldownCost: 75
  },

  // Generators
  generators: {
    villager: { count: 0, cost: 5, gps: 1 },
    warrior: { count: 0, cost: 100, gps: 5 },
    seer: { count: 0, cost: 500, gps: 20 },
    elite: { count: 0, cost: 2000, gps: 100 }
  },

  // Camps for attacking
  camps: {
    camp1: { difficulty: 5, reward: 100, cooldown: 10, timer: 0 },
    camp2: { difficulty: 20, reward: 400, cooldown: 20, timer: 0 },
    camp3: { difficulty: 50, reward: 1500, cooldown: 30, timer: 0 }
  },

  // Central building system
  building: {
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
  },

  // Building levels configuration
  buildingLevels: [
    { name: "Geen gebouw", icon: "🏚️", description: "Het dorp heeft nog geen centraal gebouw" },
    { name: "Houten schuur", icon: "🏠", description: "Een eenvoudige schuur voor opslag", cost: 500 },
    { name: "Stenen herberg", icon: "🏪", description: "Een stevig gebouw waar dorpelingen samenkomen", cost: 2000 },
    { name: "Raadhuis", icon: "🏛️", description: "Het bestuurlijke centrum van het dorp", cost: 8000 },
    { name: "Burcht", icon: "🏰", description: "Een machtige vesting die het dorp beschermt", cost: 30000 },
    { name: "Citadel", icon: "🏯", description: "De ultieme versterking van het dorp", cost: 100000 }
  ],

  // Game settings
  settings: {
    autoSave: true,
    saveInterval: 30000, // 30 seconds
    tickInterval: 1000 // 1 second
  }
};

// Event system for cross-module communication
const GameEvents = {
  listeners: {},

  // Add event listener
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },

  // Remove event listener
  off(event, callback) {
    if (!this.listeners[event]) return;
    const index = this.listeners[event].indexOf(callback);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
    }
  },

  // Emit event
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
};

// Utility functions for game state
const GameUtils = {
  // Format numbers for display
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
  },

  // Calculate total gold per second
  calculateGPS() {
    let gps = 0;
    for (const [type, gen] of Object.entries(GameState.generators)) {
      // Use enhanced GPS if building system is available
      const enhancedGps = typeof Building !== 'undefined' ? 
        Building.getEnhancedGPS(type) : gen.gps;
      gps += gen.count * enhancedGps;
    }
    return gps;
  },

  // Check if player can afford something
  canAfford(cost) {
    return GameState.gold >= cost;
  },

  // Spend gold (with validation)
  spendGold(amount) {
    if (this.canAfford(amount)) {
      GameState.gold -= amount;
      GameEvents.emit('goldChanged', GameState.gold);
      return true;
    }
    return false;
  },

  // Add gold
  addGold(amount) {
    GameState.gold += amount;
    GameEvents.emit('goldChanged', GameState.gold);
    GameEvents.emit('goldEarned', amount);
  },

  // Save game state to localStorage
  saveGame() {
    try {
      const saveData = {
        gold: GameState.gold,
        chief: GameState.chief,
        generators: GameState.generators,
        camps: GameState.camps,
        building: GameState.building,
        timestamp: Date.now()
      };
      localStorage.setItem('gallischDorpSave', JSON.stringify(saveData));
      GameEvents.emit('gameSaved');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  },

  // Load game state from localStorage
  loadGame() {
    try {
      const saveData = localStorage.getItem('gallischDorpSave');
      if (!saveData) return false;

      const data = JSON.parse(saveData);
      
      // Merge saved data with current state
      GameState.gold = data.gold || 0;
      Object.assign(GameState.chief, data.chief || {});
      Object.assign(GameState.generators, data.generators || {});
      Object.assign(GameState.camps, data.camps || {});
      Object.assign(GameState.building, data.building || {});

      // Handle offline progress if enabled
      if (data.timestamp) {
        const offlineTime = Math.floor((Date.now() - data.timestamp) / 1000);
        if (offlineTime > 60) { // Only if offline for more than 1 minute
          const offlineGold = this.calculateGPS() * Math.min(offlineTime, 3600 * 8); // Max 8 hours
          if (offlineGold > 0) {
            this.addGold(offlineGold);
            GameEvents.emit('offlineProgress', { time: offlineTime, gold: offlineGold });
          }
        }
      }

      GameEvents.emit('gameLoaded');
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  },

  // Reset game state
  resetGame() {
    GameState.gold = 0;
    GameState.chief = {
      gold: 1,
      cooldown: 5000,
      busy: false,
      goldCost: 25,
      cooldownCost: 75
    };
    
    for (const key in GameState.generators) {
      GameState.generators[key].count = 0;
      GameState.generators[key].cost = this.getDefaultGeneratorCost(key);
    }

    for (const key in GameState.camps) {
      GameState.camps[key].timer = 0;
    }

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

    localStorage.removeItem('gallischDorpSave');
    GameEvents.emit('gameReset');
  },

  // Get default generator costs
  getDefaultGeneratorCost(type) {
    const defaults = {
      villager: 5,
      warrior: 100,
      seer: 500,
      elite: 2000
    };
    return defaults[type] || 0;
  }
};