/**
 * Generator System
 * Handles passive income generators (villagers, warriors, seers, elites)
 */

const Generators = {
  // Generator type configurations
  config: {
    villager: { name: 'Dorpelingen', emoji: '👨‍🌾', baseGps: 1 },
    warrior: { name: 'Krijgers', emoji: '🛡️', baseGps: 5 },
    seer: { name: 'Zieners', emoji: '🔮', baseGps: 20 },
    elite: { name: 'Elite Krijgers', emoji: '⚔️', baseGps: 100 }
  },

  // Initialize generator system
  init() {
    this.setupEventListeners();
  },

  // Setup event listeners for buy buttons
  setupEventListeners() {
    const buyButtons = [
      { id: 'buyVillagerBtn', type: 'villager' },
      { id: 'buyWarriorBtn', type: 'warrior' },
      { id: 'buySeerBtn', type: 'seer' },
      { id: 'buyEliteBtn', type: 'elite' }
    ];

    buyButtons.forEach(({ id, type }) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', () => this.buyGenerator(type));
      }
    });
  },

  // Buy a generator
  buyGenerator(type) {
    const generator = GameState.generators[type];
    if (!generator) {
      console.error(`Unknown generator type: ${type}`);
      return false;
    }

    // Use new dynamic cost calculation
    const cost = GameUtils.calculateGeneratorCost(type, generator.count);
    
    if (!GameUtils.canAfford(cost)) {
      return false;
    }

    if (GameUtils.spendGold(cost)) {
      // Increase generator count
      generator.count++;
      
      // Update cost for next purchase using new dynamic system
      generator.cost = GameUtils.calculateGeneratorCost(type, generator.count);
      
      // Consume inspire stack if available
      if (typeof ChiefEnhanced !== 'undefined') {
        ChiefEnhanced.consumeInspireStack();
      }
      
      // Visual feedback
      this.showPurchaseEffect(type);
      
      // Show success notification
      const config = this.config[type];
      UI.showNotification(
        `${config.emoji} ${config.name} gekocht! (+${generator.gps}/sec)`,
        'success'
      );
      
      // Update displays
      GameEvents.emit('generatorsChanged');
      GameEvents.emit('goldChanged');
      
      // Achievement check
      this.checkAchievements(type, generator.count);
      
      return true;
    }
    
    return false;
  },

  // Show visual effect when purchasing generator
  showPurchaseEffect(type) {
    const buttonId = 'buy' + this.capitalize(type) + 'Btn';
    const button = document.getElementById(buttonId);
    
    if (button) {
      // Only use pulse effect, not flash effect to avoid transparency issues
      VisualEffects.pulseButton(buttonId, 'rgba(33, 150, 243, 0.5)');
    }
    
    // Create particles at the generator sprite
    const spriteSelector = `.${type}-sprite`;
    const sprite = document.querySelector(spriteSelector);
    if (sprite) {
      VisualEffects.createParticles(sprite, 3);
    }
  },

  // Process generator income (called every second)
  processIncome() {
    let totalIncome = 0;
    
    for (const [type, generator] of Object.entries(GameState.generators)) {
      // Get enhanced GPS including building bonuses
      const enhancedGps = typeof Building !== 'undefined' ? 
        Building.getEnhancedGPS(type) : generator.gps;
      const income = generator.count * enhancedGps;
      totalIncome += income;
    }
    
    if (totalIncome > 0) {
      GameUtils.addGold(totalIncome);
      return totalIncome;
    }
    
    return 0;
  },

  // Get total generators owned
  getTotalCount() {
    return Object.values(GameState.generators).reduce((total, gen) => total + gen.count, 0);
  },

  // Get generator efficiency (cost per GPS)
  getEfficiency(type) {
    const generator = GameState.generators[type];
    if (!generator || generator.gps === 0) return Infinity;
    return generator.cost / generator.gps;
  },

  // Get recommended generator to buy (most efficient)
  getRecommendedPurchase() {
    let bestType = null;
    let bestEfficiency = Infinity;
    
    for (const [type, generator] of Object.entries(GameState.generators)) {
      if (GameUtils.canAfford(generator.cost)) {
        const efficiency = this.getEfficiency(type);
        if (efficiency < bestEfficiency) {
          bestEfficiency = efficiency;
          bestType = type;
        }
      }
    }
    
    return bestType;
  },

  // Buy the most efficient available generator
  buyBest() {
    const recommended = this.getRecommendedPurchase();
    if (recommended) {
      return this.buyGenerator(recommended);
    }
    return false;
  },

  // Buy multiple generators at once
  buyMultiple(type, amount) {
    let purchased = 0;
    
    for (let i = 0; i < amount; i++) {
      if (this.buyGenerator(type)) {
        purchased++;
      } else {
        break; // Stop if can't afford more
      }
    }
    
    if (purchased > 0) {
      const config = this.config[type];
      UI.showNotification(
        `${purchased} ${config.name} gekocht!`,
        'success'
      );
    }
    
    return purchased;
  },

  // Calculate time until next generator can be bought
  getTimeUntilAffordable(type) {
    const generator = GameState.generators[type];
    if (!generator) return Infinity;
    
    const cost = generator.cost;
    const currentGold = GameState.gold;
    
    if (currentGold >= cost) return 0;
    
    const needed = cost - currentGold;
    const gps = GameUtils.calculateGPS();
    
    if (gps <= 0) return Infinity;
    
    return Math.ceil(needed / gps);
  },

  // Get generator statistics
  getStats() {
    const stats = {};
    
    for (const [type, generator] of Object.entries(GameState.generators)) {
      const config = this.config[type];
      stats[type] = {
        name: config.name,
        count: generator.count,
        cost: generator.cost,
        gps: generator.gps,
        totalGps: generator.count * generator.gps,
        efficiency: this.getEfficiency(type),
        timeUntilAffordable: this.getTimeUntilAffordable(type),
        canAfford: GameUtils.canAfford(generator.cost)
      };
    }
    
    return stats;
  },

  // Check for achievements related to generators
  checkAchievements(type, count) {
    const milestones = [1, 10, 25, 50, 100, 250, 500, 1000];
    
    if (milestones.includes(count)) {
      const config = this.config[type];
      UI.showNotification(
        `🏆 Mijlpaal bereikt: ${count} ${config.name}!`,
        'success',
        5000
      );
      
      // Special effects for major milestones
      if (count >= 100) {
        VisualEffects.celebrate();
      }
    }
    
    // Check total generators milestone
    const total = this.getTotalCount();
    const totalMilestones = [10, 50, 100, 500, 1000];
    
    if (totalMilestones.includes(total)) {
      UI.showNotification(
        `🎉 Totaal ${total} generators!`,
        'success',
        5000
      );
    }
  },

  // Auto-buy feature (for later use)
  startAutoBuy(type, enabled = true) {
    if (enabled) {
      const interval = setInterval(() => {
        if (GameUtils.canAfford(GameState.generators[type].cost)) {
          this.buyGenerator(type);
        }
      }, 1000);
      
      // Store interval for cleanup
      if (!this.autoBuyIntervals) {
        this.autoBuyIntervals = {};
      }
      this.autoBuyIntervals[type] = interval;
      
      UI.showNotification(`Auto-koop ${this.config[type].name} ingeschakeld!`, 'info');
    } else {
      this.stopAutoBuy(type);
    }
  },

  // Stop auto-buy for a specific type
  stopAutoBuy(type) {
    if (this.autoBuyIntervals && this.autoBuyIntervals[type]) {
      clearInterval(this.autoBuyIntervals[type]);
      delete this.autoBuyIntervals[type];
      UI.showNotification(`Auto-koop ${this.config[type].name} uitgeschakeld!`, 'info');
    }
  },

  // Stop all auto-buy
  stopAllAutoBuy() {
    if (this.autoBuyIntervals) {
      for (const type in this.autoBuyIntervals) {
        this.stopAutoBuy(type);
      }
    }
  },

  // Reset all generators
  reset() {
    for (const [type, generator] of Object.entries(GameState.generators)) {
      generator.count = 0;
      generator.cost = GameUtils.getDefaultGeneratorCost(type);
    }
    
    this.stopAllAutoBuy();
    GameEvents.emit('generatorsChanged');
  },

  // Utility function to capitalize first letter
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};