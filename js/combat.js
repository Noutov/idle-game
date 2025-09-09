/**
 * Combat System
 * Handles attacking Roman camps and combat calculations
 */

const Combat = {
  // Camp configurations
  campConfig: {
    camp1: {
      name: '🏕️ Klein kamp',
      difficulty: 5,
      reward: 100,
      cooldown: 10,
      description: 'laag risico, beloning 100💰'
    },
    camp2: {
      name: '🏰 Middelgroot kamp',
      difficulty: 20,
      reward: 400,
      cooldown: 20,
      description: 'middel risico, beloning 400💰'
    },
    camp3: {
      name: '🏛️ Groot fort',
      difficulty: 50,
      reward: 1500,
      cooldown: 30,
      description: 'hoog risico, beloning 1500💰'
    }
  },

  // Initialize combat system
  init() {
    this.setupEventListeners();
    // Select first camp by default
    setTimeout(() => {
      this.selectCamp('camp1');
    }, 100);
  },

  // Setup event listeners
  setupEventListeners() {
    const attackBtn = document.getElementById('attackBtn');
    const campSelect = document.getElementById('campSelect');
    const warriorsInput = document.getElementById('warriorsToSend');
    
    if (attackBtn) {
      attackBtn.addEventListener('click', () => this.attackCamp());
    }
    
    if (campSelect) {
      campSelect.addEventListener('change', () => this.updateCampInfo());
    }
    
    if (warriorsInput) {
      warriorsInput.addEventListener('input', () => {
        UI.updateButtons();
        this.updateAttackPreview();
      });
    }

    // Setup camp item selection
    document.querySelectorAll('.camp-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const campKey = item.getAttribute('data-camp');
        this.selectCamp(campKey);
      });
    });
  },

  // Select a camp
  selectCamp(campKey) {
    // Update hidden select
    const campSelect = document.getElementById('campSelect');
    if (campSelect) {
      campSelect.value = campKey;
    }

    // Update visual selection
    document.querySelectorAll('.camp-item').forEach(item => {
      item.classList.remove('selected');
    });
    document.querySelector(`[data-camp="${campKey}"]`).classList.add('selected');

    // Update button text
    const campNames = {
      camp1: 'Klein kamp',
      camp2: 'Middelgroot kamp', 
      camp3: 'Groot fort'
    };
    
    const selectedCampName = document.getElementById('selectedCampName');
    if (selectedCampName) {
      selectedCampName.textContent = campNames[campKey];
    }

    this.updateCampInfo();
    UI.updateButtons();
  },

  // Attack selected camp
  attackCamp() {
    const campSelect = document.getElementById('campSelect');
    const warriorsInput = document.getElementById('warriorsToSend');
    
    if (!campSelect || !warriorsInput) return;
    
    const campKey = campSelect.value;
    const camp = GameState.camps[campKey];
    const warriorsToSend = parseInt(warriorsInput.value) || 0;
    
    // Validation
    if (!this.validateAttack(camp, warriorsToSend)) {
      return;
    }
    
    // Calculate success chance
    const successChance = this.calculateSuccessChance(camp.difficulty, warriorsToSend);
    const isSuccess = Math.random() < successChance;
    
    if (isSuccess) {
      this.handleAttackSuccess(campKey, camp, warriorsToSend, successChance);
    } else {
      this.handleAttackFailure(campKey, camp, warriorsToSend, successChance);
    }
    
    // Start camp cooldown
    camp.timer = camp.cooldown;
    
    // Update UI
    GameEvents.emit('campsChanged');
    GameEvents.emit('generatorsChanged'); // Warriors might have been lost
  },

  // Validate attack parameters
  validateAttack(camp, warriorsToSend) {
    if (!camp) {
      UI.showAttackResult('❌ Ongeldig kamp geselecteerd!', 'failure');
      return false;
    }
    
    if (camp.timer > 0) {
      UI.showAttackResult(`⏳ Dit kamp is nog ${camp.timer}s in cooldown.`, 'cooldown');
      return false;
    }
    
    if (warriorsToSend <= 0) {
      UI.showAttackResult('❌ Je moet minstens 1 krijger sturen!', 'failure');
      return false;
    }
    
    if (warriorsToSend > GameState.generators.warrior.count) {
      UI.showAttackResult('❌ Je hebt niet genoeg krijgers!', 'failure');
      return false;
    }
    
    return true;
  },

  // Calculate success chance based on difficulty and warriors sent
  calculateSuccessChance(difficulty, warriors) {
    return Math.min(warriors / (difficulty + warriors), 0.95); // Max 95% success chance
  },

  // Handle successful attack
  handleAttackSuccess(campKey, camp, warriorsToSend, successChance) {
    const scaledBaseReward = this.getScaledReward(camp.reward);
    const bonusMultiplier = this.calculateBonusMultiplier(warriorsToSend, camp.difficulty);
    const totalReward = Math.floor(scaledBaseReward * bonusMultiplier);
    
    GameUtils.addGold(totalReward);
    
    const message = `✅ Succes! Je krijgers hebben ${GameUtils.formatNumber(totalReward)}💰 buitgemaakt! (${Math.round(successChance * 100)}% kans)`;
    UI.showAttackResult(message, 'success');
    
    // Visual effects
    const attackBtn = document.getElementById('attackBtn');
    if (attackBtn) {
      VisualEffects.createParticles(attackBtn, 8);
      VisualEffects.pulseButton('attackBtn', 'rgba(76, 175, 80, 0.5)');
    }
    
    // Screen shake for big victories
    if (totalReward >= 1000) {
      VisualEffects.screenShake(300, 3);
    }
    
    UI.showNotification(`🏆 Overwinning! +${GameUtils.formatNumber(totalReward)}💰`, 'success');
    
    // Achievement check
    this.checkCombatAchievements(campKey, true, totalReward);
  },

  // Handle failed attack
  handleAttackFailure(campKey, camp, warriorsToSend, successChance) {
    // Calculate warrior losses (not always all warriors die)
    const lossRate = Math.random() * 0.8 + 0.2; // 20-100% loss rate
    const warriorsLost = Math.ceil(warriorsToSend * lossRate);
    
    GameState.generators.warrior.count -= warriorsLost;
    GameState.generators.warrior.count = Math.max(0, GameState.generators.warrior.count);
    
    const message = `❌ Mislukt! Je bent ${warriorsLost} krijgers kwijtgeraakt... (${Math.round(successChance * 100)}% kans had je)`;
    UI.showAttackResult(message, 'failure');
    
    // Visual effects
    VisualEffects.screenShake(200, 2);
    UI.showNotification(`💀 Nederlaag! -${warriorsLost} krijgers`, 'error');
    
    this.checkCombatAchievements(campKey, false, warriorsLost);
  },

  // Calculate scaled reward based on player progression
  getScaledReward(baseReward) {
    // Scale rewards based on total GPS to keep combat relevant
    const currentGPS = GameUtils.calculateGPS();
    const scalingFactor = Math.max(1, Math.pow(currentGPS / 10, 0.6)); // Slower scaling
    
    // Also consider total gold earned (higher level = higher rewards)
    const goldMultiplier = Math.max(1, Math.pow(GameState.gold / 1000, 0.3));
    
    return Math.floor(baseReward * scalingFactor * goldMultiplier);
  },

  // Calculate bonus multiplier for overkill
  calculateBonusMultiplier(warriors, difficulty) {
    const overkill = Math.max(warriors - difficulty, 0);
    return 1 + (overkill * 0.1); // 10% bonus per excess warrior
  },

  // Update camp information display
  updateCampInfo() {
    const campSelect = document.getElementById('campSelect');
    if (!campSelect) return;
    
    const campKey = campSelect.value;
    const camp = GameState.camps[campKey];
    const cooldownElement = document.getElementById('campCooldown');
    
    if (cooldownElement && camp) {
      cooldownElement.textContent = camp.timer;
    }
    
    this.updateAttackPreview();
  },

  // Update attack preview (show success chance)
  updateAttackPreview() {
    const campSelect = document.getElementById('campSelect');
    const warriorsInput = document.getElementById('warriorsToSend');
    
    if (!campSelect || !warriorsInput) return;
    
    const campKey = campSelect.value;
    const camp = GameState.camps[campKey];
    const warriors = parseInt(warriorsInput.value) || 0;
    
    if (warriors > 0 && camp) {
      const successChance = this.calculateSuccessChance(camp.difficulty, warriors);
      const percentage = Math.round(successChance * 100);
      
      // Show success chance in attack result area if not in cooldown
      if (camp.timer <= 0) {
        UI.showAttackResult(
          `📊 Succeskans: ${percentage}% | Beloning: ${GameUtils.formatNumber(camp.reward)}💰`,
          'neutral'
        );
      }
    }
  },

  // Process camp cooldowns (called every second)
  processCooldowns() {
    let updated = false;
    
    for (const camp of Object.values(GameState.camps)) {
      if (camp.timer > 0) {
        camp.timer--;
        updated = true;
      }
    }
    
    if (updated) {
      GameEvents.emit('campsChanged');
    }
  },

  // Get combat statistics
  getStats() {
    const stats = {
      availableWarriors: GameState.generators.warrior.count,
      camps: {}
    };
    
    for (const [key, camp] of Object.entries(GameState.camps)) {
      const config = this.campConfig[key];
      stats.camps[key] = {
        name: config.name,
        difficulty: camp.difficulty,
        reward: camp.reward,
        cooldown: camp.timer,
        available: camp.timer <= 0
      };
    }
    
    return stats;
  },

  // Get recommended attack
  getRecommendedAttack() {
    const availableWarriors = GameState.generators.warrior.count;
    if (availableWarriors === 0) return null;
    
    let bestOption = null;
    let bestValue = 0;
    
    for (const [key, camp] of Object.entries(GameState.camps)) {
      if (camp.timer > 0) continue; // Skip camps on cooldown
      
      // Calculate expected value for different warrior amounts
      for (let warriors = 1; warriors <= Math.min(availableWarriors, camp.difficulty * 3); warriors++) {
        const successChance = this.calculateSuccessChance(camp.difficulty, warriors);
        const expectedReward = successChance * camp.reward;
        const warriorRisk = (1 - successChance) * warriors;
        const value = expectedReward - (warriorRisk * 20); // Assume warrior worth ~20 gold
        
        if (value > bestValue) {
          bestValue = value;
          bestOption = {
            campKey: key,
            campName: this.campConfig[key].name,
            warriors: warriors,
            successChance: successChance,
            expectedReward: expectedReward,
            value: value
          };
        }
      }
    }
    
    return bestOption;
  },

  // Auto-attack feature
  startAutoAttack(enabled = true) {
    if (enabled) {
      this.autoAttackInterval = setInterval(() => {
        const recommendation = this.getRecommendedAttack();
        if (recommendation && recommendation.successChance > 0.7) {
          // Set the recommended attack
          const campSelect = document.getElementById('campSelect');
          const warriorsInput = document.getElementById('warriorsToSend');
          
          if (campSelect && warriorsInput) {
            campSelect.value = recommendation.campKey;
            warriorsInput.value = recommendation.warriors;
            this.attackCamp();
          }
        }
      }, 5000); // Check every 5 seconds
      
      UI.showNotification('Auto-aanval ingeschakeld!', 'info');
    } else {
      this.stopAutoAttack();
    }
  },

  // Stop auto-attack
  stopAutoAttack() {
    if (this.autoAttackInterval) {
      clearInterval(this.autoAttackInterval);
      this.autoAttackInterval = null;
      UI.showNotification('Auto-aanval uitgeschakeld!', 'info');
    }
  },

  // Check combat achievements
  checkCombatAchievements(campKey, isSuccess, amount) {
    if (isSuccess) {
      // Track successful attacks
      if (!this.successfulAttacks) this.successfulAttacks = {};
      if (!this.successfulAttacks[campKey]) this.successfulAttacks[campKey] = 0;
      this.successfulAttacks[campKey]++;
      
      const successCount = this.successfulAttacks[campKey];
      const milestones = [1, 10, 25, 50, 100];
      
      if (milestones.includes(successCount)) {
        const campName = this.campConfig[campKey].name;
        UI.showNotification(
          `🏆 ${campName} ${successCount}x verslagen!`,
          'success',
          5000
        );
      }
      
      // Big victory achievement
      if (amount >= 5000) {
        UI.showNotification('🎖️ Grote overwinning! 5000+ goud!', 'success', 5000);
        VisualEffects.celebrate();
      }
    } else {
      // Track warrior losses
      if (!this.totalWarriorsLost) this.totalWarriorsLost = 0;
      this.totalWarriorsLost += amount;
      
      const lossMilestones = [10, 50, 100, 500];
      if (lossMilestones.includes(this.totalWarriorsLost)) {
        UI.showNotification(
          `💀 Totaal ${this.totalWarriorsLost} krijgers verloren...`,
          'error',
          3000
        );
      }
    }
  },

  // Calculate optimal warrior distribution
  getOptimalStrategy() {
    const strategies = [];
    
    for (const [key, camp] of Object.entries(GameState.camps)) {
      if (camp.timer > 0) continue;
      
      const config = this.campConfig[key];
      const optimalWarriors = Math.ceil(camp.difficulty * 0.8); // 80% of difficulty for good success rate
      const successChance = this.calculateSuccessChance(camp.difficulty, optimalWarriors);
      const expectedValue = successChance * camp.reward;
      
      strategies.push({
        camp: key,
        name: config.name,
        warriors: optimalWarriors,
        successChance: successChance,
        expectedValue: expectedValue,
        efficiency: expectedValue / optimalWarriors
      });
    }
    
    return strategies.sort((a, b) => b.efficiency - a.efficiency);
  },

  // Reset combat system
  reset() {
    for (const camp of Object.values(GameState.camps)) {
      camp.timer = 0;
    }
    
    this.stopAutoAttack();
    this.successfulAttacks = {};
    this.totalWarriorsLost = 0;
    
    GameEvents.emit('campsChanged');
  }
};