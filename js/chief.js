/**
 * Chief System
 * Handles chief clicking mechanics and cooldown system
 */

const Chief = {
  // Initialize chief system
  init() {
    this.setupEventListeners();
  },

  // Setup event listeners
  setupEventListeners() {
    const chiefSprite = document.getElementById('chiefSprite');
    
    if (chiefSprite) {
      chiefSprite.addEventListener('click', () => this.clickChief());
    }
  },

  // Handle chief clicking
  clickChief() {
    if (GameState.chief.busy) {
      VisualEffects.showTooltip(
        document.getElementById('chiefSprite'),
        'Dorpshoofd is nog bezig!',
        1500
      );
      return;
    }

    this.startChiefWork();
  },

  // Start chief work animation and countdown
  startChiefWork() {
    GameState.chief.busy = true;
    
    const chiefSprite = document.getElementById('chiefSprite');
    
    // Add working animation and disable click
    if (chiefSprite) {
      chiefSprite.classList.add('working', 'disabled');
      chiefSprite.classList.remove('clickable');
    }

    // Start progress animation
    this.animateProgress();
    
    GameEvents.emit('chiefChanged');
  },

  // Animate progress bar during chief work
  animateProgress() {
    let elapsed = 0;
    const duration = Math.max(GameState.chief.cooldown / 1000, 0.1); // Convert to seconds, minimum 0.1s
    const updateInterval = Math.min(100, GameState.chief.cooldown / 10); // Adjust update rate based on cooldown
    
    const progressInterval = setInterval(() => {
      elapsed += updateInterval / 1000;
      const progress = Math.min((elapsed / duration) * 100, 100);
      
      UI.updateProgressBar(progress);

      if (elapsed >= duration) {
        clearInterval(progressInterval);
        this.completeChiefWork();
      }
    }, updateInterval);
  },

  // Complete chief work and give rewards
  completeChiefWork() {
    let goldEarned = GameState.chief.gold;
    
    // Apply click streak multiplier if ChiefEnhanced is available
    if (typeof ChiefEnhanced !== 'undefined') {
      goldEarned = Math.floor(goldEarned * ChiefEnhanced.getClickStreakMultiplier());
    }
    
    // Apply prestige multiplier
    if (typeof Prestige !== 'undefined') {
      goldEarned = Math.floor(goldEarned * Prestige.getPrestigeMultiplier());
    }
    
    // Add gold to player
    GameUtils.addGold(goldEarned);
    
    // Emit chief clicked event for enhanced features
    GameEvents.emit('chiefClicked');
    
    // Visual effects
    const chiefSprite = document.getElementById('chiefSprite');
    if (chiefSprite) {
      VisualEffects.createFloatingGold(chiefSprite, goldEarned);
      VisualEffects.createParticles(chiefSprite);
      chiefSprite.classList.remove('working', 'disabled');
      chiefSprite.classList.add('clickable');
      VisualEffects.pulseElement(chiefSprite);
    }
    
    // Reset progress bar
    UI.updateProgressBar(0);
    
    // Reset busy state
    GameState.chief.busy = false;
    
    // Update UI
    GameEvents.emit('chiefChanged');
    GameEvents.emit('goldChanged');
    
    // Play success sound effect (if implemented)
    this.playChiefSound();
  },

  // Upgrade chief gold per click
  upgradeGold() {
    const cost = GameState.chief.goldCost;
    
    if (!GameUtils.canAfford(cost)) {
      UI.showNotification('Niet genoeg goud voor upgrade!', 'error');
      return false;
    }

    if (GameUtils.spendGold(cost)) {
      // Exponential scaling: +1 for first few upgrades, then +2, +3, etc.
      const upgradeLevel = GameState.chief.gold - 1; // Current upgrade level (0-based)
      const goldIncrease = Math.max(1, Math.floor(upgradeLevel / 3) + 1);
      GameState.chief.gold += goldIncrease;
      GameState.chief.goldCost = Math.floor(GameState.chief.goldCost * 1.5);
      
      // Visual feedback
      const upgradeBtn = document.getElementById('upgradeGoldBtn');
      if (upgradeBtn) {
        VisualEffects.flashElement(upgradeBtn, '#ff9800');
        VisualEffects.pulseButton('upgradeGoldBtn');
      }
      
      UI.showNotification(`Dorpshoofd upgrade! Nieuwe goud per klik: ${GameState.chief.gold}`, 'success');
      
      GameEvents.emit('chiefChanged');
      return true;
    }
    
    return false;
  },

  // Upgrade chief cooldown (reduce time)
  upgradeCooldown() {
    const cost = GameState.chief.cooldownCost;
    
    if (!GameUtils.canAfford(cost)) {
      UI.showNotification('Niet genoeg goud voor upgrade!', 'error');
      return false;
    }

    if (GameState.chief.cooldown <= 500) {
      UI.showNotification('Maximum snelheid bereikt!', 'error');
      return false;
    }

    if (GameUtils.spendGold(cost)) {
      GameState.chief.cooldown -= 500;
      GameState.chief.cooldownCost = Math.floor(GameState.chief.cooldownCost * 2);
      
      // Visual feedback
      const upgradeBtn = document.getElementById('upgradeCooldownBtn');
      if (upgradeBtn) {
        VisualEffects.flashElement(upgradeBtn, '#ff9800');
        VisualEffects.pulseButton('upgradeCooldownBtn');
      }
      
      const newCooldown = (GameState.chief.cooldown / 1000).toFixed(1);
      UI.showNotification(`Snelheidsupgrade! Nieuwe wachttijd: ${newCooldown}s`, 'success');
      
      GameEvents.emit('chiefChanged');
      return true;
    }
    
    return false;
  },

  // Get current chief stats for display
  getStats() {
    return {
      goldPerClick: GameState.chief.gold,
      cooldownSeconds: GameState.chief.cooldown / 1000,
      goldUpgradeCost: GameState.chief.goldCost,
      cooldownUpgradeCost: GameState.chief.cooldownCost,
      busy: GameState.chief.busy
    };
  },

  // Check if upgrades are available
  canUpgradeGold() {
    return GameUtils.canAfford(GameState.chief.goldCost);
  },

  canUpgradeCooldown() {
    return GameUtils.canAfford(GameState.chief.cooldownCost) && GameState.chief.cooldown > 500;
  },

  // Calculate click efficiency (gold per second when actively clicking)
  getClickEfficiency() {
    if (GameState.chief.cooldown === 0) return 0;
    return GameState.chief.gold / (GameState.chief.cooldown / 1000);
  },

  // Auto-click functionality (for later use with upgrades)
  startAutoClick(duration = 10000) {
    const autoClickInterval = setInterval(() => {
      if (!GameState.chief.busy) {
        this.clickChief();
      }
    }, GameState.chief.cooldown + 100); // Small buffer to avoid conflicts

    setTimeout(() => {
      clearInterval(autoClickInterval);
      UI.showNotification('Auto-klik gestopt!', 'info');
    }, duration);

    UI.showNotification('Auto-klik gestart!', 'success');
  },

  // Play sound effect (placeholder for future implementation)
  playChiefSound() {
    // Could implement Web Audio API sounds here
    // For now, just emit an event that could be handled elsewhere
    GameEvents.emit('soundEffect', { type: 'chiefClick', volume: 0.3 });
  },

  // Reset chief to initial state
  reset() {
    GameState.chief.gold = 1;
    GameState.chief.cooldown = 5000;
    GameState.chief.busy = false;
    GameState.chief.goldCost = 25;
    GameState.chief.cooldownCost = 75;
    
    const chiefSprite = document.getElementById('chiefSprite');
    if (chiefSprite) {
      chiefSprite.classList.remove('working', 'disabled');
      chiefSprite.classList.add('clickable');
    }
    
    UI.updateProgressBar(0);
    GameEvents.emit('chiefChanged');
  }
};