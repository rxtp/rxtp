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

const [, , name, registry, ci] = process.argv;

invariant(
  ci === 'true',
  `This script is only meant to be run in CI, got ${ci}.`
);

const validRegistry = /^https?:\/\/.+$/;
invariant(
  registry && validRegistry.test(registry),
  `No registry provided or registry did not match URL, expected: http(s)://..., got ${registry}.`
);

const graph = readCachedProjectGraph();
const project = graph.nodes[name];

invariant(
  project,
  `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
);

const outputPath = project.data?.targets?.build?.options?.outputPath;
invariant(
  outputPath,
  `Could not find "build.options.outputPath" of project "${name}". Is project.json configured  correctly?`
);

process.chdir(outputPath);

execSync(`npm publish --@rxtp:registry=${registry} --access public --tag latest`);
