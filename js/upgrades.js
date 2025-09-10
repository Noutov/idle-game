/**
 * Upgrades System
 * Handles all upgrade functionality for chief and other systems
 */

const Upgrades = {
  // Initialize upgrades system
  init() {
    this.setupEventListeners();
  },

  // Setup event listeners for upgrade buttons
  setupEventListeners() {
    const upgradeGoldBtn = document.getElementById('upgradeGoldBtn');
    const upgradeCooldownBtn = document.getElementById('upgradeCooldownBtn');
    
    if (upgradeGoldBtn) {
      upgradeGoldBtn.addEventListener('click', () => this.upgradeChiefGold());
    }
    
    if (upgradeCooldownBtn) {
      upgradeCooldownBtn.addEventListener('click', () => this.upgradeChiefCooldown());
    }

    // Listen to game events to update UI
    GameEvents.on('buildingChanged', () => {
      if (typeof UI !== 'undefined' && UI.updateGeneratorUpgrades) {
        UI.updateGeneratorUpgrades();
      }
    });

    GameEvents.on('goldChanged', () => {
      if (typeof UI !== 'undefined' && UI.updateGeneratorUpgrades) {
        UI.updateGeneratorUpgrades();
      }
    });
  },

  // Upgrade chief gold per click
  upgradeChiefGold() {
    return Chief.upgradeGold();
  },

  // Upgrade chief cooldown (reduce time)
  upgradeChiefCooldown() {
    return Chief.upgradeCooldown();
  },

  // Get upgrade recommendations based on current state
  getRecommendations() {
    const recommendations = [];
    const currentGold = GameState.gold;
    
    // Chief gold upgrade recommendation
    const goldCost = GameState.chief.goldCost;
    const goldEfficiency = 1 / goldCost; // Gold per coin spent
    
    // Chief cooldown upgrade recommendation
    const cooldownCost = GameState.chief.cooldownCost;
    const currentClickRate = GameState.chief.gold / (GameState.chief.cooldown / 1000);
    const newClickRate = GameState.chief.gold / ((GameState.chief.cooldown - 500) / 1000);
    const cooldownEfficiency = (newClickRate - currentClickRate) / cooldownCost;
    
    // Compare with generator efficiency
    const generatorStats = Generators.getStats();
    let bestGeneratorEfficiency = 0;
    let bestGenerator = null;
    
    for (const [type, stats] of Object.entries(generatorStats)) {
      const efficiency = stats.gps / stats.cost;
      if (efficiency > bestGeneratorEfficiency && stats.canAfford) {
        bestGeneratorEfficiency = efficiency;
        bestGenerator = type;
      }
    }
    
    // Add recommendations based on efficiency
    if (Chief.canUpgradeGold()) {
      recommendations.push({
        type: 'chiefGold',
        name: 'Dorpshoofd Goud Upgrade',
        cost: goldCost,
        efficiency: goldEfficiency,
        description: `+1 goud per klik (${GameState.chief.gold} → ${GameState.chief.gold + 1})`
      });
    }
    
    if (Chief.canUpgradeCooldown()) {
      recommendations.push({
        type: 'chiefCooldown',
        name: 'Dorpshoofd Snelheid Upgrade',
        cost: cooldownCost,
        efficiency: cooldownEfficiency,
        description: `Sneller klikken (${(GameState.chief.cooldown/1000).toFixed(1)}s → ${((GameState.chief.cooldown-500)/1000).toFixed(1)}s)`
      });
    }
    
    if (bestGenerator) {
      const stats = generatorStats[bestGenerator];
      recommendations.push({
        type: 'generator',
        subtype: bestGenerator,
        name: `Koop ${Generators.config[bestGenerator].name}`,
        cost: stats.cost,
        efficiency: bestGeneratorEfficiency,
        description: `+${stats.gps}/sec passief inkomen`
      });
    }
    
    // Sort by efficiency (highest first)
    recommendations.sort((a, b) => b.efficiency - a.efficiency);
    
    return recommendations.slice(0, 3); // Return top 3 recommendations
  },

  // Auto-upgrade feature
  autoUpgrade(budget = GameState.gold * 0.8) {
    let spent = 0;
    let upgrades = 0;
    
    while (spent < budget) {
      const recommendations = this.getRecommendations();
      if (recommendations.length === 0) break;
      
      const best = recommendations[0];
      if (best.cost > (budget - spent)) break;
      
      let success = false;
      
      switch (best.type) {
        case 'chiefGold':
          success = this.upgradeChiefGold();
          break;
        case 'chiefCooldown':
          success = this.upgradeChiefCooldown();
          break;
        case 'generator':
          success = Generators.buyGenerator(best.subtype);
          break;
      }
      
      if (success) {
        spent += best.cost;
        upgrades++;
      } else {
        break;
      }
    }
    
    if (upgrades > 0) {
      UI.showNotification(
        `Auto-upgrade: ${upgrades} upgrades gekocht voor ${GameUtils.formatNumber(spent)}💰`,
        'success'
      );
    }
    
    return { upgrades, spent };
  },

  // Show upgrade recommendations in UI
  showRecommendations() {
    const recommendations = this.getRecommendations();
    
    if (recommendations.length === 0) {
      UI.showNotification('Geen upgrades beschikbaar op dit moment!', 'info');
      return;
    }
    
    let message = '💡 Aanbevolen upgrades:\n';
    recommendations.forEach((rec, index) => {
      message += `${index + 1}. ${rec.name} (${GameUtils.formatNumber(rec.cost)}💰)\n`;
    });
    
    // Create recommendation modal
    this.createRecommendationModal(recommendations);
  },

  // Create recommendation modal
  createRecommendationModal(recommendations) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(145deg, #8b4513, #a0522d);
      border: 4px solid #654321;
      border-radius: 15px;
      padding: 30px;
      color: white;
      font-family: 'Courier New', monospace;
      z-index: 10000;
      max-width: 500px;
      box-shadow: 0 0 50px rgba(0,0,0,0.8);
    `;
    
    let content = '<h2>💡 Upgrade Aanbevelingen</h2>';
    
    recommendations.forEach((rec, index) => {
      content += `
        <div style="margin: 15px 0; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
          <strong>${index + 1}. ${rec.name}</strong><br>
          <small>💰 ${GameUtils.formatNumber(rec.cost)} | ${rec.description}</small>
        </div>
      `;
    });
    
    content += `
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="Upgrades.executeRecommendation(0); this.parentElement.parentElement.remove();" style="margin: 5px;">
          Koop Beste
        </button>
        <button onclick="Upgrades.autoUpgrade(); this.parentElement.parentElement.remove();" style="margin: 5px;">
          Auto-Upgrade
        </button>
        <button onclick="this.parentElement.parentElement.remove();" style="margin: 5px;">
          Sluiten
        </button>
      </div>
    `;
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    // Auto-remove after 15 seconds
    setTimeout(() => {
      if (modal.parentElement) {
        modal.remove();
      }
    }, 15000);
  },

  // Execute a specific recommendation
  executeRecommendation(index) {
    const recommendations = this.getRecommendations();
    if (index >= recommendations.length) return false;
    
    const rec = recommendations[index];
    let success = false;
    
    switch (rec.type) {
      case 'chiefGold':
        success = this.upgradeChiefGold();
        break;
      case 'chiefCooldown':
        success = this.upgradeChiefCooldown();
        break;
      case 'generator':
        success = Generators.buyGenerator(rec.subtype);
        break;
    }
    
    return success;
  },

  // Get upgrade statistics
  getStats() {
    return {
      chiefGoldLevel: GameState.chief.gold,
      chiefGoldCost: GameState.chief.goldCost,
      chiefCooldownLevel: (5000 - GameState.chief.cooldown) / 500,
      chiefCooldownCost: GameState.chief.cooldownCost,
      totalUpgradesAffordable: this.countAffordableUpgrades(),
      recommendedUpgrade: this.getRecommendations()[0]
    };
  },

  // Count how many upgrades are currently affordable
  countAffordableUpgrades() {
    let count = 0;
    
    if (Chief.canUpgradeGold()) count++;
    if (Chief.canUpgradeCooldown()) count++;
    
    // Count affordable generators
    for (const generator of Object.values(GameState.generators)) {
      if (GameUtils.canAfford(generator.cost)) count++;
    }
    
    return count;
  },

  // Calculate total spent on upgrades
  getTotalSpent() {
    let total = 0;
    
    // Calculate spent on chief gold upgrades
    const goldLevel = GameState.chief.gold - 1; // -1 because starts at 1
    let goldCost = 50; // Initial cost
    for (let i = 0; i < goldLevel; i++) {
      total += goldCost;
      goldCost = Math.floor(goldCost * 1.7);
    }
    
    // Calculate spent on chief cooldown upgrades
    const cooldownLevel = (5000 - GameState.chief.cooldown) / 500;
    let cooldownCost = 75; // Initial cost
    for (let i = 0; i < cooldownLevel; i++) {
      total += cooldownCost;
      cooldownCost = Math.floor(cooldownCost * 2);
    }
    
    // Calculate spent on generators
    for (const [type, generator] of Object.entries(GameState.generators)) {
      const baseCost = GameUtils.getDefaultGeneratorCost(type);
      let cost = baseCost;
      for (let i = 0; i < generator.count; i++) {
        total += cost;
        cost = Math.floor(cost * 1.5);
      }
    }
    
    return total;
  },

  // Reset all upgrades
  reset() {
    GameState.chief.gold = 1;
    GameState.chief.goldCost = 25;
    GameState.chief.cooldown = 5000;
    GameState.chief.cooldownCost = 75;
    
    GameEvents.emit('chiefChanged');
  }
};