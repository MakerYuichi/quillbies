import React from 'react';
import SessionCustomizationModal, { SessionConfig } from '../modals/SessionCustomizationModal';
import ExerciseCustomizationModal from '../modals/ExerciseCustomizationModal';
import SleepCustomizationModal from '../modals/SleepCustomizationModal';

interface HomeModalsProps {
  showSessionModal: boolean;
  showExerciseModal: boolean;
  showSleepModal: boolean;
  onCloseSessionModal: () => void;
  onCloseExerciseModal: () => void;
  onCloseSleepModal: () => void;
  onSessionStart: (config: SessionConfig) => void;
  onExerciseStart: (duration: number | null, type: 'walk' | 'stretch' | 'cardio' | 'energizer' | 'custom') => void;
  onSleepStart: (duration: number | null) => void;
  userData: any;
}

export default function HomeModals({
  showSessionModal,
  showExerciseModal,
  showSleepModal,
  onCloseSessionModal,
  onCloseExerciseModal,
  onCloseSleepModal,
  onSessionStart,
  onExerciseStart,
  onSleepStart,
  userData
}: HomeModalsProps) {
  return (
    <>
      {/* Session Customization Modal */}
      <SessionCustomizationModal
        visible={showSessionModal}
        onClose={onCloseSessionModal}
        onStartSession={onSessionStart}
        isPremium={userData.purchasedItems?.includes('premium') || false}
      />

      {/* Exercise Customization Modal */}
      <ExerciseCustomizationModal
        visible={showExerciseModal}
        onClose={onCloseExerciseModal}
        onStartExercise={onExerciseStart}
        isPremium={userData.purchasedItems?.includes('premium') || false}
      />

      {/* Sleep Customization Modal */}
      <SleepCustomizationModal
        visible={showSleepModal}
        onClose={onCloseSleepModal}
        onStartSleep={onSleepStart}
      />
    </>
  );
}