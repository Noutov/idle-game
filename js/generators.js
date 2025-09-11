/**
 * Generator System
 * Handles passive income generators (villagers, warriors, seers, elites)
 */

const Generators = {
  // Generator type configurations
  config: {
    villager: { name: 'Dorpelingen', emoji: '👨‍🌾', baseGps: 1 },
    trader: { name: 'Handelsui', emoji: '🏺', baseGps: 3 },
    warrior: { name: 'Krijgers', emoji: '🛡️', baseGps: 5 },
    seer: { name: 'Zieners', emoji: '🔮', baseGps: 20 },
    elite: { name: 'Elite Krijgers', emoji: '⚔️', baseGps: 100 }
  },

  // Initialize generator system
  init() {
    this.setupEventListeners();
    this.initializeGeneratorStates();
  },

  // Setup event listeners for buy buttons and generator sprites
  setupEventListeners() {
    const buyButtons = [
      { id: 'buyVillagerBtn', type: 'villager' },
      { id: 'buyTraderBtn', type: 'trader' },
      { id: 'buyWarriorBtn', type: 'warrior' },
      { id: 'buySeerBtn', type: 'seer' },
      { id: 'buyEliteBtn', type: 'elite' }
    ];

    const generatorSprites = [
      { id: 'villagerSprite', type: 'villager' },
      { id: 'traderSprite', type: 'trader' },
      { id: 'warriorSprite', type: 'warrior' },
      { id: 'seerSprite', type: 'seer' },
      { id: 'eliteSprite', type: 'elite' }
    ];

    // Buy button listeners
    buyButtons.forEach(({ id, type }) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', () => this.buyGenerator(type));
      }
    });

    // Generator sprite click listeners
    generatorSprites.forEach(({ id, type }) => {
      const sprite = document.getElementById(id);
      if (sprite) {
        sprite.addEventListener('click', () => this.clickGenerator(type));
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

    // Use new dynamic cost calculation with university bonuses
    let cost = GameUtils.calculateGeneratorCost(type, generator.count);
    
    // Apply university cost reduction
    if (typeof University !== 'undefined') {
      cost = Math.floor(cost * University.getCostReduction(type));
    }
    
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
      
      // Update sprite clickability
      this.updateGeneratorSprite(type);
      
      // Update displays
      GameEvents.emit('generatorsChanged');
      GameEvents.emit('goldChanged');
      
      // Achievement check
      this.checkAchievements(type, generator.count);
      
      return true;
    }
    
    return false;
  },

  // Click a generator to manually trigger work
  clickGenerator(type) {
    const generator = GameState.generators[type];
    if (!generator) {
      console.error(`Unknown generator type: ${type}`);
      return false;
    }

    // Check if generator has any units
    if (generator.count <= 0) {
      UI.showNotification(`Je hebt geen ${this.config[type].name}!`, 'warning');
      return false;
    }

    // Check if already working
    if (generator.busy) {
      VisualEffects.showTooltip(
        document.getElementById(`${type}Sprite`),
        'Al bezig met werken...',
        2000
      );
      return false;
    }

    // Check if automated (building level)
    if (this.isAutomated(type)) {
      UI.showNotification(`${this.config[type].name} werken automatisch!`, 'info');
      return false;
    }

    // Start manual work
    this.startGeneratorWork(type);
    return true;
  },

  // Check if generator is automated by building level
  isAutomated(type) {
    const generator = GameState.generators[type];
    const buildingLevel = GameState.building.level;
    return buildingLevel >= generator.autoLevel;
  },

  // Start generator work (manual or auto)
  startGeneratorWork(type) {
    const generator = GameState.generators[type];
    
    // Prevent starting work if already busy
    if (generator.busy) {
      console.warn(`Generator ${type} already busy`);
      return;
    }
    
    generator.busy = true;
    generator.progress = 0;
    generator.lastWorkTime = Date.now();

    // Update sprite visual state
    const sprite = document.getElementById(`${type}Sprite`);
    if (sprite) {
      sprite.classList.add('working', 'disabled');
      sprite.classList.remove('clickable');
    }

    // Calculate effective work time with speed multipliers
    let effectiveWorkTime = generator.workTime;
    
    // Apply building speed multiplier
    if (typeof Building !== 'undefined') {
      const speedMultiplier = Building.getSpeedMultiplier(type);
      effectiveWorkTime = Math.floor(effectiveWorkTime / speedMultiplier);
    }
    
    // Apply university speed bonus
    if (typeof University !== 'undefined') {
      const universitySpeedBonus = University.getSpeedBonus(type);
      effectiveWorkTime = Math.floor(effectiveWorkTime / universitySpeedBonus);
    }
    
    // Ensure minimum work time of 200ms
    effectiveWorkTime = Math.max(effectiveWorkTime, 200);

    // Store effective work time on generator for reference
    generator.effectiveWorkTime = effectiveWorkTime;
    generator.workStartTime = Date.now();

    // Start progress animation with effective work time
    this.animateGeneratorProgress(type);
    
    // Schedule work completion with effective work time
    generator.workTimeout = setTimeout(() => {
      this.completeGeneratorWork(type);
    }, effectiveWorkTime);
  },

  // Complete generator work and give rewards
  completeGeneratorWork(type) {
    const generator = GameState.generators[type];
    if (!generator.busy) return; // Already completed or cancelled

    // Clear the timeout to prevent multiple executions
    if (generator.workTimeout) {
      clearTimeout(generator.workTimeout);
      generator.workTimeout = null;
    }

    // Calculate gold reward using effective work time
    const timeInSeconds = (generator.effectiveWorkTime || generator.workTime) / 1000;
    let goldReward = Math.floor(generator.gps * generator.count * timeInSeconds);

    // Apply building bonuses if available
    if (typeof Building !== 'undefined') {
      goldReward = Math.floor(goldReward * Building.getGeneratorMultiplier(type));
    }

    // Apply university gold bonus
    if (typeof University !== 'undefined') {
      goldReward = Math.floor(goldReward * University.getGoldBonus(type));
    }

    // Apply prestige multiplier
    goldReward = Math.floor(goldReward * GameState.prestige.bonusMultiplier);

    // Give reward
    GameUtils.addGold(goldReward);

    // Reset progress and state
    generator.busy = false;
    generator.progress = 0;
    generator.effectiveWorkTime = null;
    generator.workStartTime = null;

    // Reset progress bar visual
    const progressBar = document.getElementById(`${type}Progress`);
    if (progressBar) {
      progressBar.style.width = '0%';
    }

    // Visual effects
    const sprite = document.getElementById(`${type}Sprite`);
    if (sprite) {
      VisualEffects.createFloatingGold(sprite, goldReward);
      VisualEffects.createParticles(sprite);
      
      // Add pulse effect if not automated
      if (!this.isAutomated(type)) {
        VisualEffects.pulseElement(sprite, '#4caf50');
      }
    }

    // Update sprite state immediately
    this.updateGeneratorSprite(type);

    // Auto-restart if automated
    if (this.isAutomated(type)) {
      setTimeout(() => {
        this.startGeneratorWork(type);
      }, 500); // Small delay between auto cycles
    }

    // Emit events
    GameEvents.emit('generatorWorked', { type, goldReward });
    GameEvents.emit('goldChanged');
  },

  // Animate generator progress bar
  animateGeneratorProgress(type) {
    const generator = GameState.generators[type];
    const progressBar = document.getElementById(`${type}Progress`);
    if (!progressBar || !generator.busy) return;

    const updateProgress = () => {
      if (!generator.busy) return;

      const elapsed = Date.now() - generator.workStartTime;
      const duration = generator.effectiveWorkTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      
      progressBar.style.width = `${progress}%`;
      generator.progress = progress;

      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
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

  // Process generator income and automation (called every second)
  processIncome() {
    let totalIncome = 0;
    
    for (const [type, generator] of Object.entries(GameState.generators)) {
      if (generator.count <= 0) continue;

      // Check if this generator should be automated
      if (this.isAutomated(type) && !generator.busy) {
        // Start automated work cycle
        this.startGeneratorWork(type);
      }

      // Old system: passive income for automated generators only
      if (this.isAutomated(type) && generator.busy) {
        // Enhanced old system provides baseline income even during work
        const enhancedGps = typeof Building !== 'undefined' ? 
          Building.getEnhancedGPS(type) : generator.gps;
        const passiveIncome = Math.floor(generator.count * enhancedGps * 0.3); // 30% passive income
        totalIncome += passiveIncome;
      }
    }
    
    if (totalIncome > 0) {
      GameUtils.addGold(totalIncome);
    }
    
    return totalIncome;
  },

  // Initialize generator UI states on game load
  initializeGeneratorStates() {
    const types = ['villager', 'trader', 'warrior', 'seer', 'elite'];
    
    types.forEach(type => {
      const generator = GameState.generators[type];
      const sprite = document.getElementById(`${type}Sprite`);
      
      if (sprite && generator) {
        // Set initial state
        sprite.classList.remove('working', 'disabled');
        
        if (generator.count > 0 && !this.isAutomated(type)) {
          sprite.classList.add('clickable');
        } else {
          sprite.classList.remove('clickable');
        }
      }
    });
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
      generator.busy = false;
      generator.progress = 0;
      generator.lastWorkTime = 0;
      generator.effectiveWorkTime = null;
      generator.workStartTime = null;
      
      // Clear any pending timeouts
      if (generator.workTimeout) {
        clearTimeout(generator.workTimeout);
        generator.workTimeout = null;
      }
    }
    
    this.stopAllAutoBuy();
    this.initializeGeneratorStates();
    GameEvents.emit('generatorsChanged');
  },

  // Update generator sprite visual state
  updateGeneratorSprite(type) {
    const generator = GameState.generators[type];
    const sprite = document.getElementById(`${type}Sprite`);
    
    if (!sprite) return;
    
    sprite.classList.remove('working', 'disabled', 'clickable');
    
    if (generator.count > 0) {
      if (generator.busy) {
        sprite.classList.add('working', 'disabled');
      } else if (!this.isAutomated(type)) {
        sprite.classList.add('clickable');
      }
    }
  },

  // Utility function to capitalize first letter
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};