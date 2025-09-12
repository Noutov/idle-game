/**
 * Tech Tree System
 * Allows players to spend wisdom points on permanent upgrades
 * Organized in categories with prerequisites and scaling costs
 */

const TechTree = {
  // Tech tree categories and upgrades
  categories: {
    production: {
      name: 'Productie',
      icon: '🏭',
      color: '#4caf50',
      description: 'Verbeter je generators en goud productie',
      upgrades: {
        efficient_workers: {
          name: 'Efficiënte Arbeiders',
          description: 'Alle generators produceren 10% meer goud',
          icon: '⚙️',
          maxLevel: 10,
          baseCost: 2,
          costMultiplier: 1.5,
          effect: { type: 'generator_gold_bonus', value: 0.1 }
        },
        mass_production: {
          name: 'Massaproductie',
          description: 'Alle generators werken 15% sneller',
          icon: '⚡',
          maxLevel: 8,
          baseCost: 3,
          costMultiplier: 1.6,
          effect: { type: 'generator_speed_bonus', value: 0.15 },
          prerequisites: ['efficient_workers']
        },
        golden_touch: {
          name: 'Gouden Aanraking',
          description: 'Dorpshoofd krijgt 25% meer goud per klik',
          icon: '👑',
          maxLevel: 5,
          baseCost: 4,
          costMultiplier: 1.8,
          effect: { type: 'chief_gold_bonus', value: 0.25 }
        },
        automation: {
          name: 'Automatisering',
          description: 'Alle generators kosten 12% minder',
          icon: '🤖',
          maxLevel: 6,
          baseCost: 5,
          costMultiplier: 1.7,
          effect: { type: 'generator_cost_reduction', value: 0.12 },
          prerequisites: ['mass_production']
        }
      }
    },

    combat: {
      name: 'Gevecht',
      icon: '⚔️',
      color: '#f44336',
      description: 'Verbeter je krijgers en gevechts vaardigheden',
      upgrades: {
        warrior_training: {
          name: 'Krijger Training',
          description: 'Krijgers en Elite Krijgers produceren 20% meer goud',
          icon: '🛡️',
          maxLevel: 8,
          baseCost: 3,
          costMultiplier: 1.6,
          effect: { type: 'warrior_gold_bonus', value: 0.2 }
        },
        tactical_advantage: {
          name: 'Tactisch Voordeel',
          description: 'Kamp aanvallen geven 30% meer beloning',
          icon: '🎯',
          maxLevel: 6,
          baseCost: 4,
          costMultiplier: 1.7,
          effect: { type: 'camp_reward_bonus', value: 0.3 },
          prerequisites: ['warrior_training']
        },
        battle_fury: {
          name: 'Gevechtswoede',
          description: 'Held krijgt 25% meer aanval en verdediging',
          icon: '💥',
          maxLevel: 5,
          baseCost: 5,
          costMultiplier: 1.8,
          effect: { type: 'hero_combat_bonus', value: 0.25 }
        },
        war_economy: {
          name: 'Oorlogseconomie',
          description: 'Krijgers kosten 15% minder',
          icon: '💰',
          maxLevel: 4,
          baseCost: 6,
          costMultiplier: 1.9,
          effect: { type: 'warrior_cost_reduction', value: 0.15 },
          prerequisites: ['tactical_advantage', 'battle_fury']
        }
      }
    },

    knowledge: {
      name: 'Kennis',
      icon: '📚',
      color: '#9c27b0',
      description: 'Verbeter onderzoek en leer nieuwe vaardigheden',
      upgrades: {
        faster_research: {
          name: 'Sneller Onderzoek',
          description: 'Alle onderzoeken gaan 20% sneller',
          icon: '🔬',
          maxLevel: 6,
          baseCost: 4,
          costMultiplier: 1.7,
          effect: { type: 'research_speed_bonus', value: 0.2 }
        },
        cheaper_research: {
          name: 'Goedkoper Onderzoek',
          description: 'Alle onderzoeken kosten 15% minder',
          icon: '💡',
          maxLevel: 5,
          baseCost: 5,
          costMultiplier: 1.8,
          effect: { type: 'research_cost_reduction', value: 0.15 }
        },
        wisdom_amplifier: {
          name: 'Wijsheid Versterker',
          description: 'Krijg 1 extra wijsheid punt bij prestige',
          icon: '✨',
          maxLevel: 3,
          baseCost: 10,
          costMultiplier: 2.0,
          effect: { type: 'wisdom_gain_bonus', value: 1 },
          prerequisites: ['faster_research', 'cheaper_research']
        },
        ancient_knowledge: {
          name: 'Oude Kennis',
          description: 'Alle effecten van voltooide onderzoeken zijn 25% sterker',
          icon: '📜',
          maxLevel: 4,
          baseCost: 8,
          costMultiplier: 2.2,
          effect: { type: 'research_effect_bonus', value: 0.25 },
          prerequisites: ['wisdom_amplifier']
        }
      }
    },

    mystical: {
      name: 'Mystiek',
      icon: '🔮',
      color: '#673ab7',
      description: 'Ontgrendel krachtige magische effecten',
      upgrades: {
        fortune_blessing: {
          name: 'Gelukszegen',
          description: 'Alle gelukseffecten zijn 50% sterker',
          icon: '🍀',
          maxLevel: 4,
          baseCost: 6,
          costMultiplier: 1.8,
          effect: { type: 'luck_effect_bonus', value: 0.5 }
        },
        time_mastery: {
          name: 'Tijd Beheersing',
          description: 'Alle cooldowns zijn 20% korter',
          icon: '⏰',
          maxLevel: 5,
          baseCost: 7,
          costMultiplier: 1.9,
          effect: { type: 'cooldown_reduction', value: 0.2 }
        },
        mana_efficiency: {
          name: 'Mana Efficiëntie',
          description: 'Zieners produceren 30% meer goud',
          icon: '🌟',
          maxLevel: 6,
          baseCost: 5,
          costMultiplier: 1.7,
          effect: { type: 'seer_gold_bonus', value: 0.3 }
        },
        transcendence: {
          name: 'Transcendentie',
          description: 'Prestige bonus groeit 25% sneller',
          icon: '🌌',
          maxLevel: 3,
          baseCost: 15,
          costMultiplier: 2.5,
          effect: { type: 'prestige_bonus_amplifier', value: 0.25 },
          prerequisites: ['fortune_blessing', 'time_mastery', 'mana_efficiency']
        }
      }
    }
  },

  // Initialize tech tree system
  init() {
    this.setupEventListeners();
    this.updateTechTreeDisplay();
  },

  // Setup event listeners
  setupEventListeners() {
    // Toggle button for tech tree
    const toggleTechTreeBtn = document.getElementById('toggleTechTreeBtn');
    const techTreeContainer = document.getElementById('techTreeContainer');
    
    if (toggleTechTreeBtn && techTreeContainer) {
      toggleTechTreeBtn.addEventListener('click', () => {
        const isVisible = techTreeContainer.style.display !== 'none';
        techTreeContainer.style.display = isVisible ? 'none' : 'block';
        toggleTechTreeBtn.textContent = isVisible ? '🧠 Wijsheid Boom' : '🧠 Verberg Boom';
        
        if (!isVisible) {
          this.updateTechTreeDisplay();
        }
      });
    }

    // Update on relevant game events
    GameEvents.on('prestigeChanged', () => {
      this.updateTechTreeDisplay();
    });

    GameEvents.on('goldChanged', () => {
      this.updateTechTreeDisplay();
    });

    GameEvents.on('techTreeChanged', () => {
      this.updateTechTreeDisplay();
    });
  },

  // Get cost for upgrading a specific tech
  getUpgradeCost(category, upgradeId) {
    const upgrade = this.categories[category].upgrades[upgradeId];
    const currentLevel = this.getTechLevel(category, upgradeId);
    
    if (currentLevel >= upgrade.maxLevel) return null;
    
    return Math.ceil(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
  },

  // Get current level of a tech
  getTechLevel(category, upgradeId) {
    if (!GameState.techTree[category]) return 0;
    return GameState.techTree[category][upgradeId] || 0;
  },

  // Check if tech can be upgraded
  canUpgradeTech(category, upgradeId) {
    const upgrade = this.categories[category].upgrades[upgradeId];
    const currentLevel = this.getTechLevel(category, upgradeId);
    
    // Check max level
    if (currentLevel >= upgrade.maxLevel) return false;
    
    // Check cost
    const cost = this.getUpgradeCost(category, upgradeId);
    if (!cost || GameState.prestige.availableWisdom < cost) return false;
    
    // Check prerequisites
    if (upgrade.prerequisites) {
      for (const prereqId of upgrade.prerequisites) {
        if (this.getTechLevel(category, prereqId) === 0) return false;
      }
    }
    
    return true;
  },

  // Upgrade a tech
  upgradeTech(category, upgradeId) {
    if (!this.canUpgradeTech(category, upgradeId)) return false;
    
    const cost = this.getUpgradeCost(category, upgradeId);
    const upgrade = this.categories[category].upgrades[upgradeId];
    
    // Spend wisdom points
    GameState.prestige.availableWisdom -= cost;
    
    // Initialize category if needed
    if (!GameState.techTree[category]) {
      GameState.techTree[category] = {};
    }
    
    // Upgrade the tech
    const currentLevel = this.getTechLevel(category, upgradeId);
    GameState.techTree[category][upgradeId] = currentLevel + 1;
    
    UI.showNotification(
      `${upgrade.icon} ${upgrade.name} upgraded to level ${currentLevel + 1}!`,
      'success'
    );
    
    this.updateTechTreeDisplay();
    GameEvents.emit('techTreeChanged');
    return true;
  },

  // Get total effect bonus for a specific type
  getTechBonus(effectType, target = null) {
    let totalBonus = 0;
    
    for (const [categoryId, category] of Object.entries(this.categories)) {
      for (const [upgradeId, upgrade] of Object.entries(category.upgrades)) {
        const level = this.getTechLevel(categoryId, upgradeId);
        if (level > 0 && upgrade.effect.type === effectType) {
          // Check if effect applies to target (for specific generator types)
          if (target && effectType.includes('warrior') && !['warrior', 'elite'].includes(target)) {
            continue;
          }
          if (target && effectType.includes('seer') && target !== 'seer') {
            continue;
          }
          
          totalBonus += upgrade.effect.value * level;
        }
      }
    }
    
    return totalBonus;
  },

  // Get all tech bonuses organized by type
  getAllTechBonuses() {
    const bonuses = {
      generator_gold_bonus: this.getTechBonus('generator_gold_bonus'),
      generator_speed_bonus: this.getTechBonus('generator_speed_bonus'),
      generator_cost_reduction: this.getTechBonus('generator_cost_reduction'),
      chief_gold_bonus: this.getTechBonus('chief_gold_bonus'),
      warrior_gold_bonus: this.getTechBonus('warrior_gold_bonus'),
      warrior_cost_reduction: this.getTechBonus('warrior_cost_reduction'),
      seer_gold_bonus: this.getTechBonus('seer_gold_bonus'),
      camp_reward_bonus: this.getTechBonus('camp_reward_bonus'),
      hero_combat_bonus: this.getTechBonus('hero_combat_bonus'),
      research_speed_bonus: this.getTechBonus('research_speed_bonus'),
      research_cost_reduction: this.getTechBonus('research_cost_reduction'),
      research_effect_bonus: this.getTechBonus('research_effect_bonus'),
      wisdom_gain_bonus: this.getTechBonus('wisdom_gain_bonus'),
      luck_effect_bonus: this.getTechBonus('luck_effect_bonus'),
      cooldown_reduction: this.getTechBonus('cooldown_reduction'),
      prestige_bonus_amplifier: this.getTechBonus('prestige_bonus_amplifier')
    };
    
    return bonuses;
  },

  // Update tech tree display
  updateTechTreeDisplay() {
    const techTreeContainer = document.getElementById('techTreeContainer');
    if (!techTreeContainer) return;

    // Clear existing content
    techTreeContainer.innerHTML = '';

    // Available wisdom display
    const wisdomHeader = document.createElement('div');
    wisdomHeader.className = 'tech-tree-header';
    wisdomHeader.innerHTML = `
      <h4>🧠 Wijsheid Boom</h4>
      <div class="available-wisdom">
        Beschikbare Wijsheid: <span class="wisdom-count">${GameState.prestige.availableWisdom || 0}</span>
      </div>
    `;
    techTreeContainer.appendChild(wisdomHeader);

    // Create categories
    for (const [categoryId, category] of Object.entries(this.categories)) {
      const categoryElement = this.createCategoryElement(categoryId, category);
      techTreeContainer.appendChild(categoryElement);
    }
  },

  // Create category element
  createCategoryElement(categoryId, category) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'tech-category';
    categoryDiv.style.borderColor = category.color;

    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'tech-category-header';
    categoryHeader.innerHTML = `
      <div class="category-icon" style="color: ${category.color}">${category.icon}</div>
      <div class="category-info">
        <div class="category-name">${category.name}</div>
        <div class="category-description">${category.description}</div>
      </div>
    `;

    const upgradesGrid = document.createElement('div');
    upgradesGrid.className = 'tech-upgrades-grid';

    // Add upgrades
    for (const [upgradeId, upgrade] of Object.entries(category.upgrades)) {
      const upgradeElement = this.createUpgradeElement(categoryId, upgradeId, upgrade);
      upgradesGrid.appendChild(upgradeElement);
    }

    categoryDiv.appendChild(categoryHeader);
    categoryDiv.appendChild(upgradesGrid);

    return categoryDiv;
  },

  // Create upgrade element
  createUpgradeElement(categoryId, upgradeId, upgrade) {
    const currentLevel = this.getTechLevel(categoryId, upgradeId);
    const maxLevel = upgrade.maxLevel;
    const cost = this.getUpgradeCost(categoryId, upgradeId);
    const canUpgrade = this.canUpgradeTech(categoryId, upgradeId);
    const isMaxed = currentLevel >= maxLevel;

    const upgradeDiv = document.createElement('div');
    upgradeDiv.className = 'tech-upgrade';
    
    if (isMaxed) {
      upgradeDiv.classList.add('maxed');
    } else if (canUpgrade) {
      upgradeDiv.classList.add('available');
    } else if (currentLevel > 0) {
      upgradeDiv.classList.add('owned');
    } else {
      upgradeDiv.classList.add('locked');
    }

    // Check prerequisites
    let prereqText = '';
    if (upgrade.prerequisites && currentLevel === 0) {
      const unmetPrereqs = upgrade.prerequisites.filter(prereqId => 
        this.getTechLevel(categoryId, prereqId) === 0
      );
      if (unmetPrereqs.length > 0) {
        prereqText = `<div class="prerequisites">Vereist: ${unmetPrereqs.map(prereqId => 
          this.categories[categoryId].upgrades[prereqId].name
        ).join(', ')}</div>`;
      }
    }

    upgradeDiv.innerHTML = `
      <div class="upgrade-icon">${upgrade.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${upgrade.name}</div>
        <div class="upgrade-level">Lv. ${currentLevel}/${maxLevel}</div>
        <div class="upgrade-description">${upgrade.description}</div>
        <div class="upgrade-effect">+${(upgrade.effect.value * 100).toFixed(0)}% per level</div>
        ${prereqText}
        <div class="upgrade-cost">
          ${isMaxed ? 'MAX' : `Kosten: ${cost} Wijsheid`}
        </div>
      </div>
    `;

    // Add click handler
    if (canUpgrade && !isMaxed) {
      upgradeDiv.addEventListener('click', () => {
        this.upgradeTech(categoryId, upgradeId);
      });
    }

    return upgradeDiv;
  },

  // Reset tech tree (used in prestige reset)
  reset() {
    GameState.techTree = {};
  }
};