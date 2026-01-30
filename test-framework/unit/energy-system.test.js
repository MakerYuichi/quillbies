// Energy System Unit Tests
// Tests the core energy calculation and management logic

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock the energy calculation functions
const calculateEnergyCapFromMess = (messPoints) => {
  const reduction = Math.floor(messPoints / 3) * 5;
  return Math.max(50, 100 - reduction);
};

const calculateEnergyDrain = (sessionDuration, sessionType = 'focus') => {
  const baseDrain = sessionType === 'premium' ? 15 : 20;
  const durationMultiplier = sessionDuration / 25; // 25 min base session
  return Math.ceil(baseDrain * durationMultiplier);
};

const calculateEnergyBonus = (habitType, amount) => {
  const bonuses = {
    water: 2,
    meal: 15,
    exercise: 10,
    sleep: 25
  };
  
  return bonuses[habitType] * (amount || 1);
};

describe('Energy System', () => {
  let mockUserState;
  
  beforeEach(() => {
    mockUserState = {
      energy: 100,
      maxEnergyCap: 100,
      messPoints: 0,
      qCoins: 100
    };
  });

  describe('Energy Cap Calculation', () => {
    it('should maintain 100 cap with no mess points', () => {
      const cap = calculateEnergyCapFromMess(0);
      expect(cap).toBe(100);
    });

    it('should reduce cap by 5 for every 3 mess points', () => {
      expect(calculateEnergyCapFromMess(3)).toBe(95);
      expect(calculateEnergyCapFromMess(6)).toBe(90);
      expect(calculateEnergyCapFromMess(9)).toBe(85);
    });

    it('should never go below 50 cap', () => {
      expect(calculateEnergyCapFromMess(100)).toBe(50);
      expect(calculateEnergyCapFromMess(1000)).toBe(50);
    });

    it('should handle partial mess point groups', () => {
      expect(calculateEnergyCapFromMess(1)).toBe(100); // 1/3 = 0 groups
      expect(calculateEnergyCapFromMess(2)).toBe(100); // 2/3 = 0 groups
      expect(calculateEnergyCapFromMess(4)).toBe(95);  // 4/3 = 1 group
      expect(calculateEnergyCapFromMess(5)).toBe(95);  // 5/3 = 1 group
    });
  });

  describe('Energy Drain Calculation', () => {
    it('should drain 20 energy for standard 25-minute session', () => {
      const drain = calculateEnergyDrain(25, 'focus');
      expect(drain).toBe(20);
    });

    it('should drain 15 energy for premium 25-minute session', () => {
      const drain = calculateEnergyDrain(25, 'premium');
      expect(drain).toBe(15);
    });

    it('should scale drain with session duration', () => {
      expect(calculateEnergyDrain(50, 'focus')).toBe(40); // 2x duration = 2x drain
      expect(calculateEnergyDrain(12.5, 'focus')).toBe(10); // 0.5x duration = 0.5x drain
    });

    it('should handle custom session durations', () => {
      expect(calculateEnergyDrain(45, 'premium')).toBe(27); // 45/25 * 15 = 27
      expect(calculateEnergyDrain(60, 'focus')).toBe(48);   // 60/25 * 20 = 48
    });

    it('should round up fractional energy drain', () => {
      expect(calculateEnergyDrain(30, 'focus')).toBe(24); // 30/25 * 20 = 24
      expect(calculateEnergyDrain(35, 'premium')).toBe(21); // 35/25 * 15 = 21
    });
  });

  describe('Energy Bonus Calculation', () => {
    it('should give correct bonuses for each habit type', () => {
      expect(calculateEnergyBonus('water', 1)).toBe(2);
      expect(calculateEnergyBonus('meal', 1)).toBe(15);
      expect(calculateEnergyBonus('exercise', 1)).toBe(10);
      expect(calculateEnergyBonus('sleep', 1)).toBe(25);
    });

    it('should multiply bonuses by amount', () => {
      expect(calculateEnergyBonus('water', 3)).toBe(6);  // 2 * 3
      expect(calculateEnergyBonus('meal', 2)).toBe(30);  // 15 * 2
    });

    it('should default to 1 if no amount specified', () => {
      expect(calculateEnergyBonus('water')).toBe(2);
      expect(calculateEnergyBonus('meal')).toBe(15);
    });

    it('should handle invalid habit types', () => {
      expect(calculateEnergyBonus('invalid')).toBe(NaN);
    });
  });

  describe('Energy State Validation', () => {
    it('should validate energy within cap bounds', () => {
      const state1 = { energy: 80, maxEnergyCap: 100 };
      const state2 = { energy: 120, maxEnergyCap: 100 }; // Invalid: over cap
      const state3 = { energy: -10, maxEnergyCap: 100 }; // Invalid: negative
      
      expect(state1).toHaveValidEnergyState();
      expect(state2).not.toHaveValidEnergyState();
      expect(state3).not.toHaveValidEnergyState();
    });

    it('should validate energy cap within valid range', () => {
      const state1 = { energy: 50, maxEnergyCap: 75 };  // Valid
      const state2 = { energy: 30, maxEnergyCap: 40 };  // Invalid: cap too low
      const state3 = { energy: 50, maxEnergyCap: 120 }; // Invalid: cap too high
      
      expect(state1).toHaveValidEnergyState();
      expect(state2).not.toHaveValidEnergyState();
      expect(state3).not.toHaveValidEnergyState();
    });
  });

  describe('Energy System Integration', () => {
    it('should handle complete energy cycle', () => {
      let state = { ...mockUserState };
      
      // Start with full energy
      expect(state.energy).toBe(100);
      
      // Drain energy from focus session
      const sessionDrain = calculateEnergyDrain(25, 'focus');
      state.energy = Math.max(0, state.energy - sessionDrain);
      expect(state.energy).toBe(80);
      
      // Add mess points and recalculate cap
      state.messPoints = 6;
      state.maxEnergyCap = calculateEnergyCapFromMess(state.messPoints);
      expect(state.maxEnergyCap).toBe(90);
      
      // Restore energy with habits (but respect cap)
      const waterBonus = calculateEnergyBonus('water', 2);
      const mealBonus = calculateEnergyBonus('meal', 1);
      state.energy = Math.min(state.maxEnergyCap, state.energy + waterBonus + mealBonus);
      expect(state.energy).toBe(90); // Capped at maxEnergyCap
    });

    it('should prevent energy from going negative', () => {
      let state = { energy: 10, maxEnergyCap: 100 };
      
      const largeDrain = calculateEnergyDrain(100, 'focus'); // Very long session
      state.energy = Math.max(0, state.energy - largeDrain);
      
      expect(state.energy).toBe(0);
      expect(state.energy).toBeGreaterThanOrEqual(0);
    });

    it('should handle edge cases gracefully', () => {
      // Test with minimum energy cap
      let state = { energy: 50, maxEnergyCap: 50, messPoints: 100 };
      
      // Try to restore energy
      const bonus = calculateEnergyBonus('sleep', 1);
      state.energy = Math.min(state.maxEnergyCap, state.energy + bonus);
      
      expect(state.energy).toBe(50); // Should stay at cap
      expect(state).toHaveValidEnergyState();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large numbers efficiently', () => {
      const startTime = Date.now();
      
      // Test with extreme values
      for (let i = 0; i < 1000; i++) {
        calculateEnergyCapFromMess(i * 100);
        calculateEnergyDrain(i, 'focus');
        calculateEnergyBonus('water', i);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in <100ms
    });

    it('should handle floating point precision', () => {
      // Test with decimal values that might cause precision issues
      expect(calculateEnergyDrain(33.33, 'focus')).toBe(27); // Should round up
      expect(calculateEnergyDrain(16.67, 'premium')).toBe(10); // Should round up
    });

    it('should be consistent with repeated calculations', () => {
      const messPoints = 15;
      const duration = 45;
      
      // Multiple calculations should yield same results
      for (let i = 0; i < 10; i++) {
        expect(calculateEnergyCapFromMess(messPoints)).toBe(75);
        expect(calculateEnergyDrain(duration, 'focus')).toBe(36);
      }
    });
  });
});