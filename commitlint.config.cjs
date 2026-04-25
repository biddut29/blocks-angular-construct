module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'perf',
        'revert',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'type-case': [2, 'always', 'lower-case'],
  },
};
