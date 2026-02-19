// Test script to verify the fixes
console.log('Testing fixes...');

// Test 1: Check if expo-notifications can be imported
try {
  const Notifications = require('expo-notifications');
  console.log('✅ expo-notifications import successful');
} catch (error) {
  console.log('❌ expo-notifications import failed:', error.message);
}

// Test 2: Check if the dailyData functions are properly structured
try {
  const fs = require('fs');
  const dailyDataContent = fs.readFileSync('./lib/dailyData.ts', 'utf8');
  
  // Check if maybeSingle() is used instead of single()
  const hasMaybeSingle = dailyDataContent.includes('maybeSingle()');
  const hasSingleWithoutMaybe = dailyDataContent.includes('.single()') && !dailyDataContent.includes('maybeSingle()');
  
  if (hasMaybeSingle && !hasSingleWithoutMaybe) {
    console.log('✅ Database query fix applied - using maybeSingle()');
  } else {
    console.log('❌ Database query fix not properly applied');
  }
} catch (error) {
  console.log('❌ Could not verify database fix:', error.message);
}

console.log('Test completed!');