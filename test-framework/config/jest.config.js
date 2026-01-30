// Jest Configuration for Quillby App
// Optimized for React Native/Expo testing

module.exports = {
  preset: 'react-native',
  
  // Test environment setup
  setupFilesAfterEnv: [
    '<rootDir>/test-framework/config/test-setup.js'
  ],
  
  // Module paths and aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@test/(.*)$': '<rootDir>/test-framework/$1'
  },
  
  // File patterns
  testMatch: [
    '<rootDir>/test-framework/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/test-framework/integration/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/app/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/lib/**/__tests__/**/*.{js,jsx,ts,tsx}'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/index.{js,ts}',
    '!app/**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    },
    // Critical components require higher coverage
    './app/state/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './lib/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Mock configuration
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@supabase|zustand)/)'
  ],
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Performance optimization
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/test-framework/cache',
  
  // Reporting
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './test-framework/reports',
        filename: 'test-report.html',
        expand: true,
        hideIcon: false
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './test-framework/reports',
        outputName: 'junit.xml'
      }
    ]
  ],
  
  // Coverage reporting
  coverageDirectory: './test-framework/reports/coverage',
  coverageReporters: ['html', 'lcov', 'text', 'json-summary'],
  
  // Global variables for tests
  globals: {
    __DEV__: true,
    __TEST__: true
  },
  
  // Timeout configuration
  testTimeout: 10000,
  
  // Verbose output for debugging
  verbose: false,
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Watch mode configuration
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/test-framework/reports/',
    '<rootDir>/test-framework/cache/'
  ]
};