#!/usr/bin/env node

// Test script to verify mess points calculations
// Run with: node test-mess-points.js

console.log('🧪 Testing Mess Points Calculations\n');

// Import the calculation functions (simplified versions for testing)
function addMessForSkippedTask(currentMess) {
  return currentMess + 1;
}

function removeMessAfterSession(currentMess, pointsToRemove) {
  return Math.max(0, currentMess - pointsToRemove);
}

function calculateMessEnergyDrain(messPoints) {
  if (messPoints >= 21) return 20; // Heavy mess: -20 energy/day
  if (messPoints >= 16) return 15; // Medium-high mess: -15 energy/day
  if (messPoints >= 11) return 10; // Medium mess: -10 energy/day
  if (messPoints >= 6) return 5;   // Light mess: -5 energy/day
  return 0; // Clean room: no drain
}

function calculateSessionRewards(focusScore, distractionCount) {
  const MESS_REMOVAL_PER_SESSION = 2;
  
  // Q-Coins: Focus Score × 0.5
  const qCoinsEarned = Math.round(focusScore * 0.5);
  
  // Study Hours: (Focus Score / 120) × 1 hour
  const studyHours = focusScore / 120;
  
  // Energy: Based on distraction count
  let energyMultiplier = 0.3; // Perfect (0 distractions)
  if (distractionCount >= 3) {
    energyMultiplier = 0.1; // Many distractions (3+)
  } else if (distractionCount >= 1) {
    energyMultiplier = 0.2; // Some distractions (1-2)
  }
  const energyGained = Math.round(focusScore * energyMultiplier);
  
  return {
    qCoinsEarned,
    xpEarned: Math.round(focusScore),
    messPointsRemoved: MESS_REMOVAL_PER_SESSION, // Always -2
    energyGained,
    studyHours
  };
}

function getRoomStatus(messPoints) {
  return messPoints <= 5 ? 'Clean' :
         messPoints <= 10 ? 'Light Mess' :
         messPoints <= 20 ? 'Medium Mess' : 'Heavy Mess';
}

// Test scenarios
console.log('📊 Test Scenarios:');
console.log('==================\n');

// Scenario 1: Starting clean, skipping tasks
console.log('1️⃣ Starting Clean → Skipping Tasks:');
let mess = 0;
console.log(`   Initial: ${mess} points (${getRoomStatus(mess)})`);

for (let i = 1; i <= 5; i++) {
  mess = addMessForSkippedTask(mess);
  console.log(`   Skip ${i}: ${mess} points (${getRoomStatus(mess)}) - Energy drain: ${calculateMessEnergyDrain(mess)}/day`);
}
console.log();

// Scenario 2: Completing study sessions
console.log('2️⃣ Completing Study Sessions:');
console.log(`   Starting: ${mess} points (${getRoomStatus(mess)})`);

for (let i = 1; i <= 3; i++) {
  const focusScore = 100; // Good session
  const distractions = 0; // Perfect focus
  const rewards = calculateSessionRewards(focusScore, distractions);
  mess = removeMessAfterSession(mess, rewards.messPointsRemoved);
  console.log(`   Session ${i}: -${rewards.messPointsRemoved} points → ${mess} points (${getRoomStatus(mess)})`);
  console.log(`              Rewards: ${rewards.qCoinsEarned} coins, ${rewards.energyGained} energy, ${rewards.studyHours.toFixed(1)}h study`);
}
console.log();

// Scenario 3: Energy drain at different mess levels
console.log('3️⃣ Energy Drain by Mess Level:');
const messLevels = [0, 3, 6, 11, 16, 21, 30];
messLevels.forEach(level => {
  const drain = calculateMessEnergyDrain(level);
  console.log(`   ${level} points: ${getRoomStatus(level)} → -${drain} energy/day`);
});
console.log();

// Scenario 4: Mixed behavior simulation
console.log('4️⃣ Mixed Behavior Simulation (1 week):');
mess = 0;
console.log(`   Day 1 Start: ${mess} points (${getRoomStatus(mess)})`);

const weekActivities = [
  { day: 1, action: 'study', focusScore: 120, distractions: 0 },
  { day: 1, action: 'skip' },
  { day: 2, action: 'study', focusScore: 80, distractions: 2 },
  { day: 2, action: 'skip' },
  { day: 3, action: 'skip' },
  { day: 3, action: 'skip' },
  { day: 4, action: 'study', focusScore: 100, distractions: 1 },
  { day: 5, action: 'study', focusScore: 90, distractions: 0 },
  { day: 6, action: 'skip' },
  { day: 7, action: 'study', focusScore: 110, distractions: 0 }
];

weekActivities.forEach(activity => {
  if (activity.action === 'skip') {
    mess = addMessForSkippedTask(mess);
    console.log(`   Day ${activity.day} Skip: +1 → ${mess} points (${getRoomStatus(mess)}) - Energy drain: ${calculateMessEnergyDrain(mess)}/day`);
  } else {
    const rewards = calculateSessionRewards(activity.focusScore, activity.distractions);
    mess = removeMessAfterSession(mess, rewards.messPointsRemoved);
    console.log(`   Day ${activity.day} Study: -${rewards.messPointsRemoved} → ${mess} points (${getRoomStatus(mess)}) - ${rewards.qCoinsEarned} coins, ${rewards.studyHours.toFixed(1)}h`);
  }
});

console.log('\n✅ Test Complete!');
console.log('\n📋 Summary of Mess Points System:');
console.log('• Skip task: +1 mess point');
console.log('• Complete study session: -2 mess points');
console.log('• Energy drain: 0-5 (clean), 5-10 (light), 10-15 (medium), 15-20 (heavy)');
console.log('• Room status: Clean (≤5), Light (6-10), Medium (11-20), Heavy (21+)');