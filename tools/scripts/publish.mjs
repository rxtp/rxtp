import { execSync } from 'child_process';
import chalk from 'chalk';
import pkg from '@nx/devkit';
const { readCachedProjectGraph } = pkg;

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  }
}

const [, , name] = process.argv;

const graph = readCachedProjectGraph();
const project = graph.nodes[name];

invariant(
  project,
  `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
);

const outputPath = project.data?.targets?.build?.options?.outputPath;
invariant(
  outputPath,
  `Could not find "build.options.outputPath" of project "${name}".`
);

process.chdir(outputPath);

execSync('npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN');
execSync('npm config set //npm.pkg.github.com/rxtp/:_authToken $GITHUB_TOKEN');

execSync('npm whoami', { stdio: 'inherit' });
execSync('npm config ls -l', { stdio: 'inherit' });

execSync('npm publish --access public --registry https://registry.npmjs.org', {
  stdio: 'inherit',
});

execSync('npm whoami', { stdio: 'inherit' });
execSync('npm config ls -l', { stdio: 'inherit' });

execSync(
  'npm publish --access public --registry https://npm.pkg.github.com/rxtp',
  {
    stdio: 'inherit',
  }
);
