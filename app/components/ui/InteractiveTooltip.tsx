import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TooltipStep {
  id: string;
  title: string;
  description: string;
  position: { top?: number; bottom?: number; left?: number; right?: number };
  arrowDirection: 'up' | 'down' | 'left' | 'right';
  highlightArea?: { top: number; left: number; width: number; height: number };
}

interface InteractiveTooltipProps {
  visible: boolean;
  currentStep: number;
  steps: TooltipStep[];
  onNext: () => void;
  onSkip: () => void;
}

export default function InteractiveTooltip({ 
  visible, 
  currentStep, 
  steps, 
  onNext, 
  onSkip 
}: InteractiveTooltipProps) {
  console.log('[InteractiveTooltip] Render - visible:', visible, 'currentStep:', currentStep, 'totalSteps:', steps.length);
  
  if (!visible || currentStep >= steps.length) {
    console.log('[InteractiveTooltip] Not showing - visible:', visible, 'currentStep:', currentStep);
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  
  console.log('[InteractiveTooltip] Showing step:', step.id, step.title);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      {/* Dark overlay with cutout for highlighted area */}
      <View style={styles.overlay}>
        {step.highlightArea && (
          <>
            {/* Top overlay */}
            <View style={[
              styles.overlaySection,
              { 
                top: 0, 
                left: 0, 
                right: 0, 
                height: step.highlightArea.top 
              }
            ]} />
            
            {/* Left overlay */}
            <View style={[
              styles.overlaySection,
              { 
                top: step.highlightArea.top,
                left: 0,
                width: step.highlightArea.left,
                height: step.highlightArea.height
              }
            ]} />
            
            {/* Right overlay */}
            <View style={[
              styles.overlaySection,
              { 
                top: step.highlightArea.top,
                left: step.highlightArea.left + step.highlightArea.width,
                right: 0,
                height: step.highlightArea.height
              }
            ]} />
            
            {/* Bottom overlay */}
            <View style={[
              styles.overlaySection,
              { 
                top: step.highlightArea.top + step.highlightArea.height,
                left: 0,
                right: 0,
                bottom: 0
              }
            ]} />
            
            {/* Highlight border */}
            <View style={[
              styles.highlightBorder,
              {
                top: step.highlightArea.top - 4,
                left: step.highlightArea.left - 4,
                width: step.highlightArea.width + 8,
                height: step.highlightArea.height + 8,
              }
            ]} />
          </>
        )}
        
        {/* Tooltip box */}
        <View style={[styles.tooltipBox, step.position]}>
          {/* Arrow */}
          <View style={[
            styles.arrow,
            step.arrowDirection === 'up' && styles.arrowUp,
            step.arrowDirection === 'down' && styles.arrowDown,
            step.arrowDirection === 'left' && styles.arrowLeft,
            step.arrowDirection === 'right' && styles.arrowRight,
          ]} />
          
          {/* Content */}
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
          
          {/* Progress dots */}
          <View style={styles.progressDots}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.dotActive
                ]}
              />
            ))}
          </View>
          
          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.nextButton} onPress={onNext}>
              <Text style={styles.nextText}>
                {isLastStep ? "Got it! 🚀" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlaySection: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  highlightBorder: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  tooltipBox: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    maxWidth: SCREEN_WIDTH * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  arrowUp: {
    top: -10,
    left: '50%',
    marginLeft: -10,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFF',
  },
  arrowDown: {
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
  },
  arrowLeft: {
    left: -10,
    top: '50%',
    marginTop: -10,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFF',
  },
  arrowRight: {
    right: -10,
    top: '50%',
    marginTop: -10,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFF',
  },
  title: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DDD',
  },
  dotActive: {
    backgroundColor: '#4CAF50',
    width: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  skipText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#666',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  nextText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#FFF',
  },
});
