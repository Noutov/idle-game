/**
 * Tutorial System
 * Manages the first-time user tutorial experience
 */

const Tutorial = {
  currentPage: 1,
  totalPages: 5,
  
  // Initialize tutorial system
  init() {
    this.setupEventListeners();
    this.checkFirstTimeUser();
  },

  // Setup event listeners for tutorial controls
  setupEventListeners() {
    // Navigation buttons
    const prevBtn = document.getElementById('prevTutorialBtn');
    const nextBtn = document.getElementById('nextTutorialBtn');
    const startBtn = document.getElementById('startGameBtn');
    const closeBtn = document.getElementById('closeTutorialBtn');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousPage());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextPage());
    }
    
    if (startBtn) {
      startBtn.addEventListener('click', () => this.closeTutorial());
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeTutorial());
    }

    // Tutorial dots navigation
    const dots = document.querySelectorAll('.tutorial-dot');
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToPage(index + 1));
    });

    // Close tutorial when clicking outside modal
    const modalOverlay = document.getElementById('tutorialModal');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeTutorial();
        }
      });
    }

    // Prevent closing when clicking inside modal content
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Help button to reopen tutorial
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.forceShow());
    }
  },

  // Check if user is first time and should see tutorial
  checkFirstTimeUser() {
    const hasSeenTutorial = localStorage.getItem('didam_tutorial_seen');
    const dontShowAgain = localStorage.getItem('didam_tutorial_disabled');
    
    if (!hasSeenTutorial && !dontShowAgain) {
      // Small delay to ensure game is loaded
      setTimeout(() => {
        this.showTutorial();
      }, 500);
    }
  },

  // Show the tutorial modal
  showTutorial() {
    const tutorialModal = document.getElementById('tutorialModal');
    if (tutorialModal) {
      tutorialModal.style.display = 'flex';
      this.currentPage = 1;
      this.updatePage();
      
      // Pause game while tutorial is active
      if (typeof GameState !== 'undefined') {
        GameState.tutorialActive = true;
      }
    }
  },

  // Close the tutorial modal
  closeTutorial() {
    const tutorialModal = document.getElementById('tutorialModal');
    const dontShowCheckbox = document.getElementById('dontShowAgain');
    
    if (tutorialModal) {
      tutorialModal.style.display = 'none';
      
      // Mark tutorial as seen
      localStorage.setItem('didam_tutorial_seen', 'true');
      
      // Check if user doesn't want to see it again
      if (dontShowCheckbox && dontShowCheckbox.checked) {
        localStorage.setItem('didam_tutorial_disabled', 'true');
      }
      
      // Resume game
      if (typeof GameState !== 'undefined') {
        GameState.tutorialActive = false;
      }
    }
  },

  // Navigate to previous page
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
    }
  },

  // Navigate to next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePage();
    }
  },

  // Go directly to specific page
  goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePage();
    }
  },

  // Update the displayed page and navigation controls
  updatePage() {
    // Hide all pages
    for (let i = 1; i <= this.totalPages; i++) {
      const page = document.getElementById(`tutorialPage${i}`);
      if (page) {
        page.style.display = 'none';
      }
    }

    // Show current page
    const currentPageElement = document.getElementById(`tutorialPage${this.currentPage}`);
    if (currentPageElement) {
      currentPageElement.style.display = 'block';
    }

    // Update navigation buttons
    const prevBtn = document.getElementById('prevTutorialBtn');
    const nextBtn = document.getElementById('nextTutorialBtn');
    const startBtn = document.getElementById('startGameBtn');

    if (prevBtn) {
      prevBtn.disabled = this.currentPage === 1;
    }

    if (nextBtn && startBtn) {
      if (this.currentPage === this.totalPages) {
        nextBtn.style.display = 'none';
        startBtn.style.display = 'block';
      } else {
        nextBtn.style.display = 'block';
        startBtn.style.display = 'none';
      }
    }

    // Update dots
    const dots = document.querySelectorAll('.tutorial-dot');
    dots.forEach((dot, index) => {
      if (index + 1 === this.currentPage) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  },

  // Reset tutorial (for testing or reset game)
  reset() {
    localStorage.removeItem('didam_tutorial_seen');
    localStorage.removeItem('didam_tutorial_disabled');
  },

  // Force show tutorial (for help button or manual trigger)
  forceShow() {
    this.showTutorial();
  }
};

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Tutorial.init());
} else {
  Tutorial.init();
}