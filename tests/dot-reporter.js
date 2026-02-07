/**
 * Minimal dot reporter for Jest — prints · for pass, ✗ for fail, - for skip.
 */
class DotReporter {
  constructor(globalConfig, reporterOptions, reporterContext) {
    this._globalConfig = globalConfig;
  }

  onTestResult(_test, testResult) {
    for (const t of testResult.testResults) {
      if (t.status === 'passed') process.stderr.write('·');
      else if (t.status === 'failed') process.stderr.write('✗');
      else process.stderr.write('-');
    }
  }

  onRunComplete(_contexts, results) {
    process.stderr.write('\n');
    if (results.numFailedTests > 0) {
      for (const suite of results.testResults) {
        for (const t of suite.testResults) {
          if (t.status === 'failed') {
            process.stderr.write(`\nFAIL: ${t.ancestorTitles.join(' > ')} > ${t.title}\n`);
            for (const msg of t.failureMessages) {
              process.stderr.write(msg + '\n');
            }
          }
        }
      }
    }
    const summary = `${results.numTotalTests} tests, ${results.numFailedTests} failed, ${results.numPendingTests} skipped`;
    process.stderr.write(summary + '\n');
  }
}

module.exports = DotReporter;
