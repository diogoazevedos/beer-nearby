module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    '**/*.js',
    '!dist/**',
    '!coverage/**',
    '!test/**',
    '!jest.config.js',
    '!webpack.config.js',
  ],
  coverageReporters: [
    'text',
    'html',
  ],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
  testEnvironment: 'node',
};
