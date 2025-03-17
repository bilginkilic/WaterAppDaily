module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-.*|@react-native-community)/)',
  ],
  setupFiles: [
    '<rootDir>/src/__mocks__/setup.js'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/', '/src/__mocks__/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types.ts',
    '!src/index.tsx',
    '!src/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
