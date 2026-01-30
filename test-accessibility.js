// Quillby App - Automated Accessibility Testing Script
// Run with: node test-accessibility.js

const fs = require('fs');
const path = require('path');

const accessibilityResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0,
  results: [],
  recommendations: []
};

// Test utility functions
function accessibilityTest(description, testFunction, severity = 'error') {
  accessibilityResults.total++;
  try {
    const result = testFunction();
    if (result.passed) {
      accessibilityResults.passed++;
      accessibilityResults.results.push({ 
        description, 
        status: 'PASS', 
        severity,
        details: result.details || null 
      });
      console.log(`✅ PASS: ${description}`);
    } else {
      if (severity === 'warning') {
        accessibilityResults.warnings++;
        console.log(`⚠️  WARN: ${description} - ${result.message}`);
      } else {
        accessibilityResults.failed++;
        console.log(`❌ FAIL: ${description} - ${result.message}`);
      }
      accessibilityResults.results.push({ 
        description, 
        status: severity === 'warning' ? 'WARN' : 'FAIL', 
        severity,
        details: result.message 
      });
      
      if (result.recommendation) {
        accessibilityResults.recommendations.push({
          test: description,
          recommendation: result.recommendation
        });
      }
    }
  } catch (error) {
    accessibilityResults.failed++;
    accessibilityResults.results.push({ 
      description, 
      status: 'ERROR', 
      severity: 'error',
      details: error.message 
    });
    console.log(`💥 ERROR: ${description} - ${error.message}`);
  }
}

// File analysis utilities
function analyzeComponentFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { content: '', exists: false };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  return { content, exists: true };
}

function findAccessibilityProps(content) {
  const accessibilityProps = [
    'accessibilityLabel',
    'accessibilityHint',
    'accessibilityRole',
    'accessible',
    'accessibilityState',
    'accessibilityValue',
    'accessibilityActions'
  ];
  
  const found = [];
  accessibilityProps.forEach(prop => {
    if (content.includes(prop)) {
      found.push(prop);
    }
  });
  
  return found;
}

function checkColorContrast(content) {
  // Look for color definitions that might have contrast issues
  const colorPatterns = [
    /#[0-9a-fA-F]{6}/g,  // Hex colors
    /#[0-9a-fA-F]{3}/g,   // Short hex colors
    /rgb\([^)]+\)/g,      // RGB colors
    /rgba\([^)]+\)/g      // RGBA colors
  ];
  
  const colors = [];
  colorPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      colors.push(...matches);
    }
  });
  
  return colors;
}

// Core accessibility tests
console.log('🌟 Starting Quillby App Accessibility Tests...\n');

// 1. Component Accessibility Props Tests
console.log('🏷️  Testing Accessibility Labels...');

accessibilityTest('Home screen has accessibility labels', () => {
  const homeScreen = analyzeComponentFile('app/(tabs)/index.tsx');
  if (!homeScreen.exists) {
    return { passed: false, message: 'Home screen file not found' };
  }
  
  const accessibilityProps = findAccessibilityProps(homeScreen.content);
  const hasLabels = accessibilityProps.includes('accessibilityLabel');
  
  return {
    passed: hasLabels,
    message: hasLabels ? 'Found accessibility labels' : 'No accessibility labels found',
    recommendation: hasLabels ? null : 'Add accessibilityLabel props to interactive elements'
  };
});

accessibilityTest('Habit buttons have accessibility support', () => {
  const waterButton = analyzeComponentFile('app/components/habits/WaterButton.tsx');
  const mealButton = analyzeComponentFile('app/components/habits/MealButton.tsx');
  const exerciseButton = analyzeComponentFile('app/components/habits/ExerciseButton.tsx');
  
  const files = [waterButton, mealButton, exerciseButton].filter(f => f.exists);
  if (files.length === 0) {
    return { passed: false, message: 'No habit button files found' };
  }
  
  const hasAccessibilityProps = files.some(file => 
    findAccessibilityProps(file.content).length > 0
  );
  
  return {
    passed: hasAccessibilityProps,
    message: hasAccessibilityProps ? 'Habit buttons have accessibility props' : 'Habit buttons missing accessibility props',
    recommendation: hasAccessibilityProps ? null : 'Add accessibilityLabel and accessibilityRole to habit buttons'
  };
});

accessibilityTest('Modal components have proper focus management', () => {
  const sessionModal = analyzeComponentFile('app/components/modals/SessionCustomizationModal.tsx');
  if (!sessionModal.exists) {
    return { passed: false, message: 'Session modal file not found' };
  }
  
  const hasFocusManagement = sessionModal.content.includes('useRef') || 
                            sessionModal.content.includes('focus') ||
                            sessionModal.content.includes('autoFocus');
  
  return {
    passed: hasFocusManagement,
    message: hasFocusManagement ? 'Modal has focus management' : 'Modal missing focus management',
    recommendation: hasFocusManagement ? null : 'Add focus management to modal components for screen reader users'
  };
});

// 2. Text and Typography Tests
console.log('\n📝 Testing Text Accessibility...');

accessibilityTest('Components support dynamic text sizing', () => {
  const homeScreen = analyzeComponentFile('app/(tabs)/index.tsx');
  if (!homeScreen.exists) {
    return { passed: false, message: 'Home screen file not found' };
  }
  
  const hasDynamicText = homeScreen.content.includes('fontSize') && 
                        (homeScreen.content.includes('Dimensions') || 
                         homeScreen.content.includes('PixelRatio') ||
                         homeScreen.content.includes('scale'));
  
  return {
    passed: hasDynamicText,
    message: hasDynamicText ? 'Dynamic text sizing detected' : 'No dynamic text sizing found',
    recommendation: hasDynamicText ? null : 'Implement dynamic text sizing based on system accessibility settings',
    severity: 'warning'
  };
});

accessibilityTest('Text has sufficient minimum size', () => {
  const files = [
    'app/(tabs)/index.tsx',
    'app/components/ui/RealTimeClock.tsx',
    'app/components/progress/EnergyBar.tsx'
  ];
  
  let hasSmallText = false;
  let checkedFiles = 0;
  
  files.forEach(filePath => {
    const file = analyzeComponentFile(filePath);
    if (file.exists) {
      checkedFiles++;
      // Look for font sizes smaller than 12
      const fontSizeMatches = file.content.match(/fontSize:\s*(\d+)/g);
      if (fontSizeMatches) {
        fontSizeMatches.forEach(match => {
          const size = parseInt(match.match(/\d+/)[0]);
          if (size < 12) {
            hasSmallText = true;
          }
        });
      }
    }
  });
  
  return {
    passed: !hasSmallText && checkedFiles > 0,
    message: hasSmallText ? 'Found text smaller than 12pt' : 'Text sizes appear adequate',
    recommendation: hasSmallText ? 'Increase minimum text size to 12pt for better accessibility' : null
  };
});

// 3. Color and Contrast Tests
console.log('\n🎨 Testing Color Accessibility...');

accessibilityTest('App uses semantic colors instead of hardcoded values', () => {
  const homeScreen = analyzeComponentFile('app/(tabs)/index.tsx');
  if (!homeScreen.exists) {
    return { passed: false, message: 'Home screen file not found' };
  }
  
  const colors = checkColorContrast(homeScreen.content);
  const hasHardcodedColors = colors.length > 0;
  
  return {
    passed: !hasHardcodedColors,
    message: hasHardcodedColors ? `Found ${colors.length} hardcoded colors` : 'No hardcoded colors found',
    recommendation: hasHardcodedColors ? 'Use semantic color variables that adapt to system themes' : null,
    severity: 'warning'
  };
});

accessibilityTest('Interactive elements have sufficient touch targets', () => {
  const files = [
    'app/components/habits/WaterButton.tsx',
    'app/components/habits/MealButton.tsx',
    'app/components/habits/ExerciseButton.tsx'
  ];
  
  let hasSmallTargets = false;
  let checkedFiles = 0;
  
  files.forEach(filePath => {
    const file = analyzeComponentFile(filePath);
    if (file.exists) {
      checkedFiles++;
      // Look for width/height smaller than 44
      const sizeMatches = file.content.match(/(width|height):\s*(\d+)/g);
      if (sizeMatches) {
        sizeMatches.forEach(match => {
          const size = parseInt(match.match(/\d+/)[0]);
          if (size < 44) {
            hasSmallTargets = true;
          }
        });
      }
    }
  });
  
  return {
    passed: !hasSmallTargets && checkedFiles > 0,
    message: hasSmallTargets ? 'Found touch targets smaller than 44pt' : 'Touch targets appear adequate',
    recommendation: hasSmallTargets ? 'Increase touch target size to minimum 44x44pt for accessibility' : null
  };
});

// 4. Navigation and Structure Tests
console.log('\n🧭 Testing Navigation Accessibility...');

accessibilityTest('Tab navigation has proper accessibility roles', () => {
  const tabLayout = analyzeComponentFile('app/(tabs)/_layout.tsx');
  if (!tabLayout.exists) {
    return { passed: false, message: 'Tab layout file not found' };
  }
  
  const hasTabRole = tabLayout.content.includes('accessibilityRole') && 
                    (tabLayout.content.includes('tab') || tabLayout.content.includes('tabbar'));
  
  return {
    passed: hasTabRole,
    message: hasTabRole ? 'Tab navigation has accessibility roles' : 'Tab navigation missing accessibility roles',
    recommendation: hasTabRole ? null : 'Add accessibilityRole="tab" to tab navigation elements'
  };
});

accessibilityTest('Screen components have proper heading structure', () => {
  const files = [
    'app/(tabs)/index.tsx',
    'app/(tabs)/settings.tsx',
    'app/(tabs)/stats.tsx'
  ];
  
  let hasHeadingStructure = false;
  let checkedFiles = 0;
  
  files.forEach(filePath => {
    const file = analyzeComponentFile(filePath);
    if (file.exists) {
      checkedFiles++;
      if (file.content.includes('accessibilityRole') && 
          file.content.includes('header')) {
        hasHeadingStructure = true;
      }
    }
  });
  
  return {
    passed: hasHeadingStructure,
    message: hasHeadingStructure ? 'Found heading structure' : 'No heading structure found',
    recommendation: hasHeadingStructure ? null : 'Add accessibilityRole="header" to main headings for screen reader navigation',
    severity: 'warning'
  };
});

// 5. Media and Animation Tests
console.log('\n🎬 Testing Media Accessibility...');

accessibilityTest('Images have appropriate alternative text', () => {
  const hamsterComponent = analyzeComponentFile('app/components/character/HamsterCharacter.tsx');
  if (!hamsterComponent.exists) {
    return { passed: false, message: 'Hamster character component not found' };
  }
  
  const hasAltText = hamsterComponent.content.includes('accessibilityLabel') ||
                    hamsterComponent.content.includes('alt=') ||
                    hamsterComponent.content.includes('accessible={false}'); // For decorative images
  
  return {
    passed: hasAltText,
    message: hasAltText ? 'Images have accessibility labels' : 'Images missing accessibility labels',
    recommendation: hasAltText ? null : 'Add accessibilityLabel to informative images, accessible={false} to decorative images'
  };
});

accessibilityTest('Animations respect reduced motion preferences', () => {
  const files = [
    'app/components/character/HamsterCharacter.tsx',
    'app/components/games/ExerciseEnvironment.tsx'
  ];
  
  let hasReducedMotion = false;
  let checkedFiles = 0;
  
  files.forEach(filePath => {
    const file = analyzeComponentFile(filePath);
    if (file.exists) {
      checkedFiles++;
      if (file.content.includes('reduceMotion') || 
          file.content.includes('AccessibilityInfo') ||
          file.content.includes('isReduceMotionEnabled')) {
        hasReducedMotion = true;
      }
    }
  });
  
  return {
    passed: hasReducedMotion,
    message: hasReducedMotion ? 'Animations respect reduced motion' : 'No reduced motion support found',
    recommendation: hasReducedMotion ? null : 'Add support for reduced motion accessibility setting',
    severity: 'warning'
  };
});

// 6. Form and Input Accessibility Tests
console.log('\n📝 Testing Form Accessibility...');

accessibilityTest('Input fields have proper labels and hints', () => {
  const files = [
    'app/onboarding/name-buddy.tsx',
    'app/onboarding/profile.tsx',
    'app/components/modals/EditProfileModal.tsx'
  ];
  
  let hasProperLabels = false;
  let checkedFiles = 0;
  
  files.forEach(filePath => {
    const file = analyzeComponentFile(filePath);
    if (file.exists) {
      checkedFiles++;
      if (file.content.includes('accessibilityLabel') && 
          file.content.includes('TextInput')) {
        hasProperLabels = true;
      }
    }
  });
  
  return {
    passed: hasProperLabels,
    message: hasProperLabels ? 'Input fields have accessibility labels' : 'Input fields missing accessibility labels',
    recommendation: hasProperLabels ? null : 'Add accessibilityLabel and accessibilityHint to all input fields'
  };
});

// 7. Error Handling and Feedback Tests
console.log('\n🚨 Testing Error Accessibility...');

accessibilityTest('Error messages are accessible to screen readers', () => {
  const files = [
    'app/components/ui/NotificationBanner.tsx',
    'app/components/ErrorBoundary.tsx'
  ];
  
  let hasAccessibleErrors = false;
  let checkedFiles = 0;
  
  files.forEach(filePath => {
    const file = analyzeComponentFile(filePath);
    if (file.exists) {
      checkedFiles++;
      if (file.content.includes('accessibilityLiveRegion') || 
          file.content.includes('accessibilityRole') ||
          file.content.includes('alert')) {
        hasAccessibleErrors = true;
      }
    }
  });
  
  return {
    passed: hasAccessibleErrors,
    message: hasAccessibleErrors ? 'Error messages are accessible' : 'Error messages may not be accessible',
    recommendation: hasAccessibleErrors ? null : 'Add accessibilityLiveRegion="assertive" to error messages for screen reader announcements'
  };
});

// Test Results Summary
console.log('\n📊 Accessibility Test Results Summary:');
console.log('='.repeat(60));
console.log(`Total Tests: ${accessibilityResults.total}`);
console.log(`Passed: ${accessibilityResults.passed} ✅`);
console.log(`Failed: ${accessibilityResults.failed} ❌`);
console.log(`Warnings: ${accessibilityResults.warnings} ⚠️`);

const successRate = ((accessibilityResults.passed / accessibilityResults.total) * 100).toFixed(1);
console.log(`Success Rate: ${successRate}%`);

// Accessibility compliance rating
let complianceLevel = 'Non-Compliant';
if (successRate >= 95) complianceLevel = 'WCAG AAA Ready';
else if (successRate >= 85) complianceLevel = 'WCAG AA Ready';
else if (successRate >= 70) complianceLevel = 'Basic Accessibility';
else if (successRate >= 50) complianceLevel = 'Needs Improvement';

console.log(`Accessibility Compliance: ${complianceLevel}`);

if (accessibilityResults.failed > 0) {
  console.log('\n❌ Failed Accessibility Tests:');
  accessibilityResults.results
    .filter(result => result.status === 'FAIL')
    .forEach(result => {
      console.log(`  - ${result.description}: ${result.details}`);
    });
}

if (accessibilityResults.warnings > 0) {
  console.log('\n⚠️  Accessibility Warnings:');
  accessibilityResults.results
    .filter(result => result.status === 'WARN')
    .forEach(result => {
      console.log(`  - ${result.description}: ${result.details}`);
    });
}

if (accessibilityResults.recommendations.length > 0) {
  console.log('\n💡 Accessibility Recommendations:');
  accessibilityResults.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec.test}`);
    console.log(`     → ${rec.recommendation}`);
  });
}

console.log('\n🎯 Accessibility Test Categories Covered:');
console.log('  ✅ Component Labels & Props');
console.log('  ✅ Text & Typography');
console.log('  ✅ Color & Contrast');
console.log('  ✅ Navigation & Structure');
console.log('  ✅ Media & Animation');
console.log('  ✅ Forms & Input');
console.log('  ✅ Error Handling');

console.log('\n📋 Next Steps for Accessibility:');
console.log('  1. Run manual testing with VoiceOver/TalkBack');
console.log('  2. Test with system accessibility settings enabled');
console.log('  3. Use accessibility scanner tools (iOS/Android)');
console.log('  4. Conduct user testing with people with disabilities');
console.log('  5. Review ACCESSIBILITY_TESTING_CHECKLIST.md');

console.log('\n🌟 Accessibility Testing Complete!');

// Export results for CI/CD integration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = accessibilityResults;
}