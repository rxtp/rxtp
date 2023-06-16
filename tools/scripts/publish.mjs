#! / usr / bin / env node

/**
 * Publish a package to npm.
 *
 * Usage:
 *
 * ```sh
 * node tools/scripts/publish.mjs <project-name> <registry>
 * ```
 */

import { execSync } from 'child_process';
import { invariant } from './invariant.mjs';
const { readCachedProjectGraph } = pkg;
import pkg from '@nx/devkit';

let [, , name, registry] = process.argv;

const graph = readCachedProjectGraph();
const project = graph.nodes[name];
invariant(project, `Could not find project "${name}" in the workspace.`);

const outputPath = project.data?.targets?.build?.options?.outputPath;
invariant(
  outputPath,
  `Could not find "build.options.outputPath" of project "${name}".`
);

invariant(registry, `Provide a registry to publish to.`);

process.chdir(outputPath);
execSync(`npm publish --access public --registry ${registry}`, {
  stdio: 'inherit',
});
