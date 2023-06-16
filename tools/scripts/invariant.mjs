import chalk from 'chalk';

/**
 * Validate a condition. If the condition is not met, print an error message
 * and exit the process with exit code 1.
 */
export function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  }
}
