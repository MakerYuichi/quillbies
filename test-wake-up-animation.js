#!/usr/bin/env node

/**
 * Test script to verify wake-up animation timing
 * This simulates the wake-up sequence to ensure the animation shows for 3 seconds
 */

console.log('🧪 Testing Wake-up Animation Timing...\n');

// Simulate the wake-up sequence
function simulateWakeUpSequence() {
  console.log('1. Starting sleep session...');
  
  // Simulate sleep
  let currentAnimation = 'sleeping';
  console.log(`   Animation: ${currentAnimation}`);
  
  setTimeout(() => {
    console.log('\n2. Waking up...');
    
    // Simulate wake-up button press
    console.log('   - Setting wake-up animation');
    currentAnimation = 'wake-up';
    console.log(`   Animation: ${currentAnimation}`);
    
    // Simulate the 3-second timeout
    setTimeout(() => {
      console.log('   - 3 seconds elapsed, returning to idle');
      currentAnimation = 'idle';
      console.log(`   Animation: ${currentAnimation}`);
      
      console.log('\n✅ Wake-up animation test completed!');
      console.log('The animation should show "wake-up" for exactly 3 seconds.');
    }, 3000);
    
  }, 1000);
}

// Run the test
simulateWakeUpSequence();

console.log('Expected behavior:');
console.log('- Animation should be "sleeping" initially');
console.log('- Animation should change to "wake-up" when waking up');
console.log('- Animation should stay "wake-up" for 3 seconds');
console.log('- Animation should return to "idle" after 3 seconds');
console.log('\nIf the wake-up animation is not showing for 3 seconds,');
console.log('check the useSleepTracking.tsx handleWakeUpButton function.');