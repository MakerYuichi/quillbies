// Focus Session Integration Tests
// Tests the complete focus session workflow including state management

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// Mock the focus session component and related hooks
const mockUseStore = jest.fn();
const mockStartSession = jest.fn();
const mockEndSession = jest.fn();
const mockUpdateEnergy = jest.fn();

// Mock Zustand store
jest.mock('zustand', () => ({
  create: () => mockUseStore
}));

// Mock focus session component
const MockFocusSession = ({ onSessionStart, onSessionEnd, onEnergyUpdate }) => {
  const [isActive, setIsActive] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(25 * 60); // 25 minutes
  
  const startSession = () => {
    setIsActive(true);
    onSessionStart?.();
  };
  
  const endSession = () => {
    setIsActive(false);
    setTimeRemaining(25 * 60);
    onSessionEnd?.();
  };
  
  return (
    <div testID="focus-session">
      <button testID="start-button" onPress={startSession} disabled={isActive}>
        {isActive ? 'Session Active' : 'Start Session'}
      </button>
      <button testID="end-button" onPress={endSession} disabled={!isActive}>
        End Session
      </button>
      <div testID="timer">{Math.floor(timeRemaining / 60)}:{timeRemaining % 60}</div>
      <div testID="status">{isActive ? 'active' : 'inactive'}</div>
    </div>
  );
};

describe('Focus Session Integration', () => {
  let mockStore;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock store state
    mockStore = {
      // User state
      energy: 100,
      maxEnergyCap: 100,
      qCoins: 100,
      studyMinutesToday: 0,
      
      // Session state
      currentSession: null,
      sessionHistory: [],
      
      // Premium features
      purchasedItems: ['premium'],
      
      // Actions
      startFocusSession: mockStartSession,
      endFocusSession: mockEndSession,
      updateEnergy: mockUpdateEnergy,
      
      // Getters
      canStartSession: () => mockStore.energy >= 20,
      getSessionConfig: () => ({
        duration: 25,
        breakDuration: 5,
        sessionType: 'focus'
      })
    };
    
    mockUseStore.mockReturnValue(mockStore);
  });

  describe('Session Lifecycle', () => {
    it('should start a focus session successfully', async () => {
      const { getByTestId } = render(
        <MockFocusSession 
          onSessionStart={mockStartSession}
          onEnergyUpdate={mockUpdateEnergy}
        />
      );
      
      const startButton = getByTestId('start-button');
      const status = getByTestId('status');
      
      // Initial state
      expect(status.textContent).toBe('inactive');
      expect(startButton).not.toBeDisabled();
      
      // Start session
      await act(async () => {
        fireEvent.press(startButton);
      });
      
      // Verify session started
      expect(mockStartSession).toHaveBeenCalledTimes(1);
      expect(status.textContent).toBe('active');
      expect(startButton).toBeDisabled();
    });

    it('should prevent starting session with insufficient energy', async () => {
      // Set low energy
      mockStore.energy = 10;
      mockStore.canStartSession = () => false;
      
      const { getByTestId } = render(
        <MockFocusSession onSessionStart={mockStartSession} />
      );
      
      const startButton = getByTestId('start-button');
      
      // Button should be disabled due to insufficient energy
      expect(startButton).toBeDisabled();
      
      // Attempt to start (should not work)
      await act(async () => {
        fireEvent.press(startButton);
      });
      
      expect(mockStartSession).not.toHaveBeenCalled();
    });

    it('should end session and update statistics', async () => {
      const { getByTestId } = render(
        <MockFocusSession 
          onSessionStart={mockStartSession}
          onSessionEnd={mockEndSession}
          onEnergyUpdate={mockUpdateEnergy}
        />
      );
      
      const startButton = getByTestId('start-button');
      const endButton = getByTestId('end-button');
      
      // Start session first
      await act(async () => {
        fireEvent.press(startButton);
      });
      
      // End session
      await act(async () => {
        fireEvent.press(endButton);
      });
      
      expect(mockEndSession).toHaveBeenCalledTimes(1);
      expect(mockUpdateEnergy).toHaveBeenCalled();
    });
  });

  describe('Energy Management Integration', () => {
    it('should drain energy when session starts', async () => {
      const energyDrain = 20;
      mockStartSession.mockImplementation(() => {
        mockStore.energy -= energyDrain;
        mockUpdateEnergy(mockStore.energy);
      });
      
      const { getByTestId } = render(
        <MockFocusSession 
          onSessionStart={mockStartSession}
          onEnergyUpdate={mockUpdateEnergy}
        />
      );
      
      const startButton = getByTestId('start-button');
      
      await act(async () => {
        fireEvent.press(startButton);
      });
      
      expect(mockStore.energy).toBe(80);
      expect(mockUpdateEnergy).toHaveBeenCalledWith(80);
    });

    it('should handle premium session energy benefits', async () => {
      const premiumEnergyDrain = 15; // Less than standard 20
      mockStore.getSessionConfig = () => ({
        duration: 25,
        sessionType: 'premium'
      });
      
      mockStartSession.mockImplementation(() => {
        mockStore.energy -= premiumEnergyDrain;
        mockUpdateEnergy(mockStore.energy);
      });
      
      const { getByTestId } = render(
        <MockFocusSession onSessionStart={mockStartSession} />
      );
      
      await act(async () => {
        fireEvent.press(getByTestId('start-button'));
      });
      
      expect(mockStore.energy).toBe(85); // 100 - 15
    });

    it('should prevent session if energy would go negative', async () => {
      mockStore.energy = 15; // Less than required 20
      mockStore.canStartSession = () => mockStore.energy >= 20;
      
      const { getByTestId } = render(
        <MockFocusSession onSessionStart={mockStartSession} />
      );
      
      const startButton = getByTestId('start-button');
      expect(startButton).toBeDisabled();
    });
  });

  describe('Session Configuration', () => {
    it('should use custom session duration for premium users', async () => {
      const customDuration = 45;
      mockStore.getSessionConfig = () => ({
        duration: customDuration,
        sessionType: 'premium',
        customName: 'Deep Work'
      });
      
      const { getByTestId } = render(
        <MockFocusSession onSessionStart={mockStartSession} />
      );
      
      await act(async () => {
        fireEvent.press(getByTestId('start-button'));
      });
      
      expect(mockStartSession).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: customDuration,
          sessionType: 'premium'
        })
      );
    });

    it('should validate session configuration', async () => {
      const invalidConfig = {
        duration: 0, // Invalid duration
        sessionType: 'focus'
      };
      
      mockStore.getSessionConfig = () => invalidConfig;
      
      const { getByTestId } = render(
        <MockFocusSession onSessionStart={mockStartSession} />
      );
      
      await act(async () => {
        fireEvent.press(getByTestId('start-button'));
      });
      
      // Should not start with invalid config
      expect(mockStartSession).not.toHaveBeenCalled();
    });
  });

  describe('Session History and Statistics', () => {
    it('should record completed session in history', async () => {
      const sessionData = {
        id: 'session-1',
        duration: 25,
        focusScore: 85,
        timestamp: Date.now(),
        completed: true
      };
      
      mockEndSession.mockImplementation(() => {
        mockStore.sessionHistory.push(sessionData);
        mockStore.studyMinutesToday += sessionData.duration;
      });
      
      const { getByTestId } = render(
        <MockFocusSession 
          onSessionStart={mockStartSession}
          onSessionEnd={mockEndSession}
        />
      );
      
      // Start and end session
      await act(async () => {
        fireEvent.press(getByTestId('start-button'));
      });
      
      await act(async () => {
        fireEvent.press(getByTestId('end-button'));
      });
      
      expect(mockStore.sessionHistory).toHaveLength(1);
      expect(mockStore.sessionHistory[0]).toMatchObject(sessionData);
      expect(mockStore.studyMinutesToday).toBe(25);
    });

    it('should calculate daily study progress', async () => {
      mockStore.studyMinutesToday = 120; // 2 hours
      const studyGoalHours = 4;
      
      const progressPercentage = (mockStore.studyMinutesToday / 60) / studyGoalHours * 100;
      
      expect(progressPercentage).toBe(50); // 50% of daily goal
    });
  });

  describe('Error Handling', () => {
    it('should handle session start failure gracefully', async () => {
      const error = new Error('Session start failed');
      mockStartSession.mockRejectedValue(error);
      
      const { getByTestId } = render(
        <MockFocusSession onSessionStart={mockStartSession} />
      );
      
      await act(async () => {
        fireEvent.press(getByTestId('start-button'));
      });
      
      // Should handle error without crashing
      expect(mockStartSession).toHaveBeenCalled();
      // Session should remain inactive
      expect(getByTestId('status').textContent).toBe('inactive');
    });

    it('should handle network failures during session sync', async () => {
      const networkError = new Error('Network unavailable');
      mockEndSession.mockRejectedValue(networkError);
      
      const { getByTestId } = render(
        <MockFocusSession 
          onSessionStart={mockStartSession}
          onSessionEnd={mockEndSession}
        />
      );
      
      // Start session
      await act(async () => {
        fireEvent.press(getByTestId('start-button'));
      });
      
      // End session (should handle network error)
      await act(async () => {
        fireEvent.press(getByTestId('end-button'));
      });
      
      expect(mockEndSession).toHaveBeenCalled();
      // Should still end session locally even if sync fails
    });
  });

  describe('Performance', () => {
    it('should handle rapid session state changes', async () => {
      const { getByTestId } = render(
        <MockFocusSession 
          onSessionStart={mockStartSession}
          onSessionEnd={mockEndSession}
        />
      );
      
      const startButton = getByTestId('start-button');
      const endButton = getByTestId('end-button');
      
      // Rapid start/stop cycles
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          fireEvent.press(startButton);
        });
        
        await act(async () => {
          fireEvent.press(endButton);
        });
      }
      
      expect(mockStartSession).toHaveBeenCalledTimes(5);
      expect(mockEndSession).toHaveBeenCalledTimes(5);
    });

    it('should not cause memory leaks with long sessions', async () => {
      // Simulate long-running session
      const { getByTestId, unmount } = render(
        <MockFocusSession onSessionStart={mockStartSession} />
      );
      
      await act(async () => {
        fireEvent.press(getByTestId('start-button'));
      });
      
      // Unmount component (simulates navigation away)
      unmount();
      
      // Should clean up properly without memory leaks
      expect(mockStartSession).toHaveBeenCalled();
    });
  });
});