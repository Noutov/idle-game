/**
 * Enhanced Chief System
 * Advanced chief features: skills, click streaks, and generator bonuses
 */

const ChiefEnhanced = {
  // Initialize enhanced chief system
  init() {
    this.setupEventListeners();
    this.startTimers();
  },

  // Setup event listeners for enhanced features
  setupEventListeners() {
    // Listen for chief clicks to handle streaks and bonuses
    GameEvents.on('chiefClicked', () => {
      this.handleClickStreak();
      this.activateGeneratorBonus();
    });

    // Skill buttons
    const rallyBtn = document.getElementById('rallySkillBtn');
    const inspireBtn = document.getElementById('inspireSkillBtn');  
    const fortuneBtn = document.getElementById('fortuneSkillBtn');

    if (rallyBtn) {
      rallyBtn.addEventListener('click', () => this.useRallySkill());
    }
    if (inspireBtn) {
      inspireBtn.addEventListener('click', () => this.useInspireSkill());
    }
    if (fortuneBtn) {
      fortuneBtn.addEventListener('click', () => this.useFortuneSkill());
    }
  },

  // Start timers for various systems
  startTimers() {
    setInterval(() => {
      this.processTimers();
    }, 1000); // Process every second
  },

  // Process all timers
  processTimers() {
    let changed = false;

    // Generator bonus timer
    if (GameState.chief.generatorBonus > 0) {
      GameState.chief.generatorBonus--;
      changed = true;
    }

    // Rally skill duration
    if (GameState.chief.skills.rally.duration > 0) {
      GameState.chief.skills.rally.duration--;
      changed = true;
    }

    // Skill cooldowns
    if (GameState.chief.skills.rally.cooldown > 0) {
      GameState.chief.skills.rally.cooldown--;
      changed = true;
    }

    if (GameState.chief.skills.fortune.cooldown > 0) {
      GameState.chief.skills.fortune.cooldown--;
      changed = true;
    }

    // Reset click streak if too much time passed
    const now = Date.now();
    if (now - GameState.chief.lastClickTime > 10000) { // 10 seconds
      if (GameState.chief.clickStreak > 0) {
        GameState.chief.clickStreak = 0;
        changed = true;
      }
    }

    if (changed) {
      GameEvents.emit('chiefEnhancedChanged');
    }
  },

  // Handle click streak system
  handleClickStreak() {
    const now = Date.now();
    const timeSinceLastClick = now - GameState.chief.lastClickTime;

    if (timeSinceLastClick <= 10000) { // Within 10 seconds
      GameState.chief.clickStreak = Math.min(GameState.chief.clickStreak + 1, 10);
    } else {
      GameState.chief.clickStreak = 1; // Reset streak
    }

    GameState.chief.lastClickTime = now;
  },

  // Activate 10-second generator bonus
  activateGeneratorBonus() {
    GameState.chief.generatorBonus = 10; // 10 seconds of +50% bonus
    UI.showNotification('Generator Bonus Actief! +50% voor 10 sec', 'success');
  },

  // Get click streak multiplier with progressive scaling
  getClickStreakMultiplier() {
    const streak = GameState.chief.clickStreak;
    if (streak === 0) return 1;
    
    // Calculate base multiplier that scales with game progression
    const totalGoldEarned = GameState.prestige.totalGoldEarned;
    const progressFactor = Math.max(0.3, 1 - (totalGoldEarned / 100000)); // Scale down as player progresses
    
    // Early game: much higher bonuses, Late game: more moderate
    // Streak 1: +50% → +15%, Streak 5: +200% → +75%, Streak 10: +400% → +150%
    let multiplier;
    if (streak <= 3) {
      // First 3 clicks: exponential growth
      multiplier = 1 + (Math.pow(streak, 1.8) * 0.5 * progressFactor);
    } else if (streak <= 7) {
      // Clicks 4-7: linear growth  
      const baseBonus = Math.pow(3, 1.8) * 0.5 * progressFactor;
      multiplier = 1 + baseBonus + ((streak - 3) * 0.3 * progressFactor);
    } else {
      // Clicks 8-10: diminishing returns
      const baseBonus = Math.pow(3, 1.8) * 0.5 * progressFactor + (4 * 0.3 * progressFactor);
      multiplier = 1 + baseBonus + ((streak - 7) * 0.15 * progressFactor);
    }
    
    // Ensure minimum meaningful bonus even in late game
    return Math.max(multiplier, 1 + (streak * 0.05));
  },

  // Rally Skill: 2x generator speed for 30 seconds
  useRallySkill() {
    if (GameState.chief.skills.rally.cooldown > 0) {
      UI.showNotification(`Rally nog ${GameState.chief.skills.rally.cooldown}s in cooldown!`, 'error');
      return false;
    }

    GameState.chief.skills.rally.duration = 30; // 30 seconds
    GameState.chief.skills.rally.cooldown = 300; // 5 minutes cooldown

    UI.showNotification('🚀 Rally! Alle generators werken 2x sneller voor 30 sec!', 'success');
    VisualEffects.celebrate();
    GameEvents.emit('chiefEnhancedChanged');
    return true;
  },

  // Inspire Skill: Next generator purchases are cheaper
  useInspireSkill() {
    if (GameState.chief.skills.inspire.stacks >= 5) {
      UI.showNotification('Maximum Inspire stacks bereikt!', 'error');
      return false;
    }

    GameState.chief.skills.inspire.stacks++;
    const discount = GameState.chief.skills.inspire.stacks * 25;

    UI.showNotification(`💡 Inspire! Volgende generators ${discount}% goedkoper!`, 'success');
    GameEvents.emit('chiefEnhancedChanged');
    GameEvents.emit('generatorsChanged'); // Update costs
    return true;
  },

  // Fortune Skill: Get instant GPS bonus
  useFortuneSkill() {
    if (GameState.chief.skills.fortune.cooldown > 0) {
      UI.showNotification(`Fortune nog ${GameState.chief.skills.fortune.cooldown}s in cooldown!`, 'error');
      return false;
    }

    const currentGPS = GameUtils.calculateGPS();
    const fortuneBonus = Math.floor(currentGPS * 2); // 2x current GPS

    if (fortuneBonus === 0) {
      UI.showNotification('Je hebt nog geen generators voor Fortune!', 'error');
      return false;
    }

    GameUtils.addGold(fortuneBonus);
    GameState.chief.skills.fortune.cooldown = 120; // 2 minutes cooldown

    UI.showNotification(`🍀 Fortune! +${GameUtils.formatNumber(fortuneBonus)}💰 bonus!`, 'success');
    
    // Visual effects
    const chiefSprite = document.getElementById('chiefSprite');
    if (chiefSprite) {
      VisualEffects.createFloatingGold(chiefSprite, fortuneBonus);
      VisualEffects.createParticles(chiefSprite, 10);
    }

    GameEvents.emit('chiefEnhancedChanged');
    return true;
  },

  // Consume inspire stack when buying generator
  consumeInspireStack() {
    if (GameState.chief.skills.inspire.stacks > 0) {
      GameState.chief.skills.inspire.stacks--;
      GameEvents.emit('chiefEnhancedChanged');
      GameEvents.emit('generatorsChanged');
    }
  },

  // Get current stats
  getStats() {
    return {
      generatorBonusActive: GameState.chief.generatorBonus > 0,
      generatorBonusTimeLeft: GameState.chief.generatorBonus,
      clickStreak: GameState.chief.clickStreak,
      clickMultiplier: this.getClickStreakMultiplier(),
      skills: {
        rally: {
          active: GameState.chief.skills.rally.duration > 0,
          duration: GameState.chief.skills.rally.duration,
          cooldown: GameState.chief.skills.rally.cooldown,
          available: GameState.chief.skills.rally.cooldown === 0
        },
        inspire: {
          stacks: GameState.chief.skills.inspire.stacks,
          discount: GameState.chief.skills.inspire.stacks * 25 + '%',
          available: GameState.chief.skills.inspire.stacks < 5
        },
        fortune: {
          cooldown: GameState.chief.skills.fortune.cooldown,
          available: GameState.chief.skills.fortune.cooldown === 0,
          potentialBonus: GameUtils.formatNumber(Math.floor(GameUtils.calculateGPS() * 2))
        }
      }
    };
  },

  // Reset enhanced chief features
  reset() {
    GameState.chief.generatorBonus = 0;
    GameState.chief.clickStreak = 0;
    GameState.chief.lastClickTime = 0;
    GameState.chief.skills = {
      rally: { cooldown: 0, duration: 0 },
      inspire: { stacks: 0 },
      fortune: { cooldown: 0 }
    };
    
    GameEvents.emit('chiefEnhancedChanged');
  }
};