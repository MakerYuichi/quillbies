// Quillby App - Automated Performance Testing Script
// Run with: node test-performance.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const performanceResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0,
  results: [],
  metrics: {},
  recommendations: []
};

// Performance testing utility functions
function performanceTest(description, testFunction, severity = 'error') {
  performanceResults.total++;
  try {
    const result = testFunction();
    if (result.passed) {
      performanceResults.passed++;
      performanceResults.results.push({ 
        description, 
        status: 'PASS', 
        severity,
        details: result.details || null,
        metrics: result.metrics || null
      });
      console.log(`✅ PASS: ${description}`);
      if (result.metrics) {
        console.log(`   📊 ${result.metrics}`);
      }
    } else {
      if (severity === 'warning') {
        performanceResults.warnings++;
        console.log(`⚠️  WARN: ${description} - ${result.message}`);
      } else {
        performanceResults.failed++;
        console.log(`❌ FAIL: ${description} - ${result.message}`);
      }
      performanceResults.results.push({ 
        description, 
        status: severity === 'warning' ? 'WARN' : 'FAIL', 
        severity,
        details: result.message,
        metrics: result.metrics || null
      });
      
      if (result.recommendation) {
        performanceResults.recommendations.push({
          test: description,
          recommendation: result.recommendation
        });
      }
    }
  } catch (error) {
    performanceResults.failed++;
    performanceResults.results.push({ 
      description, 
      status: 'ERROR', 
      severity: 'error',
      details: error.message 
    });
    console.log(`💥 ERROR: ${description} - ${error.message}`);
  }
}

// File analysis utilities
function analyzePackageSize() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {}).length;
    const devDependencies = Object.keys(packageJson.devDependencies || {}).length;
    
    return {
      dependencies,
      devDependencies,
      total: dependencies + devDependencies
    };
  } catch (error) {
    return null;
  }
}

function analyzeBundleSize() {
  try {
    // Check if node_modules exists and get approximate size
    if (fs.existsSync('node_modules')) {
      const stats = fs.statSync('node_modules');
      return {
        exists: true,
        // Note: This is a simplified check - real bundle analysis would require build
        estimated: 'Large (full analysis requires build)'
      };
    }
    return { exists: false };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

function analyzeCodeComplexity(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;
  const functions = (content.match(/function|=>/g) || []).length;
  const imports = (content.match(/import/g) || []).length;
  const useEffects = (content.match(/useEffect/g) || []).length;
  const useState = (content.match(/useState/g) || []).length;
  
  return {
    exists: true,
    lines,
    functions,
    imports,
    hooks: useEffects + useState,
    complexity: functions + useEffects + useState // Simple complexity metric
  };
}

function checkPerformancePatterns(content) {
  const patterns = {
    memoization: content.includes('useMemo') || content.includes('useCallback') || content.includes('React.memo'),
    virtualizedLists: content.includes('FlatList') || content.includes('VirtualizedList'),
    lazyLoading: content.includes('lazy') || content.includes('Suspense'),
    imageOptimization: content.includes('resizeMode') || content.includes('cache'),
    stateOptimization: content.includes('useSelector') || content.includes('shallow'),
    memoryLeakPrevention: content.includes('useEffect') && content.includes('return')
  };
  
  return patterns;
}

// Performance tests
console.log('⚡ Starting Quillby App Performance Tests...\n');

// 1. Bundle Size and Dependencies
console.log('📦 Testing Bundle Size and Dependencies...');

performanceTest('Package dependencies are reasonable', () => {
  const packageInfo = analyzePackageSize();
  if (!packageInfo) {
    return { passed: false, message: 'Could not analyze package.json' };
  }
  
  const totalDeps = packageInfo.total;
  const isReasonable = totalDeps < 50; // Reasonable threshold for mobile app
  
  return {
    passed: isReasonable,
    message: isReasonable ? 
      `${totalDeps} total dependencies (reasonable)` : 
      `${totalDeps} total dependencies (consider optimization)`,
    metrics: `${packageInfo.dependencies} prod, ${packageInfo.devDependencies} dev`,
    recommendation: isReasonable ? null : 'Consider removing unused dependencies and using lighter alternatives'
  };
});

performanceTest('Bundle structure supports optimization', () => {
  const bundleInfo = analyzeBundleSize();
  
  return {
    passed: bundleInfo.exists,
    message: bundleInfo.exists ? 'Bundle structure ready for analysis' : 'Node modules not found',
    metrics: bundleInfo.estimated || 'Not available',
    recommendation: bundleInfo.exists ? null : 'Run npm install to enable bundle analysis'
  };
}, 'warning');

// 2. Code Performance Patterns
console.log('\n🔧 Testing Code Performance Patterns...');

performanceTest('Home screen uses performance optimizations', () => {
  const homeScreen = analyzeCodeComplexity('app/(tabs)/index.tsx');
  if (!homeScreen.exists) {
    return { passed: false, message: 'Home screen file not found' };
  }
  
  const content = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
  const patterns = checkPerformancePatterns(content);
  
  const optimizationCount = Object.values(patterns).filter(Boolean).length;
  const hasBasicOptimizations = optimizationCount >= 2;
  
  return {
    passed: hasBasicOptimizations,
    message: hasBasicOptimizations ? 
      `Found ${optimizationCount} performance optimizations` : 
      `Only ${optimizationCount} performance optimizations found`,
    metrics: `${homeScreen.lines} lines, ${homeScreen.complexity} complexity score`,
    recommendation: hasBasicOptimizations ? null : 'Add useMemo, useCallback, or React.memo for better performance'
  };
});

performanceTest('Components use efficient list rendering', () => {
  const files = [
    'app/(tabs)/stats.tsx',
    'app/(tabs)/shop.tsx',
    'app/components/ui/ScrollablePicker.tsx'
  ];
  
  let hasEfficientLists = false;
  let checkedFiles = 0;
  
  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      checkedFiles++;
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('FlatList') || content.includes('VirtualizedList')) {
        hasEfficientLists = true;
      }
    }
  });
  
  return {
    passed: hasEfficientLists || checkedFiles === 0,
    message: hasEfficientLists ? 
      'Found efficient list components' : 
      'No efficient list rendering found',
    metrics: `Checked ${checkedFiles} files`,
    recommendation: hasEfficientLists ? null : 'Use FlatList instead of ScrollView for long lists'
  };
});

performanceTest('State management is optimized', () => {
  const storeFiles = [
    'app/state/store-modular.ts',
    'app/state/store.ts'
  ];
  
  let hasOptimizedState = false;
  let checkedFiles = 0;
  
  storeFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      checkedFiles++;
      const content = fs.readFileSync(filePath, 'utf8');
      // Check for Zustand optimizations
      if (content.includes('shallow') || content.includes('subscribeWithSelector')) {
        hasOptimizedState = true;
      }
    }
  });
  
  return {
    passed: hasOptimizedState || checkedFiles === 0,
    message: hasOptimizedState ? 
      'State management uses optimizations' : 
      'State management could be optimized',
    metrics: `Checked ${checkedFiles} store files`,
    recommendation: hasOptimizedState ? null : 'Consider using shallow comparison and selective subscriptions'
  };
}, 'warning');

// 3. Memory Management
console.log('\n💾 Testing Memory Management...');

performanceTest('Components properly clean up effects', () => {
  const files = [
    'app/(tabs)/index.tsx',
    'app/hooks/useNotifications.tsx',
    'app/hooks/useRandomReminders.tsx'
  ];
  
  let hasProperCleanup = false;
  let totalEffects = 0;
  let cleanupEffects = 0;
  
  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const effects = (content.match(/useEffect/g) || []).length;
      const cleanups = (content.match(/return\s*\(\s*\)\s*=>/g) || []).length + 
                      (content.match(/return\s*function/g) || []).length;
      
      totalEffects += effects;
      cleanupEffects += cleanups;
    }
  });
  
  hasProperCleanup = totalEffects === 0 || (cleanupEffects / totalEffects) >= 0.5;
  
  return {
    passed: hasProperCleanup,
    message: hasProperCleanup ? 
      'Effects have proper cleanup' : 
      'Some effects may lack cleanup functions',
    metrics: `${cleanupEffects}/${totalEffects} effects have cleanup`,
    recommendation: hasProperCleanup ? null : 'Add cleanup functions to useEffect hooks to prevent memory leaks'
  };
});

performanceTest('Images are optimized for performance', () => {
  const assetDirs = ['assets/hamsters', 'assets/backgrounds', 'assets/rooms'];
  let totalImages = 0;
  let optimizedImages = 0;
  
  assetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true });
      const imageFiles = files.filter(file => 
        typeof file === 'string' && /\.(png|jpg|jpeg|gif)$/i.test(file)
      );
      
      totalImages += imageFiles.length;
      // Simple heuristic: assume PNG files are optimized if they exist
      optimizedImages += imageFiles.filter(file => file.endsWith('.png')).length;
    }
  });
  
  const optimizationRatio = totalImages === 0 ? 1 : optimizedImages / totalImages;
  const isOptimized = optimizationRatio >= 0.7;
  
  return {
    passed: isOptimized,
    message: isOptimized ? 
      'Images appear to be optimized' : 
      'Images may need optimization',
    metrics: `${optimizedImages}/${totalImages} images optimized`,
    recommendation: isOptimized ? null : 'Consider using WebP format and image compression for better performance'
  };
}, 'warning');

// 4. Network Performance
console.log('\n🌐 Testing Network Performance Patterns...');

performanceTest('Network requests are optimized', () => {
  const networkFiles = [
    'lib/supabase.ts',
    'lib/syncManager.ts',
    'lib/auth.ts'
  ];
  
  let hasNetworkOptimizations = false;
  let checkedFiles = 0;
  
  networkFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      checkedFiles++;
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for common network optimizations
      if (content.includes('cache') || 
          content.includes('retry') || 
          content.includes('timeout') ||
          content.includes('debounce') ||
          content.includes('throttle')) {
        hasNetworkOptimizations = true;
      }
    }
  });
  
  return {
    passed: hasNetworkOptimizations || checkedFiles === 0,
    message: hasNetworkOptimizations ? 
      'Network requests use optimizations' : 
      'Network requests could be optimized',
    metrics: `Checked ${checkedFiles} network files`,
    recommendation: hasNetworkOptimizations ? null : 'Add caching, retry logic, and request debouncing'
  };
}, 'warning');

performanceTest('Offline functionality is implemented', () => {
  const offlineFiles = [
    'lib/offlineMode.ts',
    'app/state/utils/storageUtils.ts'
  ];
  
  let hasOfflineSupport = false;
  let checkedFiles = 0;
  
  offlineFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      checkedFiles++;
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('offline') || 
          content.includes('AsyncStorage') || 
          content.includes('cache')) {
        hasOfflineSupport = true;
      }
    }
  });
  
  return {
    passed: hasOfflineSupport,
    message: hasOfflineSupport ? 
      'Offline functionality implemented' : 
      'Limited offline functionality detected',
    metrics: `Checked ${checkedFiles} offline-related files`,
    recommendation: hasOfflineSupport ? null : 'Implement comprehensive offline data storage and sync'
  };
});

// 5. Animation Performance
console.log('\n🎨 Testing Animation Performance...');

performanceTest('Animations use performance-optimized libraries', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const hasReanimated = 'react-native-reanimated' in deps;
  const hasGestureHandler = 'react-native-gesture-handler' in deps;
  
  const animationScore = (hasReanimated ? 1 : 0) + (hasGestureHandler ? 1 : 0);
  const isOptimized = animationScore >= 1;
  
  return {
    passed: isOptimized,
    message: isOptimized ? 
      'Uses performance-optimized animation libraries' : 
      'Could benefit from better animation libraries',
    metrics: `Reanimated: ${hasReanimated}, Gesture Handler: ${hasGestureHandler}`,
    recommendation: isOptimized ? null : 'Consider using react-native-reanimated for better animation performance'
  };
});

performanceTest('Components avoid expensive operations in render', () => {
  const files = [
    'app/(tabs)/index.tsx',
    'app/components/character/HamsterCharacter.tsx',
    'app/components/progress/EnergyBar.tsx'
  ];
  
  let hasExpensiveOperations = false;
  let checkedFiles = 0;
  
  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      checkedFiles++;
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Look for potentially expensive operations in render
      if (content.includes('new Date()') && !content.includes('useMemo') ||
          content.includes('JSON.parse') && !content.includes('useMemo') ||
          content.includes('filter(') && !content.includes('useMemo')) {
        hasExpensiveOperations = true;
      }
    }
  });
  
  return {
    passed: !hasExpensiveOperations,
    message: hasExpensiveOperations ? 
      'Found potentially expensive render operations' : 
      'No expensive render operations detected',
    metrics: `Checked ${checkedFiles} component files`,
    recommendation: hasExpensiveOperations ? null : 'Wrap expensive operations in useMemo or useCallback'
  };
});

// 6. Battery Performance
console.log('\n🔋 Testing Battery Performance Patterns...');

performanceTest('Background tasks are optimized', () => {
  const backgroundFiles = [
    'app/hooks/useNotifications.tsx',
    'lib/notifications.ts',
    'app/study-session.tsx'
  ];
  
  let hasBackgroundOptimizations = false;
  let checkedFiles = 0;
  
  backgroundFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      checkedFiles++;
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for background optimization patterns
      if (content.includes('AppState') || 
          content.includes('background') ||
          content.includes('inactive') ||
          content.includes('foreground')) {
        hasBackgroundOptimizations = true;
      }
    }
  });
  
  return {
    passed: hasBackgroundOptimizations,
    message: hasBackgroundOptimizations ? 
      'Background tasks are optimized' : 
      'Background tasks could be optimized',
    metrics: `Checked ${checkedFiles} background-related files`,
    recommendation: hasBackgroundOptimizations ? null : 'Implement AppState handling to optimize background behavior'
  };
}, 'warning');

performanceTest('Timers and intervals are properly managed', () => {
  const timerFiles = [
    'app/study-session.tsx',
    'app/hooks/useSleepTracking.tsx',
    'app/components/ui/RealTimeClock.tsx'
  ];
  
  let hasProperTimerManagement = false;
  let totalTimers = 0;
  let cleanedTimers = 0;
  
  timerFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      const timers = (content.match(/setInterval|setTimeout/g) || []).length;
      const clears = (content.match(/clearInterval|clearTimeout/g) || []).length;
      
      totalTimers += timers;
      cleanedTimers += clears;
    }
  });
  
  hasProperTimerManagement = totalTimers === 0 || cleanedTimers >= totalTimers;
  
  return {
    passed: hasProperTimerManagement,
    message: hasProperTimerManagement ? 
      'Timers are properly managed' : 
      'Some timers may not be properly cleaned up',
    metrics: `${cleanedTimers}/${totalTimers} timers have cleanup`,
    recommendation: hasProperTimerManagement ? null : 'Ensure all timers are cleared in cleanup functions'
  };
});

// Performance Results Summary
console.log('\n📊 Performance Test Results Summary:');
console.log('='.repeat(60));
console.log(`Total Tests: ${performanceResults.total}`);
console.log(`Passed: ${performanceResults.passed} ✅`);
console.log(`Failed: ${performanceResults.failed} ❌`);
console.log(`Warnings: ${performanceResults.warnings} ⚠️`);

const successRate = ((performanceResults.passed / performanceResults.total) * 100).toFixed(1);
console.log(`Success Rate: ${successRate}%`);

// Performance rating
let performanceRating = 'Poor';
if (successRate >= 90) performanceRating = 'Excellent';
else if (successRate >= 80) performanceRating = 'Good';
else if (successRate >= 70) performanceRating = 'Fair';
else if (successRate >= 60) performanceRating = 'Needs Improvement';

console.log(`Performance Rating: ${performanceRating}`);

if (performanceResults.failed > 0) {
  console.log('\n❌ Failed Performance Tests:');
  performanceResults.results
    .filter(result => result.status === 'FAIL')
    .forEach(result => {
      console.log(`  - ${result.description}: ${result.details}`);
      if (result.metrics) {
        console.log(`    📊 ${result.metrics}`);
      }
    });
}

if (performanceResults.warnings > 0) {
  console.log('\n⚠️  Performance Warnings:');
  performanceResults.results
    .filter(result => result.status === 'WARN')
    .forEach(result => {
      console.log(`  - ${result.description}: ${result.details}`);
      if (result.metrics) {
        console.log(`    📊 ${result.metrics}`);
      }
    });
}

if (performanceResults.recommendations.length > 0) {
  console.log('\n💡 Performance Recommendations:');
  performanceResults.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec.test}`);
    console.log(`     → ${rec.recommendation}`);
  });
}

console.log('\n🎯 Performance Test Categories Covered:');
console.log('  ✅ Bundle Size & Dependencies');
console.log('  ✅ Code Performance Patterns');
console.log('  ✅ Memory Management');
console.log('  ✅ Network Performance');
console.log('  ✅ Animation Performance');
console.log('  ✅ Battery Performance');

console.log('\n📋 Next Steps for Performance:');
console.log('  1. Run app with performance profiler (Flipper/Xcode Instruments)');
console.log('  2. Conduct real device performance testing');
console.log('  3. Monitor memory usage during extended sessions');
console.log('  4. Test battery consumption over 8+ hours');
console.log('  5. Benchmark against performance targets');
console.log('  6. Review PERFORMANCE_TESTING_CHECKLIST.md');

console.log('\n⚡ Performance Testing Complete!');

// Export results for CI/CD integration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = performanceResults;
}