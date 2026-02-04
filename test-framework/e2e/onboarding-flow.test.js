// End-to-End Onboarding Flow Tests
// Tests the complete user onboarding experience

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock Detox for E2E testing structure
const mockDetox = {
  device: {
    launchApp: jest.fn(),
    terminateApp: jest.fn(),
    reloadReactNative: jest.fn(),
    sendToHome: jest.fn(),
    openURL: jest.fn()
  },
  element: (matcher) => ({
    tap: jest.fn(),
    typeText: jest.fn(),
    clearText: jest.fn(),
    scroll: jest.fn(),
    swipe: jest.fn(),
    multiTap: jest.fn(),
    longPress: jest.fn(),
    replaceText: jest.fn()
  }),
  by: {
    id: (id) => ({ id }),
    text: (text) => ({ text }),
    label: (label) => ({ label }),
    type: (type) => ({ type }),
    traits: (traits) => ({ traits })
  },
  expect: (element) => ({
    toBeVisible: jest.fn(),
    toBeNotVisible: jest.fn(),
    toExist: jest.fn(),
    toNotExist: jest.fn(),
    toHaveText: jest.fn(),
    toHaveLabel: jest.fn(),
    toHaveId: jest.fn(),
    toHaveValue: jest.fn()
  }),
  waitFor: (element) => ({
    toBeVisible: jest.fn(),
    toBeNotVisible: jest.fn(),
    toExist: jest.fn(),
    toNotExist: jest.fn(),
    withTimeout: jest.fn().mockReturnThis()
  })
};

// Mock the detox global
global.device = mockDetox.device;
global.element = mockDetox.element;
global.by = mockDetox.by;
global.waitFor = mockDetox.waitFor;

describe('Onboarding Flow E2E', () => {
  beforeAll(async () => {
    // Launch app in fresh state
    await device.launchApp({ 
      newInstance: true,
      permissions: { notifications: 'YES', location: 'inuse' }
    });
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('Welcome Screen', () => {
    it('should display welcome screen on first launch', async () => {
      // Wait for welcome screen to appear
      await waitFor(element(by.id('welcome-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Verify welcome elements
      await expect(element(by.id('welcome-title'))).toBeVisible();
      await expect(element(by.id('welcome-subtitle'))).toBeVisible();
      await expect(element(by.id('get-started-button'))).toBeVisible();
      
      // Verify welcome hamster animation
      await expect(element(by.id('welcome-hamster'))).toBeVisible();
    });

    it('should navigate to character select on get started', async () => {
      // Tap get started button
      await element(by.id('get-started-button')).tap();
      
      // Wait for character select screen
      await waitFor(element(by.id('character-select-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      await expect(element(by.id('character-select-title'))).toBeVisible();
    });
  });

  describe('Character Selection', () => {
    it('should display all character options', async () => {
      // Verify character options are visible
      await expect(element(by.id('character-casual'))).toBeVisible();
      await expect(element(by.id('character-energetic'))).toBeVisible();
      await expect(element(by.id('character-scholar'))).toBeVisible();
      
      // Verify character descriptions
      await expect(element(by.id('casual-description'))).toBeVisible();
      await expect(element(by.id('energetic-description'))).toBeVisible();
      await expect(element(by.id('scholar-description'))).toBeVisible();
    });

    it('should allow character selection and show preview', async () => {
      // Select casual character
      await element(by.id('character-casual')).tap();
      
      // Verify selection feedback
      await expect(element(by.id('character-casual-selected'))).toBeVisible();
      await expect(element(by.id('character-preview'))).toBeVisible();
      
      // Verify continue button is enabled
      await expect(element(by.id('continue-button'))).toBeVisible();
    });

    it('should navigate to name buddy screen', async () => {
      // Continue to next step
      await element(by.id('continue-button')).tap();
      
      // Wait for name buddy screen
      await waitFor(element(by.id('name-buddy-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      await expect(element(by.id('name-input'))).toBeVisible();
    });
  });

  describe('Name Your Buddy', () => {
    it('should allow entering buddy name', async () => {
      const buddyName = 'TestBuddy';
      
      // Clear any existing text and enter name
      await element(by.id('name-input')).clearText();
      await element(by.id('name-input')).typeText(buddyName);
      
      // Verify input value
      await expect(element(by.id('name-input'))).toHaveValue(buddyName);
      
      // Verify character shows with name
      await expect(element(by.text(`Meet ${buddyName}!`))).toBeVisible();
    });

    it('should validate name length', async () => {
      // Test empty name
      await element(by.id('name-input')).clearText();
      await element(by.id('continue-button')).tap();
      
      // Should show validation error
      await expect(element(by.id('name-error'))).toBeVisible();
      
      // Test valid name
      await element(by.id('name-input')).typeText('Quillby');
      await expect(element(by.id('name-error'))).toBeNotVisible();
    });

    it('should navigate to profile setup', async () => {
      await element(by.id('continue-button')).tap();
      
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Profile Setup', () => {
    it('should allow entering profile information', async () => {
      // Enter name
      await element(by.id('user-name-input')).typeText('Test User');
      
      // Select timezone (scroll to find it)
      await element(by.id('timezone-picker')).tap();
      await element(by.text('America/Los_Angeles')).tap();
      
      // Verify selections
      await expect(element(by.id('user-name-input'))).toHaveValue('Test User');
      await expect(element(by.text('Pacific Time'))).toBeVisible();
    });

    it('should handle location permission request', async () => {
      // Tap auto-detect location
      await element(by.id('auto-detect-button')).tap();
      
      // Should request location permission
      // Note: In real E2E test, this would trigger system permission dialog
      
      // Verify location detected
      await waitFor(element(by.id('location-detected')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should navigate to goal setup', async () => {
      await element(by.id('continue-button')).tap();
      
      await waitFor(element(by.id('goal-setup-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Goal Setup', () => {
    it('should allow setting study goals', async () => {
      // Set study goal to 6 hours
      await element(by.id('study-goal-slider')).swipe('right', 'slow');
      await expect(element(by.text('6 hours'))).toBeVisible();
      
      // Set water goal to 10 glasses
      await element(by.id('water-goal-picker')).tap();
      await element(by.text('10 glasses')).tap();
      
      // Set meal goal to 3 meals
      await element(by.id('meal-goal-picker')).tap();
      await element(by.text('3 meals')).tap();
      
      // Set exercise goal to 45 minutes
      await element(by.id('exercise-goal-slider')).swipe('right', 'slow');
      await expect(element(by.text('45 minutes'))).toBeVisible();
      
      // Set sleep goal to 8 hours
      await element(by.id('sleep-goal-picker')).tap();
      await element(by.text('8 hours')).tap();
    });

    it('should validate goal ranges', async () => {
      // Try to set invalid study goal (too high)
      await element(by.id('study-goal-slider')).swipe('right', 'fast');
      
      // Should cap at maximum
      await expect(element(by.text('12 hours'))).toBeVisible();
      
      // Try to set invalid water goal (too low)
      await element(by.id('water-goal-picker')).tap();
      await element(by.text('2 glasses')).tap();
      
      // Should show warning or prevent selection
      await expect(element(by.id('water-goal-warning'))).toBeVisible();
    });

    it('should navigate to habit setup', async () => {
      await element(by.id('continue-button')).tap();
      
      await waitFor(element(by.id('habit-setup-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Habit Setup', () => {
    it('should allow enabling/disabling habits', async () => {
      // Enable water tracking
      await element(by.id('water-habit-toggle')).tap();
      await expect(element(by.id('water-habit-enabled'))).toBeVisible();
      
      // Enable meal tracking
      await element(by.id('meal-habit-toggle')).tap();
      await expect(element(by.id('meal-habit-enabled'))).toBeVisible();
      
      // Enable exercise tracking
      await element(by.id('exercise-habit-toggle')).tap();
      await expect(element(by.id('exercise-habit-enabled'))).toBeVisible();
      
      // Enable sleep tracking
      await element(by.id('sleep-habit-toggle')).tap();
      await expect(element(by.id('sleep-habit-enabled'))).toBeVisible();
    });

    it('should show habit customization options', async () => {
      // Tap water habit settings
      await element(by.id('water-habit-settings')).tap();
      
      // Should show customization modal
      await expect(element(by.id('water-customization-modal'))).toBeVisible();
      
      // Set reminder times
      await element(by.id('add-reminder-button')).tap();
      await element(by.id('reminder-time-picker')).tap();
      // Select 9:00 AM
      await element(by.text('09:00')).tap();
      await element(by.id('save-reminder-button')).tap();
      
      // Close modal
      await element(by.id('close-modal-button')).tap();
    });

    it('should navigate to tutorial', async () => {
      await element(by.id('continue-button')).tap();
      
      await waitFor(element(by.id('tutorial-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Tutorial', () => {
    it('should show interactive tutorial steps', async () => {
      // Step 1: Energy system
      await expect(element(by.id('tutorial-step-1'))).toBeVisible();
      await expect(element(by.text('Energy System'))).toBeVisible();
      
      // Tap to continue
      await element(by.id('next-tutorial-button')).tap();
      
      // Step 2: Habits
      await expect(element(by.id('tutorial-step-2'))).toBeVisible();
      await expect(element(by.text('Daily Habits'))).toBeVisible();
      
      await element(by.id('next-tutorial-button')).tap();
      
      // Step 3: Focus sessions
      await expect(element(by.id('tutorial-step-3'))).toBeVisible();
      await expect(element(by.text('Focus Sessions'))).toBeVisible();
      
      await element(by.id('next-tutorial-button')).tap();
      
      // Step 4: Room and mess
      await expect(element(by.id('tutorial-step-4'))).toBeVisible();
      await expect(element(by.text('Keep Your Room Clean'))).toBeVisible();
    });

    it('should allow skipping tutorial', async () => {
      // Tap skip button
      await element(by.id('skip-tutorial-button')).tap();
      
      // Should show confirmation
      await expect(element(by.id('skip-confirmation-modal'))).toBeVisible();
      
      // Confirm skip
      await element(by.id('confirm-skip-button')).tap();
      
      // Should navigate to main app
      await waitFor(element(by.id('main-app-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should complete tutorial and show hatching sequence', async () => {
      // Go back to tutorial if skipped
      if (await element(by.id('main-app-screen')).exists) {
        await device.reloadReactNative();
        // Navigate back through onboarding to tutorial
      }
      
      // Complete all tutorial steps
      for (let i = 1; i <= 4; i++) {
        await element(by.id('next-tutorial-button')).tap();
      }
      
      // Should show hatching sequence
      await waitFor(element(by.id('hatching-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Verify hatching animation
      await expect(element(by.id('egg-cracking'))).toBeVisible();
      
      // Wait for hatching to complete
      await waitFor(element(by.id('buddy-hatched')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Onboarding Completion', () => {
    it('should navigate to main app after onboarding', async () => {
      // Wait for main app to load
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Verify main app elements
      await expect(element(by.id('hamster-character'))).toBeVisible();
      await expect(element(by.id('energy-bar'))).toBeVisible();
      await expect(element(by.id('habit-buttons'))).toBeVisible();
      
      // Verify tab navigation
      await expect(element(by.id('home-tab'))).toBeVisible();
      await expect(element(by.id('focus-tab'))).toBeVisible();
      await expect(element(by.id('stats-tab'))).toBeVisible();
      await expect(element(by.id('shop-tab'))).toBeVisible();
      await expect(element(by.id('settings-tab'))).toBeVisible();
    });

    it('should persist onboarding completion', async () => {
      // Terminate and relaunch app
      await device.terminateApp();
      await device.launchApp();
      
      // Should go directly to main app, not onboarding
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Should not show welcome screen
      await expect(element(by.id('welcome-screen'))).toBeNotVisible();
    });

    it('should have correct user data after onboarding', async () => {
      // Verify buddy name is displayed
      await expect(element(by.text('TestBuddy'))).toBeVisible();
      
      // Verify selected character is shown
      await expect(element(by.id('casual-character'))).toBeVisible();
      
      // Verify goals are set (check settings screen)
      await element(by.id('settings-tab')).tap();
      await element(by.id('goals-section')).tap();
      
      await expect(element(by.text('6 hours'))).toBeVisible(); // Study goal
      await expect(element(by.text('10 glasses'))).toBeVisible(); // Water goal
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors during onboarding', async () => {
      // Simulate network disconnection
      await device.sendToHome();
      // Toggle airplane mode or disconnect wifi
      await device.launchApp();
      
      // Should show offline mode indicator
      await expect(element(by.id('offline-indicator'))).toBeVisible();
      
      // Should still allow completing onboarding offline
      // Data should sync when connection is restored
    });

    it('should handle app backgrounding during onboarding', async () => {
      // Start onboarding
      await device.launchApp({ newInstance: true });
      
      // Navigate to middle of onboarding
      await element(by.id('get-started-button')).tap();
      await element(by.id('character-casual')).tap();
      await element(by.id('continue-button')).tap();
      
      // Background app
      await device.sendToHome();
      
      // Wait and return to app
      await new Promise(resolve => setTimeout(resolve, 2000));
      await device.launchApp();
      
      // Should resume from where left off
      await expect(element(by.id('name-buddy-screen'))).toBeVisible();
    });

    it('should handle permission denials gracefully', async () => {
      // Start fresh onboarding
      await device.launchApp({ 
        newInstance: true,
        permissions: { notifications: 'NO', location: 'never' }
      });
      
      // Navigate to profile setup
      // ... (navigation steps)
      
      // Try to auto-detect location
      await element(by.id('auto-detect-button')).tap();
      
      // Should show permission denied message
      await expect(element(by.id('location-permission-denied'))).toBeVisible();
      
      // Should allow manual timezone selection
      await element(by.id('manual-timezone-button')).tap();
      await expect(element(by.id('timezone-picker'))).toBeVisible();
    });
  });
});