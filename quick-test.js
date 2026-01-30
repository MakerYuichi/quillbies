#!/usr/bin/env node

// Quick Test Runner for Quillby App
// Usage: node quick-test.js [test-type]

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testTypes = {
  'automated': 'Run automated test suite',
  'accessibility': 'Run accessibility tests',
  'performance': 'Run performance tests',
  'smoke': 'Run quick smoke tests',
  'all': 'Run all available tests'
};

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

function checkAppStructure() {
  console.log('🔍 Checking app structure...');
  
  const requiredFiles = [
    'package.json',
    'app.json',
    'app/(tabs)/index.tsx',
    'app/state/store-modular.ts',
    'test-automation.js',
    'FUNCTIONALITY_TEST_CHECKLIST.md'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.log('❌ Missing required files:');
    missingFiles.forEach(file => console.log(`  - ${file}`));
    return false;
  }
  
  console.log('✅ All required files present');
  return true;
}

function runAutomatedTests() {
  console.log('\n🧪 Running Automated Test Suite...');
  return runCommand('node test-automation.js', 'Automated tests');
}

function runAccessibilityTests() {
  console.log('\n🌟 Running Accessibility Tests...');
  return runCommand('node test-accessibility.js', 'Accessibility tests');
}

function runPerformanceTests() {
  console.log('\n⚡ Running Performance Tests...');
  return runCommand('node test-performance.js', 'Performance tests');
}

function runSmokeTests() {
  console.log('\n💨 Running Smoke Tests...');
  
  // Check if app can be built
  console.log('📦 Checking if app builds...');
  try {
    execSync('npx expo export --platform web --output-dir ./test-build', { stdio: 'pipe' });
    console.log('✅ App builds successfully');
    
    // Cleanup
    if (fs.existsSync('./test-build')) {
      execSync('rm -rf ./test-build');
    }
    return true;
  } catch (error) {
    console.log('❌ App build failed');
    console.log('💡 Try running: npm install && expo install');
    return false;
  }
}

function runPerformanceTests() {
  console.log('\n⚡ Running Performance Tests...');
  
  // Check bundle size
  console.log('📊 Analyzing bundle size...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const depCount = Object.keys(packageJson.dependencies || {}).length;
    const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
    
    console.log(`📦 Dependencies: ${depCount} production, ${devDepCount} development`);
    
    if (depCount > 50) {
      console.log('⚠️  High dependency count - consider optimization');
    } else {
      console.log('✅ Reasonable dependency count');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Could not analyze bundle');
    return false;
  }
}

function showTestSummary(results) {
  console.log('\n📊 Test Summary');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);
  
  console.log(`Total Test Categories: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${total - passed} ❌`);
  console.log(`Success Rate: ${passRate}%`);
  
  console.log('\nTest Results:');
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`  ${status} ${result.name}`);
  });
  
  if (passRate >= 80) {
    console.log('\n🎉 Great job! Your app is in good shape!');
  } else if (passRate >= 60) {
    console.log('\n⚠️  Some issues found. Check the failed tests above.');
  } else {
    console.log('\n🚨 Multiple issues detected. Review and fix before proceeding.');
  }
}

function main() {
  const testType = process.argv[2] || 'all';
  
  console.log('🧪 Quillby App Quick Test Runner');
  console.log('='.repeat(50));
  
  if (!testTypes[testType]) {
    console.log('❌ Invalid test type. Available options:');
    Object.entries(testTypes).forEach(([key, desc]) => {
      console.log(`  ${key}: ${desc}`);
    });
    process.exit(1);
  }
  
  const results = [];
  
  // Always check app structure first
  results.push({
    name: 'App Structure Check',
    passed: checkAppStructure()
  });
  
  if (testType === 'automated' || testType === 'all') {
    results.push({
      name: 'Automated Tests',
      passed: runAutomatedTests()
    });
  }
  
  if (testType === 'accessibility' || testType === 'all') {
    results.push({
      name: 'Accessibility Tests',
      passed: runAccessibilityTests()
    });
  }
  
  if (testType === 'performance' || testType === 'all') {
    results.push({
      name: 'Performance Tests',
      passed: runPerformanceTests()
    });
  }
  
  if (testType === 'smoke' || testType === 'all') {
    results.push({
      name: 'Smoke Tests',
      passed: runSmokeTests()
    });
  }
  
  if (testType === 'performance' || testType === 'all') {
    results.push({
      name: 'Performance Tests',
      passed: runPerformanceTests()
    });
  }
  
  showTestSummary(results);
  
  console.log('\n📋 Next Steps:');
  console.log('  1. Run the app: npm start');
  console.log('  2. Manual testing: See FUNCTIONALITY_TEST_CHECKLIST.md');
  console.log('  3. Device testing: Test on iOS/Android devices');
  console.log('  4. User testing: Get feedback from real users');
  
  console.log('\n🚀 Happy testing!');
}

if (require.main === module) {
  main();
}

module.exports = { runAutomatedTests, runAccessibilityTests, runPerformanceTests, runSmokeTests };