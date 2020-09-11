import { promises as fs } from 'fs';

const template = 'template.md';
const destFile = 'README.md';

async function run() {
  const sections: { [_: string]: string } = {
    YEAR: `${new Date().getFullYear() - 2008}`,
    REPOS: 'Coming soon...',
  };

  // Keeping everything in memory should be fine
  // because the file size will be small
  const input = await fs.readFile(template, { encoding: 'utf8' });
  const output = input.replace(
    /<!-- PLACEHOLDER:(\w+) -->/g,
    (_, name: string) => sections[name] ?? `<ERROR: section '${name}' not found>`
  );
  await fs.writeFile(destFile, output);
}

run();
