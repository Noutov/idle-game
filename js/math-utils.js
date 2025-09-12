/**
 * Math Utilities
 * Centralized mathematical operations and calculations
 */

const MathUtils = {
  // Basic operations with common patterns
  floorMultiply(value, multiplier) {
    return Math.floor(value * multiplier);
  },

  ceilMultiply(value, multiplier) {
    return Math.ceil(value * multiplier);
  },

  roundMultiply(value, multiplier) {
    return Math.round(value * multiplier);
  },

  // Random number generators
  randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  randomChance(probability) {
    return Math.random() < probability;
  },

  // Array random selection
  randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  // Clamping and bounds
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  clampMin(value, min) {
    return Math.max(value, min);
  },

  clampMax(value, max) {
    return Math.min(value, max);
  },

  // Percentage calculations
  percentage(value, total) {
    return total === 0 ? 0 : Math.floor((value / total) * 100);
  },

  percentageFloat(value, total) {
    return total === 0 ? 0 : (value / total) * 100;
  },

  applyPercentage(value, percentage) {
    return value * (percentage / 100);
  },

  // Game-specific calculations
  calculateCostScaling(baseCost, purchaseCount) {
    let multiplier;
    
    if (purchaseCount < 10) {
      multiplier = GameConstants.MULTIPLIERS.COST_SCALING.EARLY;
    } else if (purchaseCount < 25) {
      multiplier = GameConstants.MULTIPLIERS.COST_SCALING.MID;
    } else {
      multiplier = GameConstants.MULTIPLIERS.COST_SCALING.LATE;
    }
    
    return Math.floor(baseCost * Math.pow(multiplier, purchaseCount));
  },

  calculatePrestigeBonus(prestigeCount) {
    return prestigeCount * GameConstants.MULTIPLIERS.PRESTIGE_BASE;
  },

  calculateLuckBonus(luckLevel) {
    const bonus = luckLevel * 0.1;
    return Math.min(bonus, GameConstants.MULTIPLIERS.LUCK_BONUS_MAX);
  },

  // Combat calculations
  calculateCombatDamage(attack, defense, variance = 0.1) {
    const baseDamage = Math.max(1, attack - defense);
    const varianceAmount = baseDamage * variance;
    const minDamage = baseDamage - varianceAmount;
    const maxDamage = baseDamage + varianceAmount;
    
    return Math.max(1, Math.floor(this.randomFloat(minDamage, maxDamage)));
  },

  calculateCriticalHit(baseDamage, critChance = 0.1, critMultiplier = 2.0) {
    if (this.randomChance(critChance)) {
      return Math.floor(baseDamage * critMultiplier);
    }
    return baseDamage;
  },

  calculateExpToNextLevel(currentLevel) {
    return Math.floor(100 * Math.pow(1.2, currentLevel - 1));
  },

  // Economic calculations
  calculateCompoundGrowth(principal, rate, periods) {
    return Math.floor(principal * Math.pow(1 + rate, periods));
  },

  calculateROI(investment, return_value) {
    return investment === 0 ? 0 : ((return_value - investment) / investment) * 100;
  },

  // Time calculations
  millisecondsToSeconds(ms) {
    return Math.floor(ms / 1000);
  },

  secondsToMilliseconds(seconds) {
    return seconds * 1000;
  },

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  },

  // Progress calculations
  calculateProgress(current, total) {
    return total === 0 ? 0 : this.clamp((current / total) * 100, 0, 100);
  },

  calculateETA(current, total, rate) {
    if (rate <= 0 || current >= total) return 0;
    return Math.ceil((total - current) / rate) * 1000; // Convert to milliseconds
  },

  // Interpolation
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  },

  smoothstep(edge0, edge1, x) {
    const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  },

  // Statistical functions
  average(numbers) {
    return numbers.length === 0 ? 0 : numbers.reduce((a, b) => a + b, 0) / numbers.length;
  },

  sum(numbers) {
    return numbers.reduce((a, b) => a + b, 0);
  },

  max(numbers) {
    return Math.max(...numbers);
  },

  min(numbers) {
    return Math.min(...numbers);
  },

  // Weighted random selection
  weightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }
    
    return items[items.length - 1]; // Fallback
  },

  // Distance calculations (for positioning)
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Easing functions for animations
  easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  easeOut(t) {
    return t * (2 - t);
  },

  easeIn(t) {
    return t * t;
  },

  // Number formatting helpers
  roundToDecimals(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },

  isInteger(value) {
    return Number.isInteger(value);
  },

  isPositive(value) {
    return value > 0;
  },

  isNegative(value) {
    return value < 0;
  },

  // Safe division
  safeDivide(numerator, denominator, fallback = 0) {
    return denominator === 0 ? fallback : numerator / denominator;
  }
};

// Game-specific math functions
const GameMath = {
  // Calculate generator efficiency based on upgrades
  calculateGeneratorEfficiency(baseValue, speedLevel, goldLevel, luckLevel) {
    const speedMultiplier = 1 + (speedLevel * 0.1); // 10% per level
    const goldMultiplier = 1 + (goldLevel * 0.15);  // 15% per level
    const luckBonus = MathUtils.calculateLuckBonus(luckLevel);
    
    return MathUtils.floorMultiply(
      baseValue * speedMultiplier * goldMultiplier, 
      1 + luckBonus
    );
  },

  // Calculate building bonus
  calculateBuildingBonus(buildingType) {
    return GameConstants.MULTIPLIERS.BUILDING_BONUS[buildingType] || 1.0;
  },

  // Calculate skill effect duration
  calculateSkillDuration(baseEffect, level) {
    return baseEffect + (level * 1000); // +1 second per level
  },

  // Calculate offline earnings
  calculateOfflineEarnings(gps, timeAwayMs, maxHours = 24) {
    const maxTimeMs = maxHours * 60 * 60 * 1000;
    const cappedTime = Math.min(timeAwayMs, maxTimeMs);
    const seconds = cappedTime / 1000;
    
    return Math.floor(gps * seconds * 0.8); // 80% efficiency offline
  },

  // Calculate research time reduction
  calculateResearchSpeedup(baseTime, speedupLevel) {
    const reduction = speedupLevel * 0.05; // 5% per level
    const multiplier = Math.max(0.1, 1 - reduction); // Minimum 10% of original time
    
    return Math.floor(baseTime * multiplier);
  }
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MathUtils, GameMath };
}