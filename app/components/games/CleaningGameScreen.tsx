import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { soundManager, SOUNDS } from '../../../lib/soundManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CleaningGameScreenProps {
  visible: boolean;
  messPoints: number;
  onComplete: (messPointsReduced: number) => void;
  onClose: () => void;
}

export default function CleaningGameScreen({
  visible,
  messPoints,
  onComplete,
  onClose,
}: CleaningGameScreenProps) {
  const [tapsNeeded, setTapsNeeded] = useState(0);
  const [currentTaps, setCurrentTaps] = useState(0);
  const [stage, setStage] = useState(1);
  const [totalStages, setTotalStages] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [dustClouds, setDustClouds] = useState<Array<{id: number, x: number, y: number, opacity: Animated.Value}>>([]);

  // Initialize game based on mess points
  useEffect(() => {
    if (visible && messPoints > 5) {
      // Calculate stages and taps based on mess level
      let stages = 1;
      let tapsPerStage = 10;
      
      if (messPoints <= 10) {
        stages = 2; // Light cleaning: 2 stages
        tapsPerStage = 8;
      } else if (messPoints <= 20) {
        stages = 3; // Medium cleaning: 3 stages
        tapsPerStage = 12;
      } else {
        stages = 4; // Deep cleaning: 4 stages
        tapsPerStage = 15;
      }
      
      setTotalStages(stages);
      setTapsNeeded(tapsPerStage);
      setCurrentTaps(0);
      setStage(1);
      setIsCompleted(false);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, messPoints, fadeAnim]);

  const handleTap = () => {
    if (isCompleted) return;
    
    console.log('[CleaningGame] Tap detected, creating dust cloud...');
    
    // Create dust cloud animation
    const dustId = Date.now();
    const dustX = Math.random() * 160 - 80; // Random position around tap area
    const dustY = Math.random() * 160 - 80;
    const dustOpacity = new Animated.Value(1);
    
    console.log('[CleaningGame] Dust cloud created at:', dustX, dustY);
    
    setDustClouds(prev => [...prev, { id: dustId, x: dustX, y: dustY, opacity: dustOpacity }]);
    
    // Animate dust cloud fading out
    Animated.timing(dustOpacity, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setDustClouds(prev => prev.filter(cloud => cloud.id !== dustId));
    });
    
    // Play cleaning sound based on stage (use scrub as fallback for broom)
    const sound = stage === 1 ? SOUNDS.SCRUB : stage === 2 ? SOUNDS.SCRUB : SOUNDS.DEEP_CLEAN;
    console.log('[CleaningGame] Playing sound:', sound, 'for stage:', stage);
    soundManager.playSound(sound, 1.0, 0.6);
    
    const newTaps = currentTaps + 1;
    setCurrentTaps(newTaps);
    
    if (newTaps >= tapsNeeded) {
      // Stage completed
      if (stage >= totalStages) {
        // All stages completed - finish cleaning
        setIsCompleted(true);
        
        // Calculate mess points reduced based on cleaning level
        let messReduced = 0;
        if (messPoints <= 10) messReduced = Math.min(messPoints, 6); // Light cleaning
        else if (messPoints <= 20) messReduced = Math.min(messPoints, 12); // Medium cleaning
        else messReduced = Math.min(messPoints, 18); // Deep cleaning
        
        setTimeout(() => {
          onComplete(messReduced);
        }, 1500);
      } else {
        // Move to next stage
        setStage(stage + 1);
        setCurrentTaps(0);
        // Slightly increase taps needed for next stage
        setTapsNeeded(Math.floor(tapsNeeded * 1.1));
      }
    }
  };

  const getStageText = () => {
    if (isCompleted) return '✨ Room Cleaned! ✨';
    
    switch (stage) {
      case 1: return '🧹 Sweeping...';
      case 2: return '🧽 Scrubbing...';
      case 3: return '🚿 Washing...';
      case 4: return '✨ Polishing...';
      default: return '🧹 Cleaning...';
    }
  };

  const getProgressPercent = () => {
    return Math.min(100, (currentTaps / tapsNeeded) * 100);
  };

  const getBackgroundColor = () => {
    if (messPoints <= 10) return '#FFF3E0'; // Light orange for light mess
    if (messPoints <= 20) return '#FFE0B2'; // Medium orange for medium mess
    return '#FFCCBC'; // Darker orange for heavy mess
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.gameContainer,
            { backgroundColor: getBackgroundColor(), opacity: fadeAnim }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Cleaning Time!</Text>
            <Text style={styles.subtitle}>
              Stage {stage} of {totalStages}
            </Text>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.stageText}>{getStageText()}</Text>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercent()}%` }
                ]}
              />
            </View>
            
            <Text style={styles.progressText}>
              {currentTaps} / {tapsNeeded} taps
            </Text>
          </View>

          {/* Tap Area */}
          {!isCompleted ? (
            <View style={styles.tapAreaContainer}>
              <TouchableOpacity
                style={styles.tapArea}
                onPress={handleTap}
                activeOpacity={0.7}
              >
                <Text style={styles.tapText}>
                  TAP TO CLEAN
                </Text>
                <Text style={styles.tapEmoji}>
                  {stage === 1 ? '🧹' : stage === 2 ? '🧽' : stage === 3 ? '🚿' : '✨'}
                </Text>
              </TouchableOpacity>
              
              {/* Dust clouds */}
              {dustClouds.map(cloud => (
                <Animated.View
                  key={cloud.id}
                  style={[
                    styles.dustCloud,
                    {
                      left: 100 + cloud.x,
                      top: 100 + cloud.y,
                      opacity: cloud.opacity,
                    }
                  ]}
                >
                  <Text style={styles.dustEmoji}>💨</Text>
                </Animated.View>
              ))}
            </View>
          ) : (
            <View style={styles.completedArea}>
              <Text style={styles.completedText}>
                Great job! Your room is much cleaner now! 🎉
              </Text>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={onClose}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 24,
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  stageText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 20,
    color: '#333',
    marginBottom: 15,
  },
  progressBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  progressText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 14,
    color: '#666',
  },
  tapAreaContainer: {
    position: 'relative',
    width: 200,
    height: 200,
  },
  tapArea: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dustCloud: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dustEmoji: {
    fontSize: 30,
  },
  tapText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 18,
    color: '#FFF',
    marginBottom: 10,
  },
  tapEmoji: {
    fontSize: 40,
  },
  completedArea: {
    alignItems: 'center',
    padding: 20,
  },
  completedText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  doneButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
});