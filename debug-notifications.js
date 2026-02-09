#!/usr/bin/env node

/**
 * Notification System Debug Script
 * 
 * This script helps diagnose notification issues in the Quillby app.
 * Run this to check notification configuration and permissions.
 */

console.log('🔍 Quillby Notification System Diagnostic');
console.log('=========================================\n');

// Check if expo-notifications is properly installed
try {
  const packageJson = require('./package.json');
  const hasExpoNotifications = packageJson.dependencies['expo-notifications'] || packageJson.devDependencies['expo-notifications'];
  
  console.log('📦 Package Check:');
  console.log(`   expo-notifications: ${hasExpoNotifications ? '✅ Installed' : '❌ Missing'}`);
  
  if (!hasExpoNotifications) {
    console.log('\n❌ expo-notifications is not installed!');
    console.log('   Run: npm install expo-notifications');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Could not read package.json');
  process.exit(1);
}

// Check app.json configuration
try {
  const appJson = require('./app.json');
  const plugins = appJson.expo?.plugins || [];
  const hasNotificationPlugin = plugins.some(plugin => 
    plugin === 'expo-notifications' || 
    (Array.isArray(plugin) && plugin[0] === 'expo-notifications')
  );
  
  console.log('\n⚙️  Configuration Check:');
  console.log(`   expo-notifications plugin: ${hasNotificationPlugin ? '✅ Configured' : '❌ Missing'}`);
  
  if (!hasNotificationPlugin) {
    console.log('\n❌ expo-notifications plugin not configured in app.json!');
    console.log('   Add to plugins array: ["expo-notifications", { "icon": "./assets/icon.png" }]');
  }
  
  // Check Android permissions
  const androidPermissions = appJson.expo?.android?.permissions || [];
  console.log(`   Android permissions: ${androidPermissions.length} configured`);
  
} catch (error) {
  console.log('❌ Could not read app.json');
}

// Check notification files
const fs = require('fs');
const path = require('path');

console.log('\n📁 File Check:');

const notificationFiles = [
  'lib/notifications.ts',
  'app/hooks/useNotifications.tsx',
  'app/components/ui/NotificationBanner.tsx'
];

notificationFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${file}: ${exists ? '✅ Exists' : '❌ Missing'}`);
});

// Check if notifications are enabled in main screen
try {
  const indexFile = fs.readFileSync(path.join(__dirname, 'app/(tabs)/index.tsx'), 'utf8');
  const isCommented = indexFile.includes('// const notificationHook = useNotifications()');
  const isEnabled = indexFile.includes('const notificationHook = useNotifications()') && !isCommented;
  
  console.log(`   Notifications in main screen: ${isEnabled ? '✅ Enabled' : '❌ Disabled/Commented'}`);
  
  if (!isEnabled) {
    console.log('\n❌ Notifications are commented out in app/(tabs)/index.tsx!');
    console.log('   Uncomment the useNotifications hook to enable notifications.');
  }
} catch (error) {
  console.log('   Could not check main screen file');
}

console.log('\n🔧 Common Issues & Solutions:');
console.log('1. Notifications commented out → Uncomment useNotifications hook in index.tsx');
console.log('2. Permissions denied → Check device notification settings');
console.log('3. No system notifications → Ensure app has notification permissions');
console.log('4. No in-app banners → Check NotificationBanner component rendering');

console.log('\n📱 Testing Steps:');
console.log('1. Enable study checkpoints in settings');
console.log('2. Set study goal hours > 0');
console.log('3. Wait for checkpoint times (9 AM, 12 PM, 3 PM, 6 PM, 9 PM)');
console.log('4. Use the test notification button (if enabled)');
console.log('5. Create deadlines with reminders enabled');

console.log('\n✅ Diagnostic complete!');