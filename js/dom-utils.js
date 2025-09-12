/**
 * DOM Utilities and Caching System
 * Centralized DOM element selection and caching
 */

const DOMUtils = {
  // Cache for frequently accessed elements
  cache: new Map(),

  // Get element by ID with caching
  get(id) {
    if (!this.cache.has(id)) {
      const element = document.getElementById(id);
      if (element) {
        this.cache.set(id, element);
      }
      return element;
    }
    return this.cache.get(id);
  },

  // Get multiple elements at once
  getMultiple(ids) {
    const result = {};
    ids.forEach(id => {
      result[id] = this.get(id);
    });
    return result;
  },

  // Clear cache (useful for testing or dynamic content)
  clearCache() {
    this.cache.clear();
  },

  // Update element text content safely
  setText(id, text) {
    const element = this.get(id);
    if (element) {
      element.textContent = text;
    }
  },

  // Update element HTML safely
  setHTML(id, html) {
    const element = this.get(id);
    if (element) {
      element.innerHTML = html;
    }
  },

  // Update element style
  setStyle(id, property, value) {
    const element = this.get(id);
    if (element) {
      element.style[property] = value;
    }
  },

  // Toggle element visibility
  toggle(id, show = null) {
    const element = this.get(id);
    if (element) {
      element.style.display = show === null 
        ? (element.style.display === 'none' ? 'block' : 'none')
        : (show ? 'block' : 'none');
    }
  },

  // Add/remove CSS classes
  addClass(id, className) {
    const element = this.get(id);
    if (element) {
      element.classList.add(className);
    }
  },

  removeClass(id, className) {
    const element = this.get(id);
    if (element) {
      element.classList.remove(className);
    }
  },

  toggleClass(id, className) {
    const element = this.get(id);
    if (element) {
      element.classList.toggle(className);
    }
  }
};

// Specialized DOM cache for game elements
const GameDOMCache = {
  // Initialize commonly used elements
  init() {
    this.elements = {
      // Header elements
      gold: DOMUtils.get('gold'),
      gpsDisplay: DOMUtils.get('gpsDisplay'),

      // Chief elements
      chiefSprite: DOMUtils.get('chiefSprite'),
      chiefProgress: DOMUtils.get('chiefProgress'),
      chiefGold: DOMUtils.get('chiefGold'),
      chiefCooldownText: DOMUtils.get('chiefCooldownText'),

      // Skill buttons
      rallySkillBtn: DOMUtils.get('rallySkillBtn'),
      inspireSkillBtn: DOMUtils.get('inspireSkillBtn'),
      fortuneSkillBtn: DOMUtils.get('fortuneSkillBtn'),

      // Generator elements (created dynamically)
      generators: {},

      // Combat elements
      attackBtn: DOMUtils.get('attackBtn'),
      campSelect: DOMUtils.get('campSelect'),
      warriorsToSend: DOMUtils.get('warriorsToSend'),
      maxWarriorsBtn: DOMUtils.get('maxWarriorsBtn'),
      attackResult: DOMUtils.get('attackResult'),

      // Adventure elements
      startAdventureBtn: DOMUtils.get('startAdventureBtn'),
      stopAdventureBtn: DOMUtils.get('stopAdventureBtn'),
      heroHp: DOMUtils.get('heroHp'),
      heroMaxHp: DOMUtils.get('heroMaxHp'),
      heroExp: DOMUtils.get('heroExp'),
      heroExpNext: DOMUtils.get('heroExpNext'),

      // Building elements
      buildingSprite: DOMUtils.get('buildingSprite'),
      buildingName: DOMUtils.get('buildingName'),
      buildingDescription: DOMUtils.get('buildingDescription'),
      upgradeBuildingBtn: DOMUtils.get('upgradeBuildingBtn'),

      // Tab elements
      navBtns: document.querySelectorAll('.nav-btn'),
      tabContents: document.querySelectorAll('.tab-content')
    };

    // Initialize generator elements for each type
    Object.keys(GeneratorTypes).forEach(key => {
      const type = GeneratorTypes[key];
      this.elements.generators[type] = {
        sprite: DOMUtils.get(`${type}Sprite`),
        count: DOMUtils.get(`${type}Count`),
        gps: DOMUtils.get(`${type}GPS`),
        totalGPS: DOMUtils.get(`${type}TotalGPS`),
        progress: DOMUtils.get(`${type}Progress`),
        buyBtn: DOMUtils.get(`buy${type.charAt(0).toUpperCase() + type.slice(1)}Btn`),
        cost: DOMUtils.get(`${type}Cost`)
      };
    });
  },

  // Quick access to cached elements
  get(path) {
    const parts = path.split('.');
    let current = this.elements;
    
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  }
};

// Event binding utilities
const EventBinder = {
  // Bind click event with optional context
  bindClick(elementId, callback, context = null) {
    const element = DOMUtils.get(elementId);
    if (element) {
      element.addEventListener('click', context ? callback.bind(context) : callback);
      return true;
    }
    return false;
  },

  // Bind multiple click events at once
  bindMultipleClicks(bindings) {
    const results = [];
    bindings.forEach(({ id, callback, context }) => {
      results.push({
        id,
        success: this.bindClick(id, callback, context)
      });
    });
    return results;
  },

  // Bind change event
  bindChange(elementId, callback, context = null) {
    const element = DOMUtils.get(elementId);
    if (element) {
      element.addEventListener('change', context ? callback.bind(context) : callback);
      return true;
    }
    return false;
  },

  // Bind input event
  bindInput(elementId, callback, context = null) {
    const element = DOMUtils.get(elementId);
    if (element) {
      element.addEventListener('input', context ? callback.bind(context) : callback);
      return true;
    }
    return false;
  }
};

// Initialize DOM cache when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GameDOMCache.init());
} else {
  GameDOMCache.init();
}