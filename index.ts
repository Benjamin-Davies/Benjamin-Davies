import { readFileSync, writeFileSync } from 'fs';

const template = 'template.md';
const destFile = 'README.md';

const section: { [_: string]: string } = {
  YEAR: `${new Date().getFullYear() - 2008}`,
  REPOS: 'Coming soon...',
};

// Keeping everything in memory should be fine
// because the file size will be small
const input = readFileSync(template, { encoding: 'utf8' });
const output = input.replace(
  /<!-- PLACEHOLDER:(\w+) -->/g,
  (_, name: string) => section[name] ?? `<ERROR: section '${name}' not found>`
);
writeFileSync(destFile, output);
