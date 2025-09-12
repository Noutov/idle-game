/**
 * University Research System
 * Manages research upgrades that provide permanent bonuses
 */

const University = {
  // Research upgrade configurations
  researches: {
    // General upgrades (available to all)
    'efficiency_basics': {
      name: 'Efficiency Basics',
      category: 'general',
      description: 'Alle generators 10% goedkoper',
      icon: '📚',
      baseCost: 5000,
      baseDuration: 300, // 5 minutes
      unlockCondition: { type: 'total_generators', value: 50 },
      effect: { type: 'cost_reduction', target: 'all', value: 0.1 }
    },
    'mass_production': {
      name: 'Mass Production',
      category: 'general',
      description: 'Alle generators 15% sneller',
      icon: '⚙️',
      baseCost: 10000,
      baseDuration: 600, // 10 minutes
      unlockCondition: { type: 'total_generators', value: 100 },
      effect: { type: 'speed_bonus', target: 'all', value: 0.15 },
      prerequisites: ['efficiency_basics']
    },
    'wealth_accumulation': {
      name: 'Wealth Accumulation',
      category: 'general',
      description: 'Alle generators 20% meer goud',
      icon: '💰',
      baseCost: 25000,
      baseDuration: 900, // 15 minutes
      unlockCondition: { type: 'total_generators', value: 200 },
      effect: { type: 'gold_bonus', target: 'all', value: 0.2 },
      prerequisites: ['mass_production']
    },
    'advanced_economics': {
      name: 'Advanced Economics',
      category: 'general',
      description: 'Alle generators 25% goedkoper',
      icon: '📈',
      baseCost: 50000,
      baseDuration: 1200, // 20 minutes
      unlockCondition: { type: 'total_generators', value: 500 },
      effect: { type: 'cost_reduction', target: 'all', value: 0.25 },
      prerequisites: ['wealth_accumulation']
    },

    // Villager specific upgrades
    'farming_techniques': {
      name: 'Farming Techniques',
      category: 'villager',
      description: 'Dorpelingen 25% goedkoper',
      icon: '🌾',
      baseCost: 2000,
      baseDuration: 180, // 3 minutes
      unlockCondition: { type: 'generator_count', generator: 'villager', value: 10 },
      effect: { type: 'cost_reduction', target: 'villager', value: 0.25 }
    },
    'agricultural_revolution': {
      name: 'Agricultural Revolution',
      category: 'villager',
      description: 'Dorpelingen 50% meer goud',
      icon: '🚜',
      baseCost: 5000,
      baseDuration: 360, // 6 minutes
      unlockCondition: { type: 'generator_count', generator: 'villager', value: 25 },
      effect: { type: 'gold_bonus', target: 'villager', value: 0.5 },
      prerequisites: ['farming_techniques']
    },
    'village_automation': {
      name: 'Village Automation',
      category: 'villager',
      description: 'Dorpelingen 40% sneller',
      icon: '🤖',
      baseCost: 12000,
      baseDuration: 540, // 9 minutes
      unlockCondition: { type: 'generator_count', generator: 'villager', value: 50 },
      effect: { type: 'speed_bonus', target: 'villager', value: 0.4 },
      prerequisites: ['agricultural_revolution']
    },

    // Trader specific upgrades
    'trade_routes': {
      name: 'Trade Routes',
      category: 'trader',
      description: 'Handelsui 25% goedkoper',
      icon: '🛣️',
      baseCost: 8000,
      baseDuration: 240, // 4 minutes
      unlockCondition: { type: 'generator_count', generator: 'trader', value: 10 },
      effect: { type: 'cost_reduction', target: 'trader', value: 0.25 }
    },
    'merchant_guilds': {
      name: 'Merchant Guilds',
      category: 'trader',
      description: 'Handelsui 50% meer goud',
      icon: '🏪',
      baseCost: 15000,
      baseDuration: 480, // 8 minutes
      unlockCondition: { type: 'generator_count', generator: 'trader', value: 25 },
      effect: { type: 'gold_bonus', target: 'trader', value: 0.5 },
      prerequisites: ['trade_routes']
    },
    'global_commerce': {
      name: 'Global Commerce',
      category: 'trader',
      description: 'Handelsui 35% sneller',
      icon: '🌍',
      baseCost: 30000,
      baseDuration: 720, // 12 minutes
      unlockCondition: { type: 'generator_count', generator: 'trader', value: 50 },
      effect: { type: 'speed_bonus', target: 'trader', value: 0.35 },
      prerequisites: ['merchant_guilds']
    },

    // Warrior specific upgrades
    'military_tactics': {
      name: 'Military Tactics',
      category: 'warrior',
      description: 'Krijgers 25% goedkoper',
      icon: '⚔️',
      baseCost: 15000,
      baseDuration: 300, // 5 minutes
      unlockCondition: { type: 'generator_count', generator: 'warrior', value: 10 },
      effect: { type: 'cost_reduction', target: 'warrior', value: 0.25 }
    },
    'warrior_discipline': {
      name: 'Warrior Discipline',
      category: 'warrior',
      description: 'Krijgers 50% meer goud',
      icon: '🛡️',
      baseCost: 35000,
      baseDuration: 600, // 10 minutes
      unlockCondition: { type: 'generator_count', generator: 'warrior', value: 25 },
      effect: { type: 'gold_bonus', target: 'warrior', value: 0.5 },
      prerequisites: ['military_tactics']
    },
    'elite_training': {
      name: 'Elite Training',
      category: 'warrior',
      description: 'Krijgers 35% sneller',
      icon: '🥇',
      baseCost: 75000,
      baseDuration: 900, // 15 minutes
      unlockCondition: { type: 'generator_count', generator: 'warrior', value: 50 },
      effect: { type: 'speed_bonus', target: 'warrior', value: 0.35 },
      prerequisites: ['warrior_discipline']
    },

    // Seer specific upgrades
    'mystical_knowledge': {
      name: 'Mystical Knowledge',
      category: 'seer',
      description: 'Zieners 25% goedkoper',
      icon: '🔮',
      baseCost: 40000,
      baseDuration: 360, // 6 minutes
      unlockCondition: { type: 'generator_count', generator: 'seer', value: 10 },
      effect: { type: 'cost_reduction', target: 'seer', value: 0.25 }
    },
    'arcane_mastery': {
      name: 'Arcane Mastery',
      category: 'seer',
      description: 'Zieners 50% meer goud',
      icon: '✨',
      baseCost: 100000,
      baseDuration: 720, // 12 minutes
      unlockCondition: { type: 'generator_count', generator: 'seer', value: 25 },
      effect: { type: 'gold_bonus', target: 'seer', value: 0.5 },
      prerequisites: ['mystical_knowledge']
    },
    'time_manipulation': {
      name: 'Time Manipulation',
      category: 'seer',
      description: 'Zieners 40% sneller',
      icon: '⏰',
      baseCost: 250000,
      baseDuration: 1080, // 18 minutes
      unlockCondition: { type: 'generator_count', generator: 'seer', value: 50 },
      effect: { type: 'speed_bonus', target: 'seer', value: 0.4 },
      prerequisites: ['arcane_mastery']
    },

    // Elite specific upgrades
    'legendary_weapons': {
      name: 'Legendary Weapons',
      category: 'elite',
      description: 'Elite Krijgers 25% goedkoper',
      icon: '⚡',
      baseCost: 100000,
      baseDuration: 480, // 8 minutes
      unlockCondition: { type: 'generator_count', generator: 'elite', value: 10 },
      effect: { type: 'cost_reduction', target: 'elite', value: 0.25 }
    },
    'heroic_presence': {
      name: 'Heroic Presence',
      category: 'elite',
      description: 'Elite Krijgers 50% meer goud',
      icon: '👑',
      baseCost: 250000,
      baseDuration: 960, // 16 minutes
      unlockCondition: { type: 'generator_count', generator: 'elite', value: 25 },
      effect: { type: 'gold_bonus', target: 'elite', value: 0.5 },
      prerequisites: ['legendary_weapons']
    },
    'divine_power': {
      name: 'Divine Power',
      category: 'elite',
      description: 'Elite Krijgers 40% sneller',
      icon: '🌟',
      baseCost: 500000,
      baseDuration: 1440, // 24 minutes
      unlockCondition: { type: 'generator_count', generator: 'elite', value: 50 },
      effect: { type: 'speed_bonus', target: 'elite', value: 0.4 },
      prerequisites: ['heroic_presence']
    }
  },

  // Initialize university system
  init() {
    this.setupEventListeners();
    this.checkUnlocks();
  },

  // Setup event listeners
  setupEventListeners() {
    const upgradeUniversityBtn = document.getElementById('upgradeUniversityBtn');
    if (upgradeUniversityBtn) {
      upgradeUniversityBtn.addEventListener('click', () => this.upgradeUniversity());
    }

    const speedUpResearchBtn = document.getElementById('speedUpResearchBtn');
    if (speedUpResearchBtn) {
      speedUpResearchBtn.addEventListener('click', () => this.speedUpResearch());
    }

    // Research toggle button
    const toggleResearchBtn = document.getElementById('toggleResearchBtn');
    const researchCategories = document.getElementById('researchCategories');
    if (toggleResearchBtn && researchCategories) {
      toggleResearchBtn.addEventListener('click', () => {
        const isVisible = researchCategories.style.display !== 'none';
        researchCategories.style.display = isVisible ? 'none' : 'block';
        toggleResearchBtn.textContent = isVisible ? '📋 Toon Onderzoek' : '📋 Verberg Onderzoek';
      });
    }

    // Listen to generator changes to check for new unlocks
    GameEvents.on('generatorsChanged', () => {
      this.checkUnlocks();
    });

    GameEvents.on('goldChanged', () => {
      this.updateUI();
    });
  },

  // Check if university can be built/upgraded
  canUpgradeUniversity() {
    if (GameState.university.level === 0) {
      // First university requires 100,000 gold
      return GameUtils.canAfford(100000);
    }
    // Further upgrades possible but for now just level 1
    return false;
  },

  // Upgrade university building
  upgradeUniversity() {
    if (!this.canUpgradeUniversity()) {
      UI.showNotification('Kan universiteit niet upgraden!', 'error');
      return false;
    }

    if (GameUtils.spendGold(100000)) {
      GameState.university.level++;
      
      if (GameState.university.level === 1) {
        UI.showNotification('🎓 Universiteit gebouwd! Research nu beschikbaar!', 'success');
      }
      
      this.checkUnlocks();
      this.updateUI();
      GameEvents.emit('universityChanged');
      return true;
    }
    return false;
  },

  // Start research
  startResearch(researchId) {
    if (GameState.university.research.active) {
      UI.showNotification('Al bezig met onderzoek!', 'warning');
      return false;
    }

    const research = this.researches[researchId];
    if (!research) return false;

    if (GameState.university.completed.includes(researchId)) {
      UI.showNotification('Onderzoek al voltooid!', 'warning');
      return false;
    }

    if (!this.isUnlocked(researchId)) {
      UI.showNotification('Onderzoek nog niet ontgrendeld!', 'error');
      return false;
    }

    const cost = this.getResearchCost(researchId);
    if (!GameUtils.canAfford(cost)) {
      UI.showNotification('Niet genoeg goud voor onderzoek!', 'error');
      return false;
    }

    if (GameUtils.spendGold(cost)) {
      GameState.university.research.active = researchId;
      GameState.university.research.startTime = Date.now();
      GameState.university.research.duration = research.baseDuration * 1000; // Convert to ms
      GameState.university.research.baseCost = cost;
      GameState.university.totalSpent += cost;

      UI.showNotification(`🔬 Onderzoek gestart: ${research.name}!`, 'success');
      this.updateUI();
      return true;
    }
    return false;
  },

  // Speed up current research
  speedUpResearch() {
    if (!GameState.university.research.active) return false;

    const research = this.researches[GameState.university.research.active];
    const timeLeft = this.getResearchTimeLeft();
    
    if (timeLeft <= 0) {
      this.completeResearch();
      return true;
    }

    // More expensive cost: 5 gold per second remaining
    const fullSpeedUpCost = Math.ceil(timeLeft / 1000) * 5;
    const currentGold = GameState.gold;
    
    if (currentGold < 10) {
      UI.showNotification('Je hebt minimaal 10 goud nodig om te versnellen!', 'error');
      return false;
    }

    // Allow partial payment - use all available gold (minimum 10)
    const actualCost = Math.min(fullSpeedUpCost, currentGold);
    
    // Calculate how much time to reduce based on payment (1 second per 5 gold)
    const timeReduction = Math.floor(actualCost / 5) * 1000; // Convert to milliseconds
    
    if (GameUtils.spendGold(actualCost)) {
      // Reduce the research time by moving the start time forward
      GameState.university.research.startTime += timeReduction;
      GameState.university.totalSpent += actualCost;
      
      const secondsReduced = Math.floor(timeReduction / 1000);
      const remainingAfter = Math.floor(this.getResearchTimeLeft() / 1000);
      
      if (remainingAfter <= 0) {
        UI.showNotification(`⚡ Onderzoek voltooid door versnelling!`, 'success');
        this.completeResearch();
      } else {
        UI.showNotification(`⚡ Onderzoek versneld met ${secondsReduced}s! Nog ${remainingAfter}s over.`, 'success');
      }
      
      return true;
    }
    return false;
  },

  // Complete current research
  completeResearch() {
    if (!GameState.university.research.active) return false;

    const researchId = GameState.university.research.active;
    const research = this.researches[researchId];

    GameState.university.completed.push(researchId);
    GameState.university.totalCompleted++;
    
    // Reset research state
    GameState.university.research.active = null;
    GameState.university.research.startTime = 0;
    GameState.university.research.duration = 0;
    GameState.university.research.baseCost = 0;

    UI.showNotification(`✅ Onderzoek voltooid: ${research.name}!`, 'success');
    
    // Check for new unlocks
    this.checkUnlocks();
    this.updateUI();
    GameEvents.emit('researchCompleted', researchId);
    return true;
  },

  // Check research progress and auto-complete
  updateResearch() {
    if (!GameState.university.research.active) return;

    const timeLeft = this.getResearchTimeLeft();
    if (timeLeft <= 0) {
      this.completeResearch();
    }
  },

  // Get time left for current research
  getResearchTimeLeft() {
    if (!GameState.university.research.active) return 0;
    
    const elapsed = Date.now() - GameState.university.research.startTime;
    return Math.max(0, GameState.university.research.duration - elapsed);
  },

  // Get research progress percentage
  getResearchProgress() {
    if (!GameState.university.research.active) return 0;
    
    const elapsed = Date.now() - GameState.university.research.startTime;
    return Math.min(100, (elapsed / GameState.university.research.duration) * 100);
  },

  // Get research cost (base cost)
  getResearchCost(researchId) {
    const research = this.researches[researchId];
    return research.baseCost;
  },

  // Check if research is unlocked
  isUnlocked(researchId) {
    const research = this.researches[researchId];
    if (!research) return false;

    // Check university level requirement
    if (GameState.university.level === 0) return false;

    // Check prerequisites
    if (research.prerequisites) {
      for (const prereq of research.prerequisites) {
        if (!GameState.university.completed.includes(prereq)) {
          return false;
        }
      }
    }

    // Check unlock condition
    const condition = research.unlockCondition;
    switch (condition.type) {
      case 'total_generators':
        return this.getTotalGeneratorCount() >= condition.value;
      case 'generator_count':
        return GameState.generators[condition.generator].count >= condition.value;
      default:
        return false;
    }
  },

  // Check for new unlocks and add to discovered list
  checkUnlocks() {
    for (const [researchId, research] of Object.entries(this.researches)) {
      if (!GameState.university.discovered.includes(researchId) && 
          !GameState.university.completed.includes(researchId) &&
          this.isUnlocked(researchId)) {
        GameState.university.discovered.push(researchId);
        UI.showNotification(`🔬 Nieuw onderzoek ontdekt: ${research.name}!`, 'info', 5000);
      }
    }
  },

  // Get total generator count
  getTotalGeneratorCount() {
    return Object.values(GameState.generators).reduce((total, gen) => total + gen.count, 0);
  },

  // Get research bonus for specific effect
  getResearchBonus(effectType, target) {
    let bonus = 0;
    
    for (const researchId of GameState.university.completed) {
      const research = this.researches[researchId];
      if (research && research.effect.type === effectType &&
          (research.effect.target === target || research.effect.target === 'all')) {
        bonus += research.effect.value;
      }
    }
    
    return bonus;
  },

  // Get cost reduction multiplier for generator
  getCostReduction(generatorType) {
    const reduction = this.getResearchBonus('cost_reduction', generatorType);
    return 1 - Math.min(reduction, 0.75); // Max 75% reduction
  },

  // Get speed bonus multiplier for generator
  getSpeedBonus(generatorType) {
    return 1 + this.getResearchBonus('speed_bonus', generatorType);
  },

  // Get gold bonus multiplier for generator
  getGoldBonus(generatorType) {
    return 1 + this.getResearchBonus('gold_bonus', generatorType);
  },

  // Get research categories for UI
  getResearchCategories() {
    const categories = {
      general: { name: 'Algemeen', icon: '📚', researches: [] },
      villager: { name: 'Dorpelingen', icon: '👨‍🌾', researches: [] },
      trader: { name: 'Handelsui', icon: '🏺', researches: [] },
      warrior: { name: 'Krijgers', icon: '🛡️', researches: [] },
      seer: { name: 'Zieners', icon: '🔮', researches: [] },
      elite: { name: 'Elite Krijgers', icon: '⚔️', researches: [] }
    };

    for (const [researchId, research] of Object.entries(this.researches)) {
      if (categories[research.category]) {
        categories[research.category].researches.push({
          id: researchId,
          ...research,
          unlocked: this.isUnlocked(researchId),
          completed: GameState.university.completed.includes(researchId),
          cost: this.getResearchCost(researchId)
        });
      }
    }

    return categories;
  },

  // Update UI displays
  updateUI() {
    this.updateUniversityBuilding();
    this.updateCurrentResearch();
    this.updateAvailableResearch();
    this.updateResearchStats();
  },

  // Update university building display
  updateUniversityBuilding() {
    const universityName = document.getElementById('universityName');
    const universityDescription = document.getElementById('universityDescription');
    const upgradeUniversityBtn = document.getElementById('upgradeUniversityBtn');
    const universityCost = document.getElementById('universityCost');
    const universitySection = document.getElementById('universitySection');
    const universitySeparator = document.getElementById('universitySeparator');

    // University is now always visible in the main panel - no need to show/hide

    if (GameState.university.level === 0) {
      if (universityName) {
        universityName.textContent = 'Geen universiteit';
      }
      if (universityDescription) {
        universityDescription.textContent = 'Bouw een universiteit om onderzoek te starten (kost 100.000 goud)';
      }
      if (upgradeUniversityBtn) {
        if (this.canUpgradeUniversity()) {
          upgradeUniversityBtn.style.display = 'block';
          upgradeUniversityBtn.disabled = false;
          if (universityCost) {
            universityCost.textContent = GameUtils.formatNumber(100000);
          }
        } else {
          upgradeUniversityBtn.style.display = 'block';
          upgradeUniversityBtn.disabled = true;
        }
      }
    } else {
      if (universityName) {
        universityName.textContent = 'Universiteit';
      }
      if (universityDescription) {
        universityDescription.textContent = 'Universiteit actief! Onderzoek nieuwe technologieën om je generators te verbeteren.';
      }
      if (upgradeUniversityBtn) {
        upgradeUniversityBtn.style.display = 'none';
      }
    }

    // Show/hide research sections based on university level
    const currentResearch = document.getElementById('currentResearch');

    if (GameState.university.level > 0) {
      if (currentResearch) currentResearch.style.display = 'block';
    } else {
      if (currentResearch) currentResearch.style.display = 'none';
    }
  },

  // Update current research display
  updateCurrentResearch() {
    const activeResearchIcon = document.getElementById('activeResearchIcon');
    const activeResearchName = document.getElementById('activeResearchName');
    const activeResearchDescription = document.getElementById('activeResearchDescription');
    const researchProgressBar = document.getElementById('researchProgressBar');
    const researchTimeLeft = document.getElementById('researchTimeLeft');
    const researchTotalTime = document.getElementById('researchTotalTime');
    const speedUpResearchBtn = document.getElementById('speedUpResearchBtn');
    const speedUpCost = document.getElementById('speedUpCost');

    if (GameState.university.research.active) {
      const research = this.researches[GameState.university.research.active];
      const progress = this.getResearchProgress();
      const timeLeft = this.getResearchTimeLeft();

      if (activeResearchIcon) activeResearchIcon.textContent = research.icon;
      if (activeResearchName) activeResearchName.textContent = research.name;
      if (activeResearchDescription) activeResearchDescription.textContent = research.description;
      
      if (researchProgressBar) {
        researchProgressBar.style.width = `${progress}%`;
      }

      if (researchTimeLeft) {
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        researchTimeLeft.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }

      if (researchTotalTime) {
        const totalMinutes = Math.floor(GameState.university.research.duration / 60000);
        const totalSeconds = Math.floor((GameState.university.research.duration % 60000) / 1000);
        researchTotalTime.textContent = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
      }

      if (speedUpResearchBtn && speedUpCost) {
        const fullSpeedCost = Math.ceil(timeLeft / 1000) * 5;
        const currentGold = GameState.gold;
        const actualCost = Math.min(fullSpeedCost, Math.max(10, currentGold));
        const timeReduction = Math.floor(actualCost / 5);
        
        if (fullSpeedCost <= actualCost) {
          speedUpCost.textContent = `${GameUtils.formatNumber(actualCost)} (Voltooi)`;
        } else {
          speedUpCost.textContent = `${GameUtils.formatNumber(actualCost)} (-${timeReduction}s)`;
        }
        
        speedUpResearchBtn.disabled = currentGold < 10 || timeLeft <= 0;
      }
    } else {
      if (activeResearchIcon) activeResearchIcon.textContent = '🔬';
      if (activeResearchName) activeResearchName.textContent = 'Geen actief onderzoek';
      if (activeResearchDescription) activeResearchDescription.textContent = 'Selecteer een onderzoek om te starten';
      if (researchProgressBar) researchProgressBar.style.width = '0%';
      if (researchTimeLeft) researchTimeLeft.textContent = '00:00';
      if (researchTotalTime) researchTotalTime.textContent = '00:00';
      if (speedUpResearchBtn) speedUpResearchBtn.disabled = true;
    }
  },

  // Update available research display
  updateAvailableResearch() {
    const categories = this.getResearchCategories();

    for (const [categoryId, categoryData] of Object.entries(categories)) {
      const gridElement = document.getElementById(`${categoryId}Research`);
      if (!gridElement || categoryData.researches.length === 0) continue;

      gridElement.innerHTML = '';

      // Only show researches that are discovered or completed
      const visibleResearches = categoryData.researches.filter(research => 
        research.completed || 
        GameState.university.discovered.includes(research.id) ||
        research.unlocked
      );

      for (const research of visibleResearches) {
        const researchElement = document.createElement('div');
        researchElement.className = 'research-item';
        
        let statusClass = 'locked';
        let statusText = 'Vergrendeld';
        
        if (research.completed) {
          statusClass = 'completed';
          statusText = 'Voltooid';
          researchElement.classList.add('completed');
        } else if (research.unlocked && research.id !== GameState.university.research.active) {
          // Check prerequisites
          const hasPrerequisites = !research.prerequisites || 
            research.prerequisites.every(prereq => GameState.university.completed.includes(prereq));
          
          if (hasPrerequisites) {
            statusClass = 'available';
            statusText = 'Beschikbaar';
            researchElement.classList.add('unlocked');
          } else {
            statusClass = 'prerequisite';
            statusText = 'Vereisten';
            researchElement.classList.add('locked');
          }
        } else if (research.id === GameState.university.research.active) {
          statusClass = 'active';
          statusText = 'Actief';
          researchElement.classList.add('active');
        } else {
          researchElement.classList.add('locked');
        }

        const duration = Math.floor(research.baseDuration / 60);

        researchElement.innerHTML = `
          <div class="research-item-header">
            <div class="research-item-icon">${research.icon}</div>
            <div class="research-item-name">${research.name}</div>
          </div>
          <div class="research-item-description">${research.description}</div>
          <div class="research-item-footer">
            <div class="research-cost">${GameUtils.formatNumber(research.cost)}💰</div>
            <div class="research-duration">${duration}min</div>
            <div class="research-status ${statusClass}">${statusText}</div>
          </div>
        `;

        // Add click handler for available research
        if (statusClass === 'available' && !research.completed) {
          researchElement.addEventListener('click', () => {
            this.startResearch(research.id);
          });
        }

        gridElement.appendChild(researchElement);
      }
    }
  },

  // Update research statistics
  updateResearchStats() {
    const completedResearchCount = document.getElementById('completedResearchCount');
    const totalResearchSpent = document.getElementById('totalResearchSpent');

    if (completedResearchCount) {
      completedResearchCount.textContent = GameState.university.totalCompleted;
    }

    if (totalResearchSpent) {
      totalResearchSpent.textContent = GameUtils.formatNumber(GameState.university.totalSpent);
    }
  },

  // Format time for display
  formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  // Reset university system
  reset() {
    GameState.university = {
      level: 0,
      upgradeCost: 10000,
      research: {
        active: null,
        queue: [],
        startTime: 0,
        duration: 0,
        baseCost: 0,
        speedUpCost: 0
      },
      completed: [],
      discovered: [],
      totalCompleted: 0,
      totalSpent: 0
    };
  }
};