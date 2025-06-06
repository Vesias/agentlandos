module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system changes
        'ci',       // CI/CD changes
        'chore',    // Other changes
        'revert',   // Reverting changes
        '🎤',       // Voice features (custom emoji)
        '🤖',       // AI features (custom emoji)
        '🚀',       // Deployment (custom emoji)
        '🔍',       // Search features (custom emoji)
        '🔧',       // Configuration (custom emoji)
        '🔒',       // Security (custom emoji)
        '✅',       // Fixes/completion (custom emoji)
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 200],
    'footer-max-line-length': [2, 'always', 200],
  },
}