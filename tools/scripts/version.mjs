import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import pkg from '@nx/devkit';
const { readCachedProjectGraph } = pkg;

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  }
}

const [, , version] = process.argv;

const validSemver = /^\d+\.\d+\.\d+(-\w+\.\d+)?/;
const validBumpVersion = /^major|minor|patch$/;

invariant(
  version && (validSemver.test(version) || validBumpVersion.test(version)),
  `No version provided or version did not match Semantic Versioning, expected: v#.#.#-tag.# or v#.#.#, got ${version}.`
);

const workspaceRoot = process.cwd();
const updatedFiles = [];

const packageJson = JSON.parse(readFileSync(join(workspaceRoot, 'package.json'), 'utf-8'));

invariant(
  packageJson.version,
  `Could not find "version" in package.json. Is package.json configured correctly?`
);

const bumpVersion = () => {
  const [major, minor, patch] = packageJson.version.replace('v', '').split('.');
  switch (version) {
    case 'major':
      return `${Number(major) + 1}.0.0`;
    case 'minor':
      return `${major}.${Number(minor) + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${Number(patch) + 1}`;
    default:
      return version;
  }
}
const versionTag = validSemver.test(version) ? `v${version}` : `v${bumpVersion()}`;

execSync('npm version --allow-same-version=true --no-git-tag-version ' + version);
updatedFiles.push(join(workspaceRoot, 'package.json'));
updatedFiles.push(join(workspaceRoot, 'package-lock.json'));

const graph = readCachedProjectGraph();
const projects = Object.keys(graph.nodes).map((key) => graph.nodes[key]);

for (let project of projects) {
  const sourceRoot = project.data?.sourceRoot;
  invariant(
    sourceRoot,
    `Could not find "sourceRoot" of project "${project.name}". Is project.json configured  correctly?`
  );
  process.chdir(sourceRoot);
  execSync('npm version --allow-same-version=true --no-git-tag-version ' + version);
  process.chdir(workspaceRoot);
  updatedFiles.push(join(workspaceRoot, project.data.root, 'package.json'));
}

execSync('git add ' + updatedFiles.join(' '));
execSync('git commit -m "chore(workspace): release ' + versionTag + '"');
execSync('git tag ' + versionTag + ' -m "chore(workspace): release ' + versionTag + '"');
