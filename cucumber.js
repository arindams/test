module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      'features/support/**/*.ts',
      'features/step_definitions/**/*.ts'
    ],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['features/**/*.feature'],
    publishQuiet: true
  }
};