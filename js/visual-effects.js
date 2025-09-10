/**
 * Visual Effects System
 * Handles particles, floating text, and other visual feedback
 */

const VisualEffects = {
  // Create floating gold text
  createFloatingGold(element, amount) {
    const rect = element.getBoundingClientRect();
    const floatingGold = document.createElement('div');
    floatingGold.className = 'floating-gold';
    floatingGold.textContent = `+${GameUtils.formatNumber(amount)}💰`;
    
    // Position relative to the element
    floatingGold.style.left = (rect.left + rect.width / 2) + 'px';
    floatingGold.style.top = rect.top + 'px';
    floatingGold.style.position = 'fixed';
    floatingGold.style.zIndex = '1000';
    
    document.body.appendChild(floatingGold);
    
    // Remove after animation completes
    setTimeout(() => {
      if (floatingGold.parentNode) {
        floatingGold.remove();
      }
    }, 2000);
  },

  // Create particle effects
  createParticles(element, count = 5) {
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random position around the element
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 20;
      
      particle.style.left = (rect.left + rect.width / 2 + offsetX) + 'px';
      particle.style.top = (rect.top + rect.height / 2 + offsetY) + 'px';
      particle.style.position = 'fixed';
      particle.style.zIndex = '999';
      
      // Random color variations
      const colors = ['#ffd700', '#ffed4e', '#ffc107', '#ff8f00'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      document.body.appendChild(particle);
      
      // Remove after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, 1000);
    }
  },

  // Create screen shake effect
  screenShake(duration = 500, intensity = 5) {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;

    const originalTransform = gameContainer.style.transform;
    const startTime = Date.now();

    const shake = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        gameContainer.style.transform = originalTransform;
        return;
      }

      const progress = elapsed / duration;
      const currentIntensity = intensity * (1 - progress);
      
      const x = (Math.random() - 0.5) * currentIntensity;
      const y = (Math.random() - 0.5) * currentIntensity;
      
      gameContainer.style.transform = `translate(${x}px, ${y}px)`;
      
      requestAnimationFrame(shake);
    };

    shake();
  },

  // Flash effect for elements
  flashElement(element, color = '#4CAF50', duration = 500) {
    if (!element) return;

    const originalBackground = element.style.background;
    element.style.background = color;
    element.style.transition = `background ${duration}ms ease`;

    setTimeout(() => {
      element.style.background = originalBackground;
    }, duration);
  },

  // Pulse effect for buttons
  pulseButton(buttonId, color = 'rgba(76, 175, 80, 0.5)') {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.style.animation = 'none';
    button.offsetHeight; // Trigger reflow
    button.style.animation = `buttonPulse 0.6s ease`;

    // Add keyframes if not already present
    if (!document.querySelector('#pulseKeyframes')) {
      const style = document.createElement('style');
      style.id = 'pulseKeyframes';
      style.textContent = `
        @keyframes buttonPulse {
          0% { box-shadow: 0 0 0 0 ${color}; }
          70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
          100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }
      `;
      document.head.appendChild(style);
    }
  },

  // Pulse effect for elements (like sprites)
  pulseElement(element, color = 'rgba(255, 215, 0, 0.6)') {
    if (!element) return;

    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = `elementPulse 0.8s ease`;

    // Add keyframes if not already present
    if (!document.querySelector('#elementPulseKeyframes')) {
      const style = document.createElement('style');
      style.id = 'elementPulseKeyframes';
      style.textContent = `
        @keyframes elementPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 ${color}; }
          50% { transform: scale(1.08); box-shadow: 0 0 20px 5px ${color}; }
          100% { transform: scale(1); box-shadow: 0 0 0 15px transparent; }
        }
      `;
      document.head.appendChild(style);
    }
  },

  // Number count-up animation
  animateNumber(element, startValue, endValue, duration = 1000) {
    if (!element) return;

    const startTime = Date.now();
    const difference = endValue - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (difference * easeOut);
      
      element.textContent = GameUtils.formatNumber(Math.floor(currentValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = GameUtils.formatNumber(endValue);
      }
    };

    animate();
  },

  // Progress bar fill animation
  animateProgressBar(progressBarId, percentage, duration = 200) {
    const progressBar = document.getElementById(progressBarId);
    if (!progressBar) return;

    progressBar.style.transition = `width ${duration}ms linear`;
    progressBar.style.width = percentage + '%';
  },

  // Celebration effect
  celebrate() {
    // Create multiple gold particles from the center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'celebration-particle';
      particle.textContent = '💰';
      
      particle.style.position = 'fixed';
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      particle.style.fontSize = '20px';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '9999';
      
      document.body.appendChild(particle);
      
      // Random direction and distance
      const angle = (Math.PI * 2 * i) / 20;
      const distance = 100 + Math.random() * 200;
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;
      
      particle.animate([
        { 
          transform: 'translate(0, 0) scale(1) rotate(0deg)', 
          opacity: 1 
        },
        { 
          transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0.5) rotate(360deg)`, 
          opacity: 0 
        }
      ], {
        duration: 2000,
        easing: 'ease-out'
      }).onfinish = () => particle.remove();
    }
  },

  // Show tooltip
  showTooltip(element, text, duration = 2000) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      z-index: 10000;
      white-space: nowrap;
    `;

    const rect = element.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
    tooltip.style.top = (rect.top - 30) + 'px';
    tooltip.style.transform = 'translateX(-50%)';

    document.body.appendChild(tooltip);

    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.remove();
      }
    }, duration);
  }
};