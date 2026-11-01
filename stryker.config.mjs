export default {
  packageManager: 'npm',
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.config.js'
  },
  mutate: ['src/domain/**/*.js'],
  reporters: ['progress', 'clear-text', 'html'],
  htmlReporter: {
    baseDir: 'reports/mutation/html'
  },
  coverageAnalysis: 'perTest'
};
