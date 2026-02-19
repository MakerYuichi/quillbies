#!/usr/bin/env node

// Debug script to check mess points in the actual app
// Run with: node debug-mess-points.js

console.log('🔍 Mess Points Debug Tool\n');

// Simulate checking the store state
console.log('📱 How to check mess points in your app:');
console.log('=====================================\n');

console.log('1️⃣ Check Current Mess Points:');
console.log('   • Open the Stats tab in your app');
console.log('   • Look for "Mess Points: X.X" value');
console.log('   • Check room status (Clean/Light Mess/Medium Mess/Heavy Mess)');
console.log('   • Note the energy drain amount\n');

console.log('2️⃣ Test Mess Point Changes:');
console.log('   A) Skip a task:');
console.log('      • Go to Focus tab');
console.log('      • Start a study session');
console.log('      • Immediately tap "Skip Task" button');
console.log('      • Check Stats tab → mess points should increase by +1');
console.log('');
console.log('   B) Complete a study session:');
console.log('      • Start a study session');
console.log('      • Study for at least 1 minute');
console.log('      • Complete the session normally');
console.log('      • Check Stats tab → mess points should decrease by -2');
console.log('');

console.log('3️⃣ Verify Energy Drain:');
console.log('   • Check your current energy level');
console.log('   • Note your mess points');
console.log('   • Wait for daily reset (or force it by changing device date)');
console.log('   • Energy should decrease based on mess level:');
console.log('     - 0-5 mess points: No energy drain');
console.log('     - 6-10 mess points: -5 energy per day');
console.log('     - 11-15 mess points: -10 energy per day');
console.log('     - 16-20 mess points: -15 energy per day');
console.log('     - 21+ mess points: -20 energy per day\n');

console.log('4️⃣ Check Console Logs:');
console.log('   • Open your development console');
console.log('   • Look for logs containing "mess" or "Mess"');
console.log('   • Key logs to watch for:');
console.log('     - "[Study] Missed checkpoint" - shows mess point increases');
console.log('     - "[Session] Completed" - shows mess point decreases');
console.log('     - "[Daily] Mess penalty" - shows energy drain');
console.log('     - "[Cleaning] Reduced mess" - shows room cleaning effects\n');

console.log('5️⃣ Manual Calculation Check:');
console.log('   Expected behavior:');
console.log('   • Each skipped task = +1 mess point');
console.log('   • Each completed session = -2 mess points');
console.log('   • Mess points cannot go below 0');
console.log('   • Room cleaning reduces mess points based on taps');
console.log('   • Daily energy drain applies once per day\n');

console.log('6️⃣ Common Issues to Check:');
console.log('   ❌ Mess points not updating after skip:');
console.log('      → Check if skipTask() function is being called');
console.log('      → Verify store state is updating');
console.log('');
console.log('   ❌ Mess points not decreasing after session:');
console.log('      → Check if completeSession() is called');
console.log('      → Verify calculateSessionRewards() returns messPointsRemoved: 2');
console.log('');
console.log('   ❌ Energy not draining daily:');
console.log('      → Check if shouldApplyDailyDrains() detects new day');
console.log('      → Verify calculateMessEnergyDrain() returns correct value');
console.log('');
console.log('   ❌ Room visual not matching mess level:');
console.log('      → Check RoomBackground component props');
console.log('      → Verify mess points are passed correctly to room layers\n');

console.log('7️⃣ Test Sequence for Full Validation:');
console.log('   1. Note starting mess points and energy');
console.log('   2. Skip 3 tasks → mess should be +3');
console.log('   3. Complete 1 session → mess should be -2 from step 2');
console.log('   4. Skip 5 more tasks → mess should be +5 from step 3');
console.log('   5. Complete 2 sessions → mess should be -4 from step 4');
console.log('   6. Check room visual matches calculated mess level');
console.log('   7. Force daily reset → energy should drain based on mess\n');

console.log('✅ Use this checklist to systematically verify mess points are working correctly!');

// Create a simple calculation helper
console.log('\n🧮 Quick Calculator:');
console.log('===================');

function calculateExpectedMess(startingMess, skips, completedSessions) {
  return Math.max(0, startingMess + skips - (completedSessions * 2));
}

function calculateEnergyDrain(messPoints) {
  if (messPoints >= 21) return 20;
  if (messPoints >= 16) return 15;
  if (messPoints >= 11) return 10;
  if (messPoints >= 6) return 5;
  return 0;
}

// Example calculations
const examples = [
  { start: 0, skips: 3, sessions: 1 },
  { start: 5, skips: 2, sessions: 3 },
  { start: 10, skips: 5, sessions: 2 }
];

examples.forEach((ex, i) => {
  const finalMess = calculateExpectedMess(ex.start, ex.skips, ex.sessions);
  const drain = calculateEnergyDrain(finalMess);
  console.log(`Example ${i + 1}: ${ex.start} start + ${ex.skips} skips - ${ex.sessions * 2} sessions = ${finalMess} mess (${drain} energy drain/day)`);
});