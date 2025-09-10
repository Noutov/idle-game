/**
 * Adventure System - Hero battles enemies for gold rewards
 * Features hero progression, enemy scaling, and visual combat
 */

const Adventure = {
  // Adventure state
  isActive: false,
  combatActive: false,
  currentEnemy: null,
  enemiesDefeated: 0,
  adventureStartTime: 0,
  combatAnimationId: null,
  
  // Initialize adventure system
  init() {
    this.setupAdventureState();
    this.setupEventListeners();
    console.log('🗡️ Adventure system initialized');
  },
  
  // Setup adventure state in GameState
  setupAdventureState() {
    if (!GameState.adventure) {
      GameState.adventure = {
        // Hero stats
        hero: {
          level: 1,
          hp: 100,
          maxHp: 100,
          attack: 10,
          defense: 5,
          experience: 0,
          experienceToNext: 100,
          isResting: false,
          restTimeLeft: 0,
          restDuration: 20000, // 20 seconds base rest time
          lastAdventureTime: 0
        },
        
        // Adventure progress
        currentWave: 1,
        enemiesInWave: 0,
        maxEnemiesInWave: 5,
        goldEarned: 0,
        
        // Upgrades
        upgrades: {
          attack: { level: 0, cost: 100 },
          defense: { level: 0, cost: 150 },
          health: { level: 0, cost: 200 },
          recovery: { level: 0, cost: 300 }, // Reduces rest time
          luck: { level: 0, cost: 500 } // Increases gold drops
        }
      };
    }
  },
  
  // Setup event listeners
  setupEventListeners() {
    // Adventure mode toggle
    const toggleBtn = document.getElementById('adventureToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleAdventureMode());
    }
    
    // Start adventure button
    const startBtn = document.getElementById('startAdventureBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startAdventure());
    }
    
    // Stop adventure button
    const stopBtn = document.getElementById('stopAdventureBtn');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopAdventure());
    }
    
    // Hero upgrade buttons
    for (const upgradeType of Object.keys(GameState.adventure.upgrades)) {
      const btn = document.getElementById(`upgrade${this.capitalize(upgradeType)}Btn`);
      if (btn) {
        btn.addEventListener('click', () => this.upgradeHero(upgradeType));
      }
    }
  },
  
  // Toggle between village and adventure mode
  toggleAdventureMode() {
    const villagePanel = document.querySelector('.game-container');
    const adventurePanel = document.getElementById('adventurePanel');
    
    if (!this.isActive) {
      // Switch to adventure mode
      this.isActive = true;
      villagePanel.style.display = 'none';
      adventurePanel.style.display = 'block';
      
      // Update UI
      this.updateAdventureUI();
      
    } else {
      // Switch to village mode
      this.isActive = false;
      villagePanel.style.display = 'block';
      adventurePanel.style.display = 'none';
      
      // Stop any ongoing combat animations
      if (this.combatAnimationId) {
        cancelAnimationFrame(this.combatAnimationId);
        this.combatAnimationId = null;
      }
    }
    
    // Update toggle button text
    const toggleBtn = document.getElementById('adventureToggleBtn');
    if (toggleBtn) {
      toggleBtn.textContent = this.isActive ? '🏘️ Terug naar Dorp' : '🗡️ Avontuur';
    }
  },
  
  // Start a new adventure
  startAdventure() {
    const hero = GameState.adventure.hero;
    
    // Check if hero is resting
    if (hero.isResting && hero.restTimeLeft > 0) {
      UI.showNotification(`Held rust nog ${Math.ceil(hero.restTimeLeft / 1000)}s`, 'warning');
      return;
    }
    
    // Reset hero HP and adventure stats
    hero.hp = hero.maxHp;
    hero.isResting = false;
    hero.restTimeLeft = 0;
    
    GameState.adventure.currentWave = 1;
    GameState.adventure.enemiesInWave = 0;
    GameState.adventure.goldEarned = 0;
    this.enemiesDefeated = 0;
    this.adventureStartTime = Date.now();
    
    // Generate first enemy
    this.generateNextEnemy();
    
    // Start combat
    this.combatActive = true;
    this.initializeCombatAnimations();
    this.startCombat();
    
    UI.showNotification('🗡️ Avontuur gestart!', 'success');
    this.updateAdventureUI();
  },
  
  // Stop current adventure
  stopAdventure() {
    if (!this.combatActive) return;
    
    this.combatActive = false;
    this.currentEnemy = null;
    
    // Award gold based on enemies defeated
    const goldReward = this.calculateGoldReward();
    if (goldReward > 0) {
      GameUtils.addGold(goldReward);
      UI.showNotification(`+${GameUtils.formatNumber(goldReward)}💰 voor ${this.enemiesDefeated} verslagen vijanden!`, 'success');
    }
    
    // Start rest period
    this.startRestPeriod();
    
    // Stop combat animations
    if (this.combatAnimationId) {
      cancelAnimationFrame(this.combatAnimationId);
      this.combatAnimationId = null;
    }
    
    this.updateAdventureUI();
  },
  
  // Generate next enemy based on current wave
  generateNextEnemy() {
    const wave = GameState.adventure.currentWave;
    const enemyTypes = [
      { name: 'Goblin', sprite: '👹', hp: 30, attack: 8, defense: 2, goldValue: 15 },
      { name: 'Orc', sprite: '👺', hp: 60, attack: 12, defense: 4, goldValue: 35 },
      { name: 'Troll', sprite: '🧌', hp: 120, attack: 18, defense: 8, goldValue: 75 },
      { name: 'Dragon', sprite: '🐲', hp: 200, attack: 25, defense: 12, goldValue: 150 },
      { name: 'Demon Lord', sprite: '👿', hp: 300, attack: 35, defense: 18, goldValue: 300 }
    ];
    
    // Select enemy type based on wave (with some randomness)
    let enemyIndex = Math.min(Math.floor(wave / 5), enemyTypes.length - 1);
    if (Math.random() < 0.3 && enemyIndex > 0) enemyIndex--; // 30% chance for easier enemy
    if (Math.random() < 0.1 && enemyIndex < enemyTypes.length - 1) enemyIndex++; // 10% chance for harder enemy
    
    const baseEnemy = enemyTypes[enemyIndex];
    
    // Scale stats based on wave with diminishing returns
    const scaleMultiplier = 1 + (wave - 1) * 0.12; // Reduced scaling for better balance
    
    this.currentEnemy = {
      name: baseEnemy.name,
      sprite: baseEnemy.sprite,
      hp: Math.floor(baseEnemy.hp * scaleMultiplier),
      maxHp: Math.floor(baseEnemy.hp * scaleMultiplier),
      attack: Math.floor(baseEnemy.attack * scaleMultiplier),
      defense: Math.floor(baseEnemy.defense * scaleMultiplier),
      goldValue: Math.floor(baseEnemy.goldValue * scaleMultiplier)
    };
  },
  
  // Initialize combat animations (idle states)
  initializeCombatAnimations() {
    const heroSprite = document.getElementById('heroSprite');
    const enemySprite = document.getElementById('enemySprite');
    
    if (heroSprite) {
      heroSprite.classList.remove('attack-hero', 'hit', 'death');
    }
    
    if (enemySprite) {
      enemySprite.classList.remove('attack-enemy', 'hit', 'death');
    }
  },
  
  // Start combat between hero and current enemy
  startCombat() {
    if (!this.combatActive || !this.currentEnemy) return;
    
    const hero = GameState.adventure.hero;
    const enemy = this.currentEnemy;
    
    // Start combat animations sequence
    this.playCombatSequence(hero, enemy);
  },
  
  // Play the full combat animation sequence
  playCombatSequence(hero, enemy) {
    // Phase 1: Hero attacks (400ms)
    this.triggerHeroAttack();
    
    setTimeout(() => {
      // Calculate and apply hero damage
      const heroAttack = Math.max(1, hero.attack + this.getUpgradeBonus('attack') - enemy.defense);
      const isCritical = Math.random() < 0.15; // 15% critical chance
      const finalHeroAttack = isCritical ? Math.floor(heroAttack * 1.5) : heroAttack;
      
      enemy.hp -= finalHeroAttack;
      
      // Show impact and damage effects
      this.createImpactEffect('enemy', finalHeroAttack, isCritical);
      this.triggerEnemyHit();
      
      // Check if enemy died
      if (enemy.hp <= 0) {
        this.triggerEnemyDeath();
        setTimeout(() => this.enemyDefeated(), 1000);
        return;
      }
      
      // Phase 2: Enemy attacks (800ms after hero attack)
      setTimeout(() => {
        this.triggerEnemyAttack();
        
        setTimeout(() => {
          // Calculate and apply enemy damage
          const enemyAttack = Math.max(1, enemy.attack - (hero.defense + this.getUpgradeBonus('defense')));
          const enemyIsCritical = Math.random() < 0.1; // 10% critical chance for enemies
          const finalEnemyAttack = enemyIsCritical ? Math.floor(enemyAttack * 1.3) : enemyAttack;
          
          hero.hp -= finalEnemyAttack;
          
          // Show impact and damage effects
          this.createImpactEffect('hero', finalEnemyAttack, enemyIsCritical);
          this.triggerHeroHit();
          
          // Check if hero died
          if (hero.hp <= 0) {
            this.triggerHeroDeath();
            setTimeout(() => this.heroDefeated(), 1000);
            return;
          }
          
          // Update UI and continue combat
          this.updateAdventureUI();
          this.combatAnimationId = setTimeout(() => this.playCombatSequence(hero, enemy), 1000);
          
        }, 400); // Enemy damage application delay
      }, 800); // Delay before enemy attacks
      
    }, 400); // Hero damage application delay
    
    this.updateAdventureUI();
  },
  
  // Handle enemy defeat
  enemyDefeated() {
    const enemy = this.currentEnemy;
    this.enemiesDefeated++;
    GameState.adventure.enemiesInWave++;
    GameState.adventure.goldEarned += enemy.goldValue;
    
    // Add experience to hero
    const expGain = Math.floor(enemy.maxHp / 10);
    this.addExperience(expGain);
    
    // Check if wave is complete
    if (GameState.adventure.enemiesInWave >= GameState.adventure.maxEnemiesInWave) {
      const completedWave = GameState.adventure.currentWave;
      GameState.adventure.currentWave++;
      GameState.adventure.enemiesInWave = 0;
      
      // Wave completion bonus
      const waveBonus = Math.floor(completedWave * 25 * (1 + this.getUpgradeBonus('luck') * 0.1));
      GameState.adventure.goldEarned += waveBonus;
      
      UI.showNotification(`🌊 Wave ${completedWave} voltooid! +${waveBonus}💰 bonus!`, 'success');
    }
    
    // Generate next enemy
    this.generateNextEnemy();
    
    // Reset animations for new enemy
    this.initializeCombatAnimations();
    
    // Small delay before next combat
    this.combatAnimationId = setTimeout(() => this.startCombat(), 2000);
    
    this.updateAdventureUI();
  },
  
  // Handle hero defeat
  heroDefeated() {
    this.combatActive = false;
    this.currentEnemy = null;
    
    // Award gold for defeated enemies
    const goldReward = this.calculateGoldReward();
    if (goldReward > 0) {
      GameUtils.addGold(goldReward);
    }
    
    UI.showNotification(`💀 Held verslagen! ${this.enemiesDefeated} vijanden verslagen. +${GameUtils.formatNumber(goldReward)}💰`, 'warning');
    
    // Start rest period
    this.startRestPeriod();
    this.updateAdventureUI();
  },
  
  // Start hero rest period
  startRestPeriod() {
    const hero = GameState.adventure.hero;
    hero.isResting = true;
    
    // Calculate rest time (base time reduced by recovery upgrades)
    const recoveryReduction = this.getUpgradeBonus('recovery') * 3000; // 3s per level
    hero.restTimeLeft = Math.max(3000, hero.restDuration - recoveryReduction);
    
    // Reset HP to full after rest
    hero.hp = hero.maxHp;
  },
  
  // Add experience to hero and handle level ups
  addExperience(amount) {
    const hero = GameState.adventure.hero;
    hero.experience += amount;
    
    // Check for level up
    while (hero.experience >= hero.experienceToNext) {
      hero.experience -= hero.experienceToNext;
      hero.level++;
      
      // Increase stats on level up with scaling
      const hpGain = 15 + Math.floor(hero.level * 2);
      const attackGain = 1 + Math.floor(hero.level * 0.3);
      const defenseGain = Math.floor(hero.level * 0.2);
      
      hero.maxHp += hpGain;
      hero.hp = hero.maxHp;
      hero.attack += attackGain;
      hero.defense += defenseGain;
      hero.experienceToNext = Math.floor(hero.experienceToNext * 1.25);
      
      UI.showNotification(`⬆️ Level Up! Level ${hero.level} (+${hpGain}HP, +${attackGain}ATK, +${defenseGain}DEF)`, 'success');
    }
  },
  
  // Calculate gold reward based on enemies defeated
  calculateGoldReward() {
    const baseReward = GameState.adventure.goldEarned;
    const luckBonus = 1 + (this.getUpgradeBonus('luck') * 0.25); // 25% per luck level
    
    // Dynamic scaling based on main game progression
    const playerGPS = GameUtils.calculateGPS();
    const timeMultiplier = this.calculateTimeMultiplier();
    
    // If player has high GPS, adventure rewards should be competitive
    const gpsScaling = Math.max(1, Math.log10(playerGPS + 1) * 0.5);
    
    const finalReward = Math.floor(baseReward * luckBonus * gpsScaling * timeMultiplier);
    return Math.max(finalReward, baseReward); // Never less than base reward
  },
  
  // Calculate time-based multiplier for adventure balance
  calculateTimeMultiplier() {
    // Adventure should be competitive with idle income over time
    const averageCombatTime = 3; // seconds per enemy
    const averageKillsPerRun = this.enemiesDefeated || 5;
    const totalAdventureTime = averageKillsPerRun * averageCombatTime;
    
    // Multiplier to make adventure time-competitive with idle GPS
    return Math.max(1, totalAdventureTime / 10);
  },
  
  // Get upgrade bonus for specific stat
  getUpgradeBonus(upgradeType) {
    return GameState.adventure.upgrades[upgradeType].level;
  },
  
  // Upgrade hero stat
  upgradeHero(upgradeType) {
    const upgrade = GameState.adventure.upgrades[upgradeType];
    const cost = this.calculateUpgradeCost(upgradeType);
    
    if (GameUtils.canAfford(cost)) {
      GameUtils.spendGold(cost);
      upgrade.level++;
      
      // Apply upgrade effects
      this.applyUpgradeEffect(upgradeType);
      
      UI.showNotification(`⚔️ ${this.capitalize(upgradeType)} upgrade gekocht!`, 'success');
      this.updateAdventureUI();
    } else {
      UI.showNotification('Niet genoeg goud!', 'error');
    }
  },
  
  // Calculate upgrade cost with scaling
  calculateUpgradeCost(upgradeType) {
    const upgrade = GameState.adventure.upgrades[upgradeType];
    const baseCost = upgrade.cost;
    // More aggressive scaling similar to generator costs
    return Math.floor(baseCost * Math.pow(1.75, upgrade.level));
  },
  
  // Apply upgrade effect immediately
  applyUpgradeEffect(upgradeType) {
    const hero = GameState.adventure.hero;
    
    switch (upgradeType) {
      case 'attack':
        // Attack bonus applied in combat calculation
        break;
      case 'defense':
        // Defense bonus applied in combat calculation
        break;
      case 'health':
        hero.maxHp += 25;
        hero.hp = Math.min(hero.hp + 25, hero.maxHp); // Heal 25 HP too
        break;
      case 'recovery':
        // Rest time reduction applied in startRestPeriod()
        break;
      case 'luck':
        // Gold bonus applied in calculateGoldReward()
        break;
    }
  },
  
  // Trigger hero attack animation
  triggerHeroAttack() {
    const heroSprite = document.getElementById('heroSprite');
    if (heroSprite) {
      heroSprite.classList.add('attack-hero');
      setTimeout(() => {
        heroSprite.classList.remove('attack-hero');
      }, 400);
    }
  },
  
  // Trigger enemy attack animation  
  triggerEnemyAttack() {
    const enemySprite = document.getElementById('enemySprite');
    if (enemySprite) {
      enemySprite.classList.add('attack-enemy');
      setTimeout(() => {
        enemySprite.classList.remove('attack-enemy');
      }, 400);
    }
  },
  
  // Trigger hero hit animation
  triggerHeroHit() {
    const heroSprite = document.getElementById('heroSprite');
    if (heroSprite) {
      heroSprite.classList.add('hit');
      setTimeout(() => {
        heroSprite.classList.remove('hit');
      }, 300);
    }
  },
  
  // Trigger enemy hit animation
  triggerEnemyHit() {
    const enemySprite = document.getElementById('enemySprite');
    if (enemySprite) {
      enemySprite.classList.add('hit');
      setTimeout(() => {
        enemySprite.classList.remove('hit');
      }, 300);
    }
  },
  
  // Trigger hero death animation
  triggerHeroDeath() {
    const heroSprite = document.getElementById('heroSprite');
    if (heroSprite) {
      heroSprite.classList.remove('hit', 'attack-hero');
      heroSprite.classList.add('death');
    }
  },
  
  // Trigger enemy death animation
  triggerEnemyDeath() {
    const enemySprite = document.getElementById('enemySprite');
    if (enemySprite) {
      enemySprite.classList.remove('hit', 'attack-enemy');
      enemySprite.classList.add('death');
    }
  },
  
  
  // Create impact effect at target location
  createImpactEffect(target, damage, isCritical) {
    const targetSprite = target === 'hero' ? document.getElementById('heroSprite') : document.getElementById('enemySprite');
    if (!targetSprite) return;
    
    const rect = targetSprite.getBoundingClientRect();
    const combatArea = document.querySelector('.combat-area-compact');
    if (!combatArea) return;
    
    const combatRect = combatArea.getBoundingClientRect();
    
    // Create impact effect
    const impactDiv = document.createElement('div');
    impactDiv.className = `impact-effect ${target}-impact`;
    impactDiv.style.left = `${rect.left - combatRect.left + rect.width/2 - 30}px`;
    impactDiv.style.top = `${rect.top - combatRect.top + rect.height/2 - 30}px`;
    
    combatArea.appendChild(impactDiv);
    setTimeout(() => impactDiv.remove(), 600);
    
    // Create damage number
    const damageDiv = document.createElement('div');
    damageDiv.className = `combat-effect ${target}-damage${isCritical ? ' critical' : ''}`;
    damageDiv.textContent = `${damage}${isCritical ? '!' : ''}`;
    damageDiv.style.left = `${rect.left - combatRect.left + rect.width/2}px`;
    damageDiv.style.top = `${rect.top - combatRect.top + rect.height/2}px`;
    
    combatArea.appendChild(damageDiv);
    setTimeout(() => damageDiv.remove(), isCritical ? 1500 : 1200);
    
    // Create spark particles for critical hits
    if (isCritical) {
      this.createSparkParticles(rect.left - combatRect.left + rect.width/2, rect.top - combatRect.top + rect.height/2);
    }
  },
  
  // Create spark particle effects
  createSparkParticles(centerX, centerY) {
    const combatArea = document.getElementById('combatArea');
    if (!combatArea) return;
    
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('div');
      spark.className = 'particle-effect spark';
      
      const randomX = (Math.random() - 0.5) * 60;
      const randomY = (Math.random() - 0.5) * 60;
      
      spark.style.left = `${centerX}px`;
      spark.style.top = `${centerY}px`;
      spark.style.setProperty('--random-x', `${randomX}px`);
      spark.style.setProperty('--random-y', `${randomY}px`);
      
      combatArea.appendChild(spark);
      setTimeout(() => spark.remove(), 800);
    }
  },
  
  // Update adventure UI
  updateAdventureUI() {
    const hero = GameState.adventure.hero;
    
    // Update hero stats
    const heroLevelEl = document.getElementById('heroLevel');
    const heroHpEl = document.getElementById('heroHp');
    const heroMaxHpEl = document.getElementById('heroMaxHp');
    const heroAttackEl = document.getElementById('heroAttack');
    const heroDefenseEl = document.getElementById('heroDefense');
    const heroExpEl = document.getElementById('heroExp');
    const heroExpNextEl = document.getElementById('heroExpNext');
    
    if (heroLevelEl) heroLevelEl.textContent = hero.level;
    if (heroHpEl) heroHpEl.textContent = hero.hp;
    if (heroMaxHpEl) heroMaxHpEl.textContent = hero.maxHp;
    if (heroAttackEl) heroAttackEl.textContent = hero.attack + this.getUpgradeBonus('attack');
    if (heroDefenseEl) heroDefenseEl.textContent = hero.defense + this.getUpgradeBonus('defense');
    if (heroExpEl) heroExpEl.textContent = hero.experience;
    if (heroExpNextEl) heroExpNextEl.textContent = hero.experienceToNext;
    
    // Update HP bar
    const hpBar = document.getElementById('heroHpBar');
    if (hpBar) {
      const hpPercentage = (hero.hp / hero.maxHp) * 100;
      hpBar.style.width = `${hpPercentage}%`;
    }
    
    // Update experience bar
    const expBar = document.getElementById('heroExpBar');
    if (expBar) {
      const expPercentage = (hero.experience / hero.experienceToNext) * 100;
      expBar.style.width = `${expPercentage}%`;
    }
    
    // Update adventure stats
    const currentWaveEl = document.getElementById('currentWave');
    const enemiesDefeatedEl = document.getElementById('enemiesDefeated');
    const goldEarnedEl = document.getElementById('goldEarned');
    
    if (currentWaveEl) currentWaveEl.textContent = GameState.adventure.currentWave;
    if (enemiesDefeatedEl) enemiesDefeatedEl.textContent = this.enemiesDefeated;
    if (goldEarnedEl) goldEarnedEl.textContent = GameUtils.formatNumber(GameState.adventure.goldEarned);
    
    // Update enemy info
    if (this.currentEnemy) {
      const enemyNameEl = document.getElementById('enemyName');
      const enemySpriteEl = document.getElementById('enemySprite');
      const enemyHpEl = document.getElementById('enemyHp');
      const enemyMaxHpEl = document.getElementById('enemyMaxHp');
      
      if (enemyNameEl) enemyNameEl.textContent = this.currentEnemy.name;
      if (enemySpriteEl) enemySpriteEl.textContent = this.currentEnemy.sprite;
      if (enemyHpEl) enemyHpEl.textContent = this.currentEnemy.hp;
      if (enemyMaxHpEl) enemyMaxHpEl.textContent = this.currentEnemy.maxHp;
      
      const enemyHpBar = document.getElementById('enemyHpBar');
      if (enemyHpBar) {
        const hpPercentage = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
        enemyHpBar.style.width = `${hpPercentage}%`;
      }
    }
    
    // Update rest status
    if (hero.isResting && hero.restTimeLeft > 0) {
      document.getElementById('restStatus').style.display = 'block';
      document.getElementById('restTimeLeft').textContent = Math.ceil(hero.restTimeLeft / 1000);
    } else {
      document.getElementById('restStatus').style.display = 'none';
    }
    
    // Update upgrade costs
    for (const upgradeType of Object.keys(GameState.adventure.upgrades)) {
      const cost = this.calculateUpgradeCost(upgradeType);
      const costElement = document.getElementById(`${upgradeType}Cost`);
      const levelElement = document.getElementById(`${upgradeType}Level`);
      
      if (costElement) costElement.textContent = GameUtils.formatNumber(cost);
      if (levelElement) levelElement.textContent = GameState.adventure.upgrades[upgradeType].level;
    }
    
    // Update button states
    const startBtn = document.getElementById('startAdventureBtn');
    const stopBtn = document.getElementById('stopAdventureBtn');
    
    if (startBtn && stopBtn) {
      startBtn.disabled = this.combatActive || (hero.isResting && hero.restTimeLeft > 0);
      stopBtn.disabled = !this.combatActive;
    }
  },
  
  // Process timers (called from main game tick)
  processTick() {
    if (!GameState.adventure) return;
    
    const hero = GameState.adventure.hero;
    
    // Process rest timer
    if (hero.isResting && hero.restTimeLeft > 0) {
      hero.restTimeLeft = Math.max(0, hero.restTimeLeft - 1000);
    }
    
    // Update UI if adventure is active
    if (this.isActive) {
      this.updateAdventureUI();
      
      // Ensure idle animations are active when not in combat
      if (!this.combatActive) {
        this.initializeCombatAnimations();
      }
    }
  },
  
  // Utility function to capitalize strings
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  // Get adventure statistics
  getStats() {
    if (!GameState.adventure) return {};
    
    return {
      hero: GameState.adventure.hero,
      currentWave: GameState.adventure.currentWave,
      enemiesDefeated: this.enemiesDefeated,
      isActive: this.isActive,
      combatActive: this.combatActive
    };
  },
  
  // Reset adventure system
  reset() {
    this.isActive = false;
    this.combatActive = false;
    this.currentEnemy = null;
    this.enemiesDefeated = 0;
    this.adventureStartTime = 0;
    
    if (this.combatAnimationId) {
      cancelAnimationFrame(this.combatAnimationId);
      this.combatAnimationId = null;
    }
    
    // Reset adventure state
    delete GameState.adventure;
    this.setupAdventureState();
  },
  
  // Debug function to analyze balance (dev only)
  analyzeBalance() {
    const playerGPS = GameUtils.calculateGPS();
    const heroLevel = GameState.adventure?.hero?.level || 1;
    const currentWave = GameState.adventure?.currentWave || 1;
    
    console.log('🎮 Adventure Balance Analysis:');
    console.log(`Player GPS: ${playerGPS.toFixed(2)}/sec`);
    console.log(`Hero Level: ${heroLevel}`);
    console.log(`Current Wave: ${currentWave}`);
    
    // Simulate reward calculation
    const simulatedEnemies = 5;
    const simulatedGoldEarned = simulatedEnemies * 15 * (1 + (currentWave - 1) * 0.12);
    const simulatedReward = Math.floor(simulatedGoldEarned * (1 + Math.log10(playerGPS + 1) * 0.5));
    
    console.log(`Estimated reward for 5 enemies: ${simulatedReward} gold`);
    console.log(`Time equivalent: ${(simulatedReward / Math.max(playerGPS, 1)).toFixed(1)} seconds of idle income`);
    console.log(`Adventure efficiency: ${((simulatedReward / 15) / Math.max(playerGPS, 1) * 100).toFixed(1)}% of idle income per second`);
    
    return {
      playerGPS,
      heroLevel,
      currentWave,
      simulatedReward,
      timeEquivalent: simulatedReward / Math.max(playerGPS, 1),
      efficiency: (simulatedReward / 15) / Math.max(playerGPS, 1)
    };
  }
};

// Export for other modules
window.Adventure = Adventure;