#!/usr/bin/env node

// Simple test script to verify the modular store structure
// Run with: node test-modular-store.js

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Quillby Modular Store Structure...\n');

// Check if all required files exist
const requiredFiles = [
  'app/state/store-modular.ts',
  'app/state/slices/userSlice.ts',
  'app/state/slices/sessionSlice.ts',
  'app/state/slices/habitsSlice.ts',
  'app/state/slices/deadlinesSlice.ts',
  'app/state/slices/shopSlice.ts',
  'app/state/utils/syncUtils.ts',
  'app/state/utils/storageUtils.ts'
];

let allFilesExist = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n🔍 Checking for TypeScript syntax issues:');

// Simple syntax check by looking for common issues
const checkFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for common issues
  if (content.includes('this.') && !content.includes('class ')) {
    issues.push('Found "this." usage outside of class (should use get())');
  }
  
  if (content.includes('get()') && !content.includes('const [') && !content.includes('const { ')) {
    issues.push('Found get() usage without destructuring');
  }
  
  if (issues.length > 0) {
    console.log(`⚠️  ${filePath}:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log(`✅ ${filePath} - No obvious issues`);
  }
};

requiredFiles.forEach(checkFile);

console.log('\n📊 File size analysis:');
const getFileSize = (filePath) => {
  if (!fs.existsSync(filePath)) return 0;
  const stats = fs.statSync(filePath);
  return stats.size;
};

const originalStoreSize = getFileSize('app/state/store.ts') || getFileSize('app/state/store-legacy.ts');
const modularStoreSize = getFileSize('app/state/store-modular.ts');
const totalSlicesSize = requiredFiles
  .filter(f => f.includes('/slices/'))
  .reduce((total, file) => total + getFileSize(file), 0);

console.log(`Original store: ${Math.round(originalStoreSize / 1024)}KB`);
console.log(`Modular store: ${Math.round(modularStoreSize / 1024)}KB`);
console.log(`All slices: ${Math.round(totalSlicesSize / 1024)}KB`);
console.log(`Total modular: ${Math.round((modularStoreSize + totalSlicesSize) / 1024)}KB`);

console.log('\n🎯 Migration status:');
if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('✅ Modular structure is complete');
  console.log('\n🚀 Ready to test! Run your development server and check for any import errors.');
} else {
  console.log('❌ Some files are missing. Please run the migration script first.');
}

console.log('\n📋 Next steps:');
console.log('1. Run: npm start (or your dev command)');
console.log('2. Check console for import errors');
console.log('3. Test key functionality');
console.log('4. If issues occur, check MODULARIZATION_ANALYSIS.md');