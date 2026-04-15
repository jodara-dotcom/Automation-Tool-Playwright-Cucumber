import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { globby } from 'globby';

async function executeTest() {
console.log('Starting Cucumber test execution...');

console.log('DEBUG: Full process.argv:', process.argv);
console.log('DEBUG: process.argv.length:', process.argv.length);

const argsForCucumber = process.argv.slice(2);
console.log('DEBUG: argsForCucumber (after slice):', argsForCucumber);

const cleanDirectories = () => {
  const videoDir = path.resolve(__dirname, 'videos');
  const reportsDir = path.resolve(__dirname, 'reports');

  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
};

cleanDirectories();

let featuresToRun: string[] = [];
let cucumberFlagsToPass: string[] = [];

if (argsForCucumber.length === 0 || (argsForCucumber.length === 1 && argsForCucumber[0] === '')) {
  console.log('DEBUG: No specific feature/flag arguments provided, running all features by default.');
  const allFeatures = await globby(path.resolve(__dirname, 'features', '**', '*.feature'));
  featuresToRun.push(...allFeatures);
} else {
  console.log('DEBUG: Specific arguments provided for Cucumber.js:', argsForCucumber);

  for (const arg of argsForCucumber) {
    if (arg.startsWith('--')) {
      cucumberFlagsToPass.push(arg);
    } else {
      featuresToRun.push(path.resolve(process.cwd(), arg));
    }
  }
}

const requirePatterns = [
  path.resolve(__dirname, 'src', 'steps', '**', '*.ts'),
  path.resolve(__dirname, 'src', 'support', '**', '*.ts'),
];

console.log('--- Resolved paths ---');
console.log('Features to run:', featuresToRun);
console.log('Cucumber Flags:', cucumberFlagsToPass);
console.log('Require Patterns:', requirePatterns);
console.log('----------------------');

const cucumberCommandArgs = [
  '--require-module', 'ts-node/register',
  '--require', requirePatterns[0],
  '--require', requirePatterns[1],
  ...featuresToRun,
  ...cucumberFlagsToPass,
  '--format', `html:${path.resolve(__dirname, 'reports', 'cucumber-report.html')}`,
  '--format', `json:${path.resolve(__dirname, 'reports', 'cucumber-report.json')}`,
  '--format', 'summary'
];

const cucumberExecutable = path.resolve(__dirname, 'node_modules', '.bin', 'cucumber-js');
const command = `node -r ts-node/register ${cucumberExecutable} ${cucumberCommandArgs.join(' ')}`;

console.log('\nExecuting Cucumber command:\n', command, '\n');

const { stdout, stderr, exitCode } = await new Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}>((resolve) => {
  exec(command, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Cucumber command failed with exit code ${error.code}`);
      resolve({
        stdout,
        stderr,
        exitCode: error.code ?? 1,
      });
    } else {
      resolve({
        stdout,
        stderr,
        exitCode: 0,
      });
    }
  });
});

console.log('--- Cucumber Output ---');
console.log(stdout);

if (stderr) {
  console.error('--- Cucumber Errors (stderr) ---');
  console.error(stderr);
}

console.log('---------------------');

const success = exitCode === 0;

console.log(`\nTest execution finished. Success: ${success}`);
if (!success) {
  console.error('Some tests failed. Check reports/cucumber-report.html for details.');
} else {
  console.log('All tests passed successfully!');
}

process.exit(success ? 0 : 1);
}

executeTest().catch((error) => {
console.error('An error occurred during test execution:', error.message);
process.exit(1);
});