/**
 * UI Management System
 * Handles all DOM updates and display logic
 */

const UI = {
  // DOM element cache
  elements: {},

  // Initialize UI system
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.updateAll();
  },

  // Cache frequently used DOM elements
  cacheElements() {
    const elementIds = [
      'gold', 'gpsDisplay', 'chiefSprite', 'chiefBtn', 'chiefProgress',
      'chiefGold', 'chiefCooldownText', 'chiefGoldStat', 'chiefCooldownStat',
      'chiefGoldCost', 'chiefCooldownCost', 'upgradeGoldBtn', 'upgradeCooldownBtn',
      'villagerCount', 'warriorCount', 'seerCount', 'eliteCount',
      'villagerCost', 'warriorCost', 'seerCost', 'eliteCost',
      'villagerGPS', 'warriorGPS', 'seerGPS', 'eliteGPS',
      'villagerTotalGPS', 'warriorTotalGPS', 'seerTotalGPS', 'eliteTotalGPS',
      'buyVillagerBtn', 'buyWarriorBtn', 'buySeerBtn', 'buyEliteBtn',
      'warriorCount2', 'campSelect', 'warriorsToSend', 'attackBtn',
      'campCooldown', 'attackResult', 'resetGameBtn', 'selectedCampName',
      'camp1Reward', 'camp2Reward', 'camp3Reward',
      'buildingSprite', 'buildingName', 'buildingDescription', 'buildingUpgradeName', 
      'buildingCost', 'upgradeBuildingBtn', 'generatorUpgrades'
    ];

    elementIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
      if (!this.elements[id]) {
        console.warn(`Element with id '${id}' not found`);
      }
    });
  },

  // Setup event listeners for game state changes
  setupEventListeners() {
    GameEvents.on('goldChanged', () => {
      this.updateGoldDisplay();
      this.updateButtons();
      this.updatePrestige();
    });
    GameEvents.on('generatorsChanged', () => this.updateGenerators());
    GameEvents.on('chiefChanged', () => this.updateChief());
    GameEvents.on('chiefEnhancedChanged', () => this.updateChiefEnhanced());
    GameEvents.on('campsChanged', () => this.updateCombat());
    GameEvents.on('buildingChanged', () => this.updateBuilding());
    GameEvents.on('prestigeCompleted', () => this.updateAll());
    GameEvents.on('gameLoaded', () => this.updateAll());
    GameEvents.on('offlineProgress', (data) => this.showOfflineProgress(data));
    GameEvents.on('gameReset', () => this.updateAll());

    // Setup DOM event listeners
    this.setupDOMEventListeners();
  },

  // Setup DOM event listeners
  setupDOMEventListeners() {
    // Reset game button
    if (this.elements.resetGameBtn) {
      this.elements.resetGameBtn.addEventListener('click', () => {
        this.confirmReset();
      });
    }
  },

  // Update all UI elements
  updateAll() {
    this.updateGoldDisplay();
    this.updateChief();
    this.updateChiefEnhanced();
    this.updateGenerators();
    this.updateCombat();
    this.updateBuilding();
    this.updatePrestige();
    this.updateButtons();
  },

  // Update gold and gold per second display
  updateGoldDisplay() {
    if (this.elements.gold) {
      this.elements.gold.textContent = GameUtils.formatNumber(GameState.gold);
    }
    
    const gps = GameUtils.calculateGPS();
    if (this.elements.gpsDisplay) {
      this.elements.gpsDisplay.textContent = GameUtils.formatNumber(gps);
    }
  },

  // Update chief-related UI elements
  updateChief() {
    if (this.elements.chiefGold) {
      this.elements.chiefGold.textContent = GameState.chief.gold;
    }
    
    if (this.elements.chiefCooldownText) {
      this.elements.chiefCooldownText.textContent = (GameState.chief.cooldown / 1000).toFixed(1);
    }
    
    if (this.elements.chiefGoldStat) {
      this.elements.chiefGoldStat.textContent = GameState.chief.gold;
    }
    
    if (this.elements.chiefCooldownStat) {
      this.elements.chiefCooldownStat.textContent = (GameState.chief.cooldown / 1000).toFixed(1);
    }
    
    if (this.elements.chiefGoldCost) {
      this.elements.chiefGoldCost.textContent = GameUtils.formatNumber(GameState.chief.goldCost);
    }
    
    if (this.elements.chiefCooldownCost) {
      this.elements.chiefCooldownCost.textContent = GameUtils.formatNumber(GameState.chief.cooldownCost);
    }
  },

  // Update generator displays
  updateGenerators() {
    for (const [type, gen] of Object.entries(GameState.generators)) {
      const countElement = this.elements[type + 'Count'];
      const costElement = this.elements[type + 'Cost'];
      const gpsElement = this.elements[type + 'GPS'];
      const totalGpsElement = this.elements[type + 'TotalGPS'];
      
      if (countElement) {
        countElement.textContent = gen.count;
      }
      
      // Use dynamic cost calculation for display
      const dynamicCost = GameUtils.calculateGeneratorCost(type, gen.count);
      if (costElement) {
        costElement.textContent = GameUtils.formatNumber(dynamicCost);
      }
      
      // Update the actual generator cost in state for consistency
      gen.cost = dynamicCost;
      
      // Update individual GPS (enhanced by building if available)
      if (gpsElement) {
        const enhancedGps = typeof Building !== 'undefined' ? 
          Building.getEnhancedGPS(type) : gen.gps;
        gpsElement.textContent = GameUtils.formatNumber(enhancedGps);
      }
      
      // Update total GPS for this generator type
      if (totalGpsElement) {
        const enhancedGps = typeof Building !== 'undefined' ? 
          Building.getEnhancedGPS(type) : gen.gps;
        const totalGps = gen.count * enhancedGps;
        totalGpsElement.textContent = GameUtils.formatNumber(totalGps);
      }
    }
    
    // Update warrior count in combat section
    if (this.elements.warriorCount2) {
      this.elements.warriorCount2.textContent = GameState.generators.warrior.count;
    }
    
    if (this.elements.warriorsToSend) {
      this.elements.warriorsToSend.max = GameState.generators.warrior.count;
    }
    
    // Update generator button states
    this.updateGeneratorButtons();
  },

  // Update combat section
  updateCombat() {
    if (this.elements.campCooldown) {
      const campKey = this.elements.campSelect ? this.elements.campSelect.value : 'camp1';
      this.elements.campCooldown.textContent = GameState.camps[campKey]?.timer || 0;
    }

    // Update dynamic camp rewards
    if (typeof Combat !== 'undefined') {
      const baseRewards = { camp1: 100, camp2: 400, camp3: 1500 };
      
      Object.keys(baseRewards).forEach(campKey => {
        const rewardElement = this.elements[campKey + 'Reward'];
        if (rewardElement) {
          const scaledReward = Combat.getScaledReward(baseRewards[campKey]);
          rewardElement.textContent = GameUtils.formatNumber(scaledReward);
        }
      });
    }
  },

  // Update button states (enabled/disabled)
  updateButtons() {
    // Upgrade buttons with visual feedback
    this.updateUpgradeButtons();

    // Generator buy buttons (updated separately for better performance)
    this.updateGeneratorButtons();

    // Chief button
    if (this.elements.chiefBtn) {
      this.elements.chiefBtn.disabled = GameState.chief.busy;
    }

    // Attack button
    this.updateAttackButton();
  },

  // Update upgrade buttons with visual feedback
  updateUpgradeButtons() {
    // Chief gold upgrade button
    if (this.elements.upgradeGoldBtn) {
      const canAfford = GameUtils.canAfford(GameState.chief.goldCost);
      this.elements.upgradeGoldBtn.disabled = !canAfford;
      
      if (canAfford) {
        this.elements.upgradeGoldBtn.classList.remove('unaffordable');
        this.elements.upgradeGoldBtn.classList.add('affordable');
      } else {
        this.elements.upgradeGoldBtn.classList.remove('affordable');
        this.elements.upgradeGoldBtn.classList.add('unaffordable');
      }
    }
    
    // Chief cooldown upgrade button
    if (this.elements.upgradeCooldownBtn) {
      const canAfford = GameUtils.canAfford(GameState.chief.cooldownCost);
      const maxSpeed = GameState.chief.cooldown <= 500;
      const disabled = !canAfford || maxSpeed;
      
      this.elements.upgradeCooldownBtn.disabled = disabled;
      
      if (!disabled) {
        this.elements.upgradeCooldownBtn.classList.remove('unaffordable');
        this.elements.upgradeCooldownBtn.classList.add('affordable');
      } else {
        this.elements.upgradeCooldownBtn.classList.remove('affordable');
        this.elements.upgradeCooldownBtn.classList.add('unaffordable');
      }
    }
  },

  // Update generator buy buttons with visual feedback
  updateGeneratorButtons() {
    for (const [type, gen] of Object.entries(GameState.generators)) {
      const buyBtn = this.elements['buy' + this.capitalize(type) + 'Btn'];
      if (buyBtn) {
        const canAfford = GameUtils.canAfford(gen.cost);
        buyBtn.disabled = !canAfford;
        
        // Add visual styling based on affordability
        if (canAfford) {
          buyBtn.classList.remove('unaffordable');
          buyBtn.classList.add('affordable');
        } else {
          buyBtn.classList.remove('affordable');
          buyBtn.classList.add('unaffordable');
        }
      }
    }
  },

  // Update attack button state
  updateAttackButton() {
    if (!this.elements.attackBtn || !this.elements.warriorsToSend || !this.elements.campSelect) {
      return;
    }

    const warriorsToSend = parseInt(this.elements.warriorsToSend.value) || 0;
    const campKey = this.elements.campSelect.value;
    const camp = GameState.camps[campKey];
    
    const isDisabled = 
      warriorsToSend <= 0 || 
      warriorsToSend > GameState.generators.warrior.count || 
      (camp && camp.timer > 0);
    
    this.elements.attackBtn.disabled = isDisabled;
  },

  // Update progress bar
  updateProgressBar(percentage) {
    if (this.elements.chiefProgress) {
      VisualEffects.animateProgressBar('chiefProgress', percentage);
    }
  },

  // Show attack result
  showAttackResult(message, type = 'neutral') {
    if (this.elements.attackResult) {
      this.elements.attackResult.textContent = message;
      this.elements.attackResult.className = `attack-result ${type}`;
    }
  },

  // Show offline progress modal
  showOfflineProgress(data) {
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
      text-align: center;
      z-index: 10000;
      box-shadow: 0 0 50px rgba(0,0,0,0.8);
    `;

    const timeHours = Math.floor(data.time / 3600);
    const timeMinutes = Math.floor((data.time % 3600) / 60);
    
    modal.innerHTML = `
      <h2>🌙 Offline Progress</h2>
      <p>Je was ${timeHours}h ${timeMinutes}m offline!</p>
      <p>Je generators hebben <strong>${GameUtils.formatNumber(data.gold)}💰</strong> verdiend!</p>
      <button onclick="this.parentElement.remove()" style="margin-top: 15px;">
        Geweldig! 🎉
      </button>
    `;

    document.body.appendChild(modal);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (modal.parentElement) {
        modal.remove();
      }
    }, 10000);
  },

  // Utility function to capitalize first letter
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Show notification
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  },

  // Update building display
  updateBuilding() {
    if (typeof Building === 'undefined') return;

    const buildingInfo = Building.getBuildingInfo();

    // Update building sprite
    if (this.elements.buildingSprite) {
      this.elements.buildingSprite.textContent = buildingInfo.current.icon;
    }

    // Update building name and description
    if (this.elements.buildingName) {
      this.elements.buildingName.textContent = buildingInfo.current.name;
    }
    if (this.elements.buildingDescription) {
      this.elements.buildingDescription.textContent = buildingInfo.current.description;
    }

    // Update upgrade button
    if (this.elements.upgradeBuildingBtn) {
      const btn = this.elements.upgradeBuildingBtn;
      if (buildingInfo.next) {
        btn.style.display = 'block';
        if (this.elements.buildingUpgradeName) {
          this.elements.buildingUpgradeName.textContent = buildingInfo.next.name;
        }
        if (this.elements.buildingCost) {
          this.elements.buildingCost.textContent = GameUtils.formatNumber(buildingInfo.next.cost);
        }
        btn.disabled = !buildingInfo.canUpgrade;
      } else {
        btn.style.display = 'none';
      }
    }

    // Show/hide generator upgrades
    if (this.elements.generatorUpgrades) {
      this.elements.generatorUpgrades.style.display = 
        GameState.building.level > 0 ? 'block' : 'none';
    }

    // Update generator upgrade buttons
    this.updateGeneratorUpgrades();
  },

  // Update generator upgrade buttons
  updateGeneratorUpgrades() {
    if (typeof Building === 'undefined' || GameState.building.level === 0) return;

    ['villager', 'warrior', 'seer', 'elite'].forEach(type => {
      const upgradeInfo = Building.getGeneratorUpgradeInfo(type);

      ['Speed', 'GoldBonus', 'LuckBonus'].forEach(upgradeType => {
        const camelCase = upgradeType === 'GoldBonus' ? 'goldBonus' : 
                         upgradeType === 'LuckBonus' ? 'luckBonus' : 'speed';
        
        const isUnlocked = Building.isUpgradeTypeUnlocked(camelCase, GameState.building.level);
        const currentLevel = upgradeInfo[camelCase].current;
        const maxLevel = upgradeInfo[camelCase].max;
        const cost = upgradeInfo[camelCase].cost;
        
        // Update level displays
        const lvlElement = document.getElementById(`${type}${upgradeType}Lvl`);
        if (lvlElement) {
          if (isUnlocked) {
            lvlElement.textContent = `${currentLevel}/${maxLevel}`;
          } else {
            lvlElement.textContent = '🔒';
          }
        }

        // Update cost displays
        const costElement = document.getElementById(`${type}${upgradeType}Cost`);
        if (costElement) {
          if (isUnlocked && currentLevel < maxLevel) {
            costElement.textContent = GameUtils.formatNumber(cost);
          } else if (isUnlocked && currentLevel >= maxLevel) {
            costElement.textContent = 'MAX';
          } else {
            const requiredLevel = this.getUpgradeUnlockLevel(camelCase);
            costElement.textContent = `Lv.${requiredLevel}`;
          }
        }

        // Update button state
        const btnElement = document.getElementById(`${type}${upgradeType}Btn`);
        if (btnElement) {
          if (isUnlocked && currentLevel < maxLevel) {
            btnElement.disabled = !Building.canUpgradeGenerator(type, camelCase);
            btnElement.style.opacity = Building.canUpgradeGenerator(type, camelCase) ? '1' : '0.7';
          } else {
            btnElement.disabled = true;
            btnElement.style.opacity = '0.5';
          }
        }
      });
    });
  },

  // Get required building level for upgrade unlock
  getUpgradeUnlockLevel(upgradeType) {
    const unlockRequirements = {
      speed: 1,
      goldBonus: 2,
      luckBonus: 3
    };
    return unlockRequirements[upgradeType] || 1;
  },

  // Show reset confirmation dialog
  confirmReset() {
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
      max-width: 400px;
      box-shadow: 0 0 50px rgba(0,0,0,0.8);
    `;

    dialog.innerHTML = `
      <h2>⚠️ Spel Resetten</h2>
      <p style="margin: 20px 0;">Weet je zeker dat je het hele spel wilt resetten?</p>
      <p style="color: #ffab40; font-weight: bold; margin: 20px 0;">Alle vooruitgang gaat verloren!</p>
      <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
        <button id="confirmResetBtn" style="
          background: #d32f2f;
          color: white;
          border: 2px solid #b71c1c;
          border-radius: 5px;
          padding: 10px 20px;
          cursor: pointer;
          font-weight: bold;
        ">🔄 Ja, Reset</button>
        <button id="cancelResetBtn" style="
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
    dialog.querySelector('#confirmResetBtn').addEventListener('click', () => {
      modal.remove();
      if (typeof Game !== 'undefined' && Game.resetGame) {
        Game.resetGame();
      } else {
        GameUtils.resetGame();
        this.updateAll();
        this.showNotification('Spel gereset!', 'success');
      }
    });

    dialog.querySelector('#cancelResetBtn').addEventListener('click', () => {
      modal.remove();
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },

  // Update chief enhanced features
  updateChiefEnhanced() {
    if (typeof ChiefEnhanced === 'undefined') return;
    
    const stats = ChiefEnhanced.getStats();
    
    // Update click streak display
    const streakDisplay = document.getElementById('clickStreakDisplay');
    const streakCount = document.getElementById('clickStreakCount');
    const streakMultiplier = document.getElementById('clickStreakMultiplier');
    
    if (streakDisplay && streakCount && streakMultiplier) {
      if (stats.clickStreak > 0) {
        streakDisplay.style.display = 'block';
        streakCount.textContent = stats.clickStreak;
        streakMultiplier.textContent = stats.clickMultiplier.toFixed(1);
      } else {
        streakDisplay.style.display = 'none';
      }
    }
    
    // Update generator bonus display
    const bonusDisplay = document.getElementById('generatorBonusDisplay');
    const bonusTime = document.getElementById('generatorBonusTime');
    
    if (bonusDisplay && bonusTime) {
      if (stats.generatorBonusActive) {
        bonusDisplay.style.display = 'block';
        bonusTime.textContent = stats.generatorBonusTimeLeft;
      } else {
        bonusDisplay.style.display = 'none';
      }
    }
    
    // Update skill buttons
    this.updateSkillButton('rallySkillBtn', 'rallyStatus', stats.skills.rally);
    this.updateSkillButton('inspireSkillBtn', 'inspireStatus', stats.skills.inspire);
    this.updateSkillButton('fortuneSkillBtn', 'fortuneStatus', stats.skills.fortune);
  },

  // Update individual skill button
  updateSkillButton(btnId, statusId, skillData) {
    const button = document.getElementById(btnId);
    const status = document.getElementById(statusId);
    
    if (!button || !status) return;
    
    if (btnId === 'rallySkillBtn') {
      if (skillData.active) {
        status.textContent = `Actief: ${skillData.duration}s`;
        button.disabled = true;
      } else if (skillData.cooldown > 0) {
        status.textContent = `Cooldown: ${skillData.cooldown}s`;
        button.disabled = true;
      } else {
        status.textContent = '2x snelheid (30s)';
        button.disabled = false;
      }
    } else if (btnId === 'inspireSkillBtn') {
      if (skillData.stacks > 0) {
        status.textContent = `${skillData.discount} korting (${5 - skillData.stacks} left)`;
      } else {
        status.textContent = '-25% kosten';
      }
      button.disabled = !skillData.available;
    } else if (btnId === 'fortuneSkillBtn') {
      if (skillData.cooldown > 0) {
        status.textContent = `Cooldown: ${skillData.cooldown}s`;
        button.disabled = true;
      } else {
        status.textContent = `${skillData.potentialBonus}💰 bonus`;
        button.disabled = false;
      }
    }
  },

  // Update prestige display
  updatePrestige() {
    if (typeof Prestige === 'undefined') return;
    
    const stats = Prestige.getStats();
    
    // Update prestige stats
    const totalGoldElement = document.getElementById('totalGoldEarned');
    if (totalGoldElement) {
      totalGoldElement.textContent = GameUtils.formatNumber(stats.totalGoldEarned);
    }
    
    const wisdomElement = document.getElementById('wisdomPoints');
    if (wisdomElement) {
      wisdomElement.textContent = stats.wisdomPoints;
    }
    
    const prestigeCountElement = document.getElementById('prestigeCount');
    if (prestigeCountElement) {
      prestigeCountElement.textContent = stats.prestigeCount;
    }
    
    const bonusElement = document.getElementById('prestigeBonus');
    if (bonusElement) {
      bonusElement.textContent = stats.bonusPercentage;
    }
    
    // Update prestige button
    const prestigeBtn = document.getElementById('prestigeBtn');
    const prestigeRequirement = document.getElementById('prestigeRequirement');
    
    if (prestigeBtn && prestigeRequirement) {
      if (stats.canPrestige) {
        prestigeBtn.disabled = false;
        prestigeRequirement.textContent = `Krijg: ${stats.wisdomGainAvailable} Wijsheid`;
      } else {
        prestigeBtn.disabled = true;
        const needed = GameUtils.formatNumber(stats.goldNeededForPrestige);
        prestigeRequirement.textContent = `Nog ${needed}💰 nodig`;
      }
    }
  },

  // Add CSS for notification animations
  addNotificationStyles() {
    if (!document.querySelector('#notificationStyles')) {
      const style = document.createElement('style');
      style.id = 'notificationStyles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }
};