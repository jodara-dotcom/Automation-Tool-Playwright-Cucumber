module.exports = {
default: {
  format: [
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
    'summary',
    'progress-bar'
  ],
  worldParameters: {}
}
};