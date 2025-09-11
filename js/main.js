/**
 * Main Game Controller
 * Initializes all systems and manages the main game loop
 */

const Game = {
  // Game state
  isInitialized: false,
  isPaused: false,
  lastTick: Date.now(),
  
  // Game intervals
  mainLoop: null,
  saveLoop: null,
  
  // Initialize the entire game
  init() {
    if (this.isInitialized) {
      console.warn('Game already initialized');
      return;
    }
    
    console.log('🏰 Initializing Gallisch Dorp...');
    
    try {
      // Load saved game first
      GameUtils.loadGame();
      
      // Initialize all systems
      UI.init();
      Chief.init();
      ChiefEnhanced.init();
      Prestige.init();
      University.init();
      Generators.init();
      Upgrades.init();
      Building.init();
      Combat.init();
      Adventure.init();
      
      // Setup global event listeners
      this.setupGlobalEvents();
      
      // Start game loops
      this.startGameLoop();
      this.startAutoSave();
      
      // Mark as initialized
      this.isInitialized = true;
      
      console.log('✅ Game initialized successfully');
      
      // Show welcome message
      UI.showNotification('🏰 Welkom in het Gallische Dorp!', 'success', 3000);
      
    } catch (error) {
      console.error('❌ Failed to initialize game:', error);
      UI.showNotification('Fout bij opstarten van het spel!', 'error');
    }
  },
  
  // Setup global event listeners
  setupGlobalEvents() {
    // Handle visibility change (pause when tab not active)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
    
    // Handle window focus/blur
    window.addEventListener('focus', () => this.resume());
    window.addEventListener('blur', () => this.pause());
    
    // Handle beforeunload (save before closing)
    window.addEventListener('beforeunload', () => {
      GameUtils.saveGame();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
    
    // Handle errors
    window.addEventListener('error', (e) => {
      console.error('Game error:', e.error);
      UI.showNotification('Er is een fout opgetreden!', 'error');
    });
    
    // Handle scroll for reset button visibility
    window.addEventListener('scroll', () => {
      this.handleResetButtonVisibility();
    });
  },
  
  // Handle keyboard shortcuts
  handleKeyboardShortcuts(event) {
    // Don't trigger shortcuts if typing in input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
      return;
    }
    
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        Chief.clickChief();
        break;
        
      case 'KeyR':
        if (event.ctrlKey) {
          event.preventDefault();
          Upgrades.showRecommendations();
        }
        break;
        
      case 'KeyS':
        if (event.ctrlKey) {
          event.preventDefault();
          GameUtils.saveGame();
          UI.showNotification('Spel opgeslagen!', 'success');
        }
        break;
        
      case 'KeyP':
        event.preventDefault();
        this.togglePause();
        break;
        
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
        const generatorIndex = parseInt(event.code.slice(-1)) - 1;
        const generatorTypes = ['villager', 'trader', 'warrior', 'seer', 'elite'];
        if (generatorTypes[generatorIndex]) {
          Generators.buyGenerator(generatorTypes[generatorIndex]);
        }
        break;
    }
  },
  
  // Start main game loop
  startGameLoop() {
    if (this.mainLoop) {
      clearInterval(this.mainLoop);
    }
    
    this.mainLoop = setInterval(() => {
      if (!this.isPaused) {
        this.tick();
      }
    }, GameState.settings.tickInterval);
  },
  
  // Main game tick (called every second)
  tick() {
    const now = Date.now();
    const deltaTime = now - this.lastTick;
    this.lastTick = now;
    
    try {
      // Process generator income
      const income = Generators.processIncome();
      
      // Process combat cooldowns
      Combat.processCooldowns();
      
      // Process adventure timers
      Adventure.processTick();
      
      // Process university research
      University.updateResearch();
      
      // Update UI
      UI.updateAll();
      
      // Update university UI
      University.updateUI();
      
      // Emit tick event for other systems
      GameEvents.emit('tick', { deltaTime, income });
      
    } catch (error) {
      console.error('Error in game tick:', error);
    }
  },
  
  // Start auto-save
  startAutoSave() {
    if (this.saveLoop) {
      clearInterval(this.saveLoop);
    }
    
    this.saveLoop = setInterval(() => {
      if (GameState.settings.autoSave && !this.isPaused) {
        GameUtils.saveGame();
      }
    }, GameState.settings.saveInterval);
  },
  
  // Pause game
  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      GameEvents.emit('gamePaused');
      console.log('⏸️ Game paused');
    }
  },
  
  // Resume game
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTick = Date.now(); // Reset tick timer
      GameEvents.emit('gameResumed');
      console.log('▶️ Game resumed');
    }
  },
  
  // Toggle pause state
  togglePause() {
    if (this.isPaused) {
      this.resume();
      UI.showNotification('Spel hervat', 'info');
    } else {
      this.pause();
      UI.showNotification('Spel gepauzeerd', 'info');
    }
  },
  
  // Get game statistics
  getStats() {
    return {
      isInitialized: this.isInitialized,
      isPaused: this.isPaused,
      uptime: Date.now() - this.startTime,
      gold: GameState.gold,
      gps: GameUtils.calculateGPS(),
      totalGenerators: Generators.getTotalCount(),
      totalSpent: Upgrades.getTotalSpent(),
      chiefStats: Chief.getStats(),
      generatorStats: Generators.getStats(),
      combatStats: Combat.getStats()
    };
  },
  
  // Show game statistics
  showStats() {
    const stats = this.getStats();
    
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
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 0 50px rgba(0,0,0,0.8);
    `;
    
    modal.innerHTML = `
      <h2>📊 Spel Statistieken</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
        <div>
          <h3>💰 Economie</h3>
          <p>Goud: ${GameUtils.formatNumber(stats.gold)}</p>
          <p>Goud/sec: ${GameUtils.formatNumber(stats.gps)}</p>
          <p>Totaal uitgegeven: ${GameUtils.formatNumber(stats.totalSpent)}</p>
        </div>
        <div>
          <h3>👑 Dorpshoofd</h3>
          <p>Goud per klik: ${stats.chiefStats.goldPerClick}</p>
          <p>Cooldown: ${stats.chiefStats.cooldownSeconds}s</p>
          <p>Klik efficiëntie: ${GameUtils.formatNumber(Chief.getClickEfficiency())}/s</p>
        </div>
        <div>
          <h3>🏭 Generators</h3>
          <p>Totaal generators: ${stats.totalGenerators}</p>
          <p>Dorpelingen: ${stats.generatorStats.villager.count}</p>
          <p>Krijgers: ${stats.generatorStats.warrior.count}</p>
          <p>Zieners: ${stats.generatorStats.seer.count}</p>
          <p>Elite Krijgers: ${stats.generatorStats.elite.count}</p>
        </div>
        <div>
          <h3>⚔️ Combat</h3>
          <p>Beschikbare krijgers: ${stats.combatStats.availableWarriors}</p>
          <p>Kampen beschikbaar: ${Object.values(stats.combatStats.camps).filter(c => c.available).length}/3</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="this.parentElement.remove();" style="margin: 5px;">
          Sluiten
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  },
  
  // Reset entire game
  resetGame() {
    if (confirm('Weet je zeker dat je het spel wilt resetten? Alle progress gaat verloren!')) {
      // Stop all intervals
      if (this.mainLoop) clearInterval(this.mainLoop);
      if (this.saveLoop) clearInterval(this.saveLoop);
      
      // Reset all systems
      GameUtils.resetGame();
      Chief.reset();
      ChiefEnhanced.reset();
      Prestige.reset();
      University.reset();
      Generators.reset();
      Upgrades.reset();
      Building.reset();
      Combat.reset();
      Adventure.reset();
      
      // Restart game
      this.isInitialized = false;
      this.init();
      
      UI.showNotification('Spel gereset!', 'info');
    }
  },
  
  // Export save data
  exportSave() {
    try {
      const saveData = {
        gold: GameState.gold,
        chief: GameState.chief,
        generators: GameState.generators,
        camps: GameState.camps,
        building: GameState.building,
        adventure: GameState.adventure,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      const exportString = btoa(JSON.stringify(saveData));
      
      // Create download
      const blob = new Blob([exportString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gallisch-dorp-save.txt';
      a.click();
      URL.revokeObjectURL(url);
      
      UI.showNotification('Save geëxporteerd!', 'success');
    } catch (error) {
      console.error('Failed to export save:', error);
      UI.showNotification('Fout bij exporteren!', 'error');
    }
  },
  
  // Import save data
  importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importString = e.target.result;
          const saveData = JSON.parse(atob(importString));
          
          // Validate save data
          if (saveData.version && saveData.gold !== undefined) {
            // Import data
            GameState.gold = saveData.gold || 0;
            Object.assign(GameState.chief, saveData.chief || {});
            Object.assign(GameState.generators, saveData.generators || {});
            Object.assign(GameState.camps, saveData.camps || {});
            Object.assign(GameState.building, saveData.building || {});
            Object.assign(GameState.adventure, saveData.adventure || {});
            
            // Save to localStorage
            GameUtils.saveGame();
            
            // Update UI
            UI.updateAll();
            
            UI.showNotification('Save geïmporteerd!', 'success');
          } else {
            throw new Error('Invalid save format');
          }
        } catch (error) {
          console.error('Failed to import save:', error);
          UI.showNotification('Ongeldige save file!', 'error');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  },
  
  // Handle reset button visibility based on scroll position
  handleResetButtonVisibility() {
    const resetContainer = document.querySelector('.reset-container');
    if (!resetContainer) return;
    
    // Get scroll position
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Show reset button when user has scrolled near the bottom
    // Calculate if user is within 200px of the bottom
    const nearBottom = (scrollPosition + windowHeight) >= (documentHeight - 200);
    
    if (nearBottom) {
      resetContainer.classList.add('visible');
    } else {
      resetContainer.classList.remove('visible');
    }
  }
};

// Auto-start game when page loads
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});

// Add some global shortcuts for debugging (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.Game = Game;
  window.GameState = GameState;
  window.GameUtils = GameUtils;
  window.addGold = (amount) => GameUtils.addGold(amount);
  window.analyzeBalance = () => Adventure.analyzeBalance();
  window.addGenerators = () => {
    GameUtils.addGold(50000);
    for(let i = 0; i < 15; i++) {
      Generators.buyGenerator('villager');
    }
    for(let i = 0; i < 10; i++) {
      Generators.buyGenerator('trader');
    }
  };
}