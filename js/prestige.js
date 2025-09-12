/**
 * Prestige System
 * Handles rebirth mechanics and wisdom points
 */

const Prestige = {
  // Minimum gold required for prestige
  PRESTIGE_THRESHOLD: 1000000, // 1M gold

  // Initialize prestige system
  init() {
    this.setupEventListeners();
    this.updateWisdomMultiplier();
  },

  // Setup event listeners
  setupEventListeners() {
    const prestigeBtn = document.getElementById('prestigeBtn');
    if (prestigeBtn) {
      prestigeBtn.addEventListener('click', () => this.showPrestigeConfirmation());
    }
  },

  // Get current prestige threshold (increases each time)
  getCurrentThreshold() {
    return this.PRESTIGE_THRESHOLD * Math.pow(10, GameState.prestige.prestigeCount);
  },

  // Check if prestige is available
  canPrestige() {
    return GameState.prestige.totalGoldEarned >= this.getCurrentThreshold();
  },

  // Calculate wisdom points that would be gained
  calculateWisdomGain() {
    if (!this.canPrestige()) return 0;
    
    const totalGold = GameState.prestige.totalGoldEarned;
    const currentThreshold = this.getCurrentThreshold();
    // Formula: sqrt(totalGold / currentThreshold) for wisdom points
    let baseWisdom = Math.floor(Math.sqrt(totalGold / currentThreshold)) + 1;
    
    // Apply tech tree bonus for wisdom gain
    if (typeof TechTree !== 'undefined') {
      const wisdomBonus = TechTree.getTechBonus('wisdom_gain_bonus');
      baseWisdom += wisdomBonus;
    }
    
    return baseWisdom;
  },

  // Get current prestige multiplier from wisdom
  getPrestigeMultiplier() {
    return GameState.prestige.bonusMultiplier;
  },

  // Update wisdom multiplier based on current wisdom points
  updateWisdomMultiplier() {
    // Base prestige bonus: Each wisdom point gives 5% bonus (multiplicative)
    let baseMultiplier = Math.pow(1.05, GameState.prestige.wisdomPoints);
    
    // Apply tech tree amplifier bonus
    if (typeof TechTree !== 'undefined') {
      const amplifierBonus = TechTree.getTechBonus('prestige_bonus_amplifier');
      baseMultiplier *= (1 + amplifierBonus);
    }
    
    GameState.prestige.bonusMultiplier = baseMultiplier;
  },

  // Show prestige confirmation dialog
  showPrestigeConfirmation() {
    if (!this.canPrestige()) {
      const needed = GameUtils.formatNumber(this.getCurrentThreshold() - GameState.prestige.totalGoldEarned);
      UI.showNotification(`Je hebt ${needed}💰 meer nodig voor Prestige!`, 'error');
      return;
    }

    const wisdomGain = this.calculateWisdomGain();
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: linear-gradient(145deg, #8b4513, #a0522d);
      border: 4px solid #654321;
      border-radius: 15px;
      padding: 30px;
      color: white;
      font-family: 'Courier New', monospace;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 0 50px rgba(0,0,0,0.8);
    `;

    const currentBonus = ((this.getPrestigeMultiplier() - 1) * 100).toFixed(0);
    const newBonus = ((Math.pow(1.05, GameState.prestige.wisdomPoints + wisdomGain) - 1) * 100).toFixed(0);

    dialog.innerHTML = `
      <h2>✨ Prestige - Herboren worden</h2>
      <p style="margin: 20px 0;">Verlaat dit leven en word wedergeboren met wijsheid!</p>
      
      <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin: 20px 0;">
        <strong>Je krijgt: ${wisdomGain} Wijsheid Punten</strong><br>
        <small style="color: #ffab40;">Huidige bonus: +${currentBonus}% → Nieuwe bonus: +${newBonus}%</small>
      </div>
      
      <p style="color: #ffab40; font-weight: bold; margin: 20px 0;">
        ⚠️ Je verliest ALLES behalve Wijsheid Punten!
      </p>
      
      <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
        <button id="confirmPrestigeBtn" style="
          background: #9c27b0;
          color: white;
          border: 2px solid #6a1b9a;
          border-radius: 5px;
          padding: 10px 20px;
          cursor: pointer;
          font-weight: bold;
        ">✨ Prestige!</button>
        <button id="cancelPrestigeBtn" style="
          background: #4caf50;
          color: white;
          border: 2px solid #2e7d32;
          border-radius: 5px;
          padding: 10px 20px;
          cursor: pointer;
          font-weight: bold;
        ">❌ Annuleren</button>
      </div>
    `;

    modal.appendChild(dialog);
    document.body.appendChild(modal);

    // Add event listeners
    dialog.querySelector('#confirmPrestigeBtn').addEventListener('click', () => {
      modal.remove();
      this.performPrestige();
    });

    dialog.querySelector('#cancelPrestigeBtn').addEventListener('click', () => {
      modal.remove();
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },

  // Perform the actual prestige
  performPrestige() {
    const wisdomGain = this.calculateWisdomGain();
    
    // Award wisdom points (both total and available for spending)
    GameState.prestige.wisdomPoints += wisdomGain;
    GameState.prestige.availableWisdom += wisdomGain;
    GameState.prestige.prestigeCount++;
    
    // Reset everything except prestige stats and tech tree
    this.resetForPrestige();
    
    // Update multiplier
    this.updateWisdomMultiplier();
    
    // Show success message
    UI.showNotification(
      `✨ Prestige voltooid! +${wisdomGain} Wijsheid! Nieuwe bonus: +${((this.getPrestigeMultiplier() - 1) * 100).toFixed(0)}%`,
      'success',
      5000
    );
    
    // Visual celebration
    VisualEffects.celebrate();
    
    GameEvents.emit('prestigeCompleted');
    GameEvents.emit('gameReset'); // Trigger UI updates
  },

  // Reset game state for prestige (keep wisdom and tech tree)
  resetForPrestige() {
    const prestigeData = { ...GameState.prestige }; // Keep prestige data
    const techTreeData = { ...GameState.techTree }; // Keep tech tree data
    
    // Reset everything else
    GameState.gold = 0;
    
    // Reset totalGoldEarned to prevent immediate re-prestige
    prestigeData.totalGoldEarned = 0;
    
    GameState.chief = {
      gold: 1,
      cooldown: 5000,
      busy: false,
      goldCost: 25,
      cooldownCost: 75,
      generatorBonus: 0,
      clickStreak: 0,
      lastClickTime: 0,
      skills: {
        rally: { cooldown: 0, duration: 0 },
        inspire: { stacks: 0 },
        fortune: { cooldown: 0 }
      }
    };
    
    // Reset generators
    for (const key in GameState.generators) {
      GameState.generators[key].count = 0;
      GameState.generators[key].cost = GameUtils.getDefaultGeneratorCost(key);
    }
    
    // Reset camps
    for (const key in GameState.camps) {
      GameState.camps[key].timer = 0;
    }
    
    // Reset building
    GameState.building = {
      level: 0,
      upgradeCost: 500,
      upgrades: {
        villager: { speed: 0, goldBonus: 0, luckBonus: 0 },
        trader: { speed: 0, goldBonus: 0, luckBonus: 0 },
        warrior: { speed: 0, goldBonus: 0, luckBonus: 0 },
        seer: { speed: 0, goldBonus: 0, luckBonus: 0 },
        elite: { speed: 0, goldBonus: 0, luckBonus: 0 }
      },
      luckTimer: 0,
      luckCooldown: 30000
    };
    
    // Restore prestige and tech tree data
    GameState.prestige = prestigeData;
    GameState.techTree = techTreeData;
  },

  // Calculate gold needed for next wisdom point
  getNextWisdomPointThreshold() {
    const currentThreshold = this.getCurrentThreshold();
    const currentWisdom = this.calculateWisdomGain();
    
    // Calculate what total gold would be needed for one more wisdom point
    // Formula: (currentWisdom + 1)^2 * currentThreshold = nextThreshold
    const nextWisdom = currentWisdom + 1;
    const nextThreshold = Math.pow(nextWisdom, 2) * currentThreshold;
    
    return nextThreshold;
  },

  // Get prestige stats
  getStats() {
    const nextWisdomThreshold = this.getNextWisdomPointThreshold();
    
    return {
      canPrestige: this.canPrestige(),
      totalGoldEarned: GameState.prestige.totalGoldEarned,
      wisdomPoints: GameState.prestige.wisdomPoints,
      availableWisdom: GameState.prestige.availableWisdom,
      prestigeCount: GameState.prestige.prestigeCount,
      currentMultiplier: this.getPrestigeMultiplier(),
      bonusPercentage: ((this.getPrestigeMultiplier() - 1) * 100).toFixed(1),
      wisdomGainAvailable: this.calculateWisdomGain(),
      goldNeededForPrestige: Math.max(0, this.getCurrentThreshold() - GameState.prestige.totalGoldEarned),
      currentThreshold: this.getCurrentThreshold(),
      nextWisdomThreshold: nextWisdomThreshold,
      goldNeededForNextWisdom: Math.max(0, nextWisdomThreshold - GameState.prestige.totalGoldEarned)
    };
  },

  // Reset prestige system
  reset() {
    GameState.prestige = {
      totalGoldEarned: 0,
      wisdomPoints: 0,
      availableWisdom: 0,
      prestigeCount: 0,
      bonusMultiplier: 1
    };
    GameState.techTree = {};
    this.updateWisdomMultiplier();
    GameEvents.emit('prestigeChanged');
  }
};