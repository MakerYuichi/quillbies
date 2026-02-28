import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  // Status bar background for exercise session
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44, // Standard iOS status bar height
    zIndex: 100, // Above everything
  },
  // Environment container - keeps both environments mounted
  environmentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  // Hidden state - use opacity for instant switching while keeping images in memory
  hidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  // Hamster container - must be above environment layers
  hamsterContainer: {
    position: 'absolute',
    top: 0, // Move up by 20px
    left: 0, // Move left by 15px
    right: 0, // Compensate right to maintain width
    bottom: 0, // Compensate bottom
    zIndex: 10, // Above environment layers (zIndex: 1)
    pointerEvents: 'none',
  },
  // Speech bubble container - now below asset area
  speechBubbleContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 365) / 852, // Below asset area (after 490px)
    left: (SCREEN_WIDTH * 17) / 393,  // Align with original speech bubble positioning
    width: (SCREEN_WIDTH * 355) / 393, // Match speech bubble width
    zIndex: 25, // Above scrollable content (20)
  },
  // Scrollable content area - inside orange theme background, below floor
  scrollableContent: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 490) / 852, // Start below floor (reduced by 90px total from 580)
    left: 0,
    right: 0,
    bottom: (SCREEN_HEIGHT * 30) / 852, // Responsive padding from bottom edge
    zIndex: 20, // Above cleaning overlay (15) and other overlays
    backgroundColor: 'transparent', // Transparent by default to show orange background
  },
  scrollContentContainer: {
    paddingHorizontal: (SCREEN_WIDTH * 17) / 393,
    paddingBottom: (SCREEN_HEIGHT * 20) / 852, // Responsive padding
    flexGrow: 1,
  },
  contentSpacer: {
    flex: 1, // Pushes study section to top, allows scrolling
    minHeight: 50, // Minimum space for scrolling
  },
  // Scrollable energy bar container - first in scroll area
  scrollableEnergyBarContainer: {
    width: (SCREEN_WIDTH * 251) / 280,
    height: (SCREEN_HEIGHT * 25) / 852,
    marginBottom: (SCREEN_HEIGHT * 70) / 852, // Responsive space before buttons
    alignSelf: 'center',
  },
  // Buttons row - relative within bottom area
  buttonsRow: {
    width: (SCREEN_WIDTH * 355) / 393,
    flexDirection: 'row',
    gap: (SCREEN_WIDTH * 6) / 393, // Same gap as original
  },
  // Scrollable buttons row - inside scroll area
  scrollableButtonsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: (SCREEN_WIDTH * 6) / 393,
    marginBottom: (SCREEN_HEIGHT * 20) / 852, // Responsive space before study section
    alignSelf: 'center',
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 8,
  },
  
  // Cleaning-specific overlay - only dims the bottom tab bar area
  cleaningTabBarDimOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90, // Height of tab bar area
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 19, // Just below scrollable content (20) but above tab bar
  },
  
  sleepDimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly lighter dim for sleeping
    zIndex: 8,
  },

  // Cleaning tap overlay - only when cleaning
  cleaningTapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15, // Above room layers (1-10) but below hamster (10) and UI (20+)
    backgroundColor: 'transparent',
  },
  // Cleaning progress display
  cleaningProgress: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    zIndex: 30, // Above everything else so it's always visible
    minWidth: 150,
  },
  cleaningProgressTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  cleaningProgressText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 3,
  },
  cleaningProgressTaps: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  cleaningProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cleaningProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  cleaningProgressHint: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cleaningProgressMess: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 10,
    color: '#FF5722',
    textAlign: 'center',
    marginTop: 3,
  },
  // Finish cleaning button
  finishCleaningButton: {
    flex: 1,
    paddingVertical: (SCREEN_WIDTH * 12) / 393,
    paddingHorizontal: (SCREEN_WIDTH * 8) / 393,
    borderRadius: (SCREEN_WIDTH * 12) / 393,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: (SCREEN_WIDTH * 50) / 393,
    borderWidth: 2,
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  finishCleaningButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: (SCREEN_WIDTH * 16) / 393,
  },
  // Study section - side by side layout in scrollable area
  studySection: {
    flexDirection: 'row',
    width: '100%', // Full width within scroll container
    marginBottom: 15,
    gap: (SCREEN_WIDTH * 10) / 393, // Space between button and progress
    alignItems: 'stretch', // Make both components same height
    alignSelf: 'center', // Center within scroll container
  },
  studyProgressContainer: {
    flex: 1, // Equal space with button
  },
  // Focus session button - equal size with progress
  focusSessionButton: {
    backgroundColor: '#1976D2',
    paddingVertical: (SCREEN_WIDTH * 12) / 393,
    paddingHorizontal: (SCREEN_WIDTH * 16) / 393,
    borderRadius: (SCREEN_WIDTH * 12) / 393,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D47A1',
    flex: 0.5, // Equal space with progress container
  },
  focusSessionButtonDisabled: {
    backgroundColor: '#BDBDBD',
    borderColor: '#9E9E9E',
  },
  focusSessionButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 14) / 393, // Slightly smaller for compact layout
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  focusSessionButtonTextDisabled: {
    color: '#757575',
  },
  focusSessionButtonSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 10) / 393, // Smaller subtext for compact layout
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  
  // Today's deadline section
  todaysDeadlineSection: {
    width: '100%',
    marginBottom: 15,
    alignSelf: 'center',
  },
  
  todaysDeadlineTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  todaysDeadlineCard: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF9800',
    borderRadius: (SCREEN_WIDTH * 12) / 393,
    padding: (SCREEN_WIDTH * 12) / 393,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  todaysDeadlineHeader: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    color: '#E65100',
    marginBottom: 4,
  },
  
  todaysDeadlineDate: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#FF6F00',
    marginBottom: 4,
  },
  
  todaysDeadlineProgress: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#333',
    marginBottom: 4,
  },
  
  todaysDeadlineGoal: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#1976D2',
  },
  
  // Exercise Header Background Bar
  exerciseHeaderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: (SCREEN_HEIGHT * 75) / 852, // Cover the top area including status bar
    zIndex: 14,
  },
  
  // Exercise Timer Overlay
  exerciseTimerContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 80) / 852, // Position below "Quill's Room" text
    left: (SCREEN_WIDTH * 20) / 393,
    right: (SCREEN_WIDTH * 20) / 393,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    zIndex: 15,
  },
  exerciseTimerLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 20, // Fixed size for crisp emoji rendering
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  exerciseTimerValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: (SCREEN_WIDTH * 28) / 393,
    color: '#FFF',
    letterSpacing: 2,
  },

  // Sleep Timer Overlay
  sleepTimerContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 80) / 852, // Position below "Quill's Room" text
    left: (SCREEN_WIDTH * 20) / 393,
    right: (SCREEN_WIDTH * 20) / 393,
    backgroundColor: 'rgba(126, 87, 194, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    zIndex: 15,
  },
  sleepTimerLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  sleepTimerValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: (SCREEN_WIDTH * 28) / 393,
    color: '#FFF',
    letterSpacing: 2,
  },

  // Time Acceleration Overlay
  timeAccelerationOverlay: {
    position: 'absolute',
    top: 50, // Move higher up to avoid conflicts
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.98)', // More opaque
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 4, // Thicker border
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, // Stronger shadow
    shadowRadius: 8,
    elevation: 999, // Very high z-index
    alignItems: 'center',
    zIndex: 999, // Very high z-index
  },
  timeAccelerationTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 18) / 393,
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  timeAccelerationSubtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#FFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  simulatedTimeContainer: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
  },
  simulatedTimeLabel: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#FFF',
    marginBottom: 5,
  },
  simulatedTimeValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: (SCREEN_WIDTH * 32) / 393,
    color: '#FFF',
    letterSpacing: 3,
    marginBottom: 5,
  },
  dayPhaseText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    color: '#FFF',
  },
  timeAccelerationProgressContainer: {
    width: '100%',
    marginBottom: 8,
  },
  timeAccelerationProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  timeAccelerationProgressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  timeAccelerationProgressText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    color: '#FFF',
    textAlign: 'center',
  },
  timeAccelerationTime: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  stopAccelerationButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  stopAccelerationButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    color: '#FFF',
    textAlign: 'center',
  },
  // Dust cloud animation - cloud-shaped brown/tan dust
  dustCloud: {
    position: 'absolute',
    zIndex: 16, // Above cleaning overlay (15)
    pointerEvents: 'none',
    width: 150, // Much bigger
    height: 150,
  },
  dustCloudCircle: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  dustCloudBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(139, 90, 43, 0.7)', // Brown/tan color
    borderRadius: 100,
  },
  dustCloudBubble1: {
    width: 90,
    height: 90,
    left: 0,
    top: 30,
  },
  dustCloudBubble2: {
    width: 80,
    height: 80,
    left: 55,
    top: 10,
  },
  dustCloudBubble3: {
    width: 70,
    height: 70,
    left: 40,
    top: 55,
  },
  dustCloudBubble4: {
    width: 65,
    height: 65,
    left: 85,
    top: 65,
  },
});
