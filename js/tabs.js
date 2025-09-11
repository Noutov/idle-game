/**
 * Tab Navigation System
 * Handles switching between different game sections
 */

const TabSystem = {
  currentTab: 'dorpTab',
  
  // Initialize tab system
  init() {
    this.setupEventListeners();
    this.showTab(this.currentTab);
  },

  // Setup event listeners for navigation buttons
  setupEventListeners() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const tabId = button.getAttribute('data-tab');
        this.showTab(tabId);
      });
    });
  },

  // Show specific tab and hide others
  showTab(tabId) {
    // Hide all tab contents
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => {
      tab.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }

    // Update navigation buttons
    const allNavButtons = document.querySelectorAll('.nav-btn');
    allNavButtons.forEach(button => {
      button.classList.remove('active');
    });

    const activeNavButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeNavButton) {
      activeNavButton.classList.add('active');
    }

    // Update current tab
    this.currentTab = tabId;
    
    // Emit event for other systems to react to tab changes
    if (typeof GameEvents !== 'undefined') {
      GameEvents.emit('tabChanged', tabId);
    }
  },

  // Get current active tab
  getCurrentTab() {
    return this.currentTab;
  },

  // Check if specific tab is active
  isTabActive(tabId) {
    return this.currentTab === tabId;
  }
};

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TabSystem.init());
} else {
  TabSystem.init();
}