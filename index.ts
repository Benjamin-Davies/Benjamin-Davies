import { promises as fs } from 'fs';

const template = 'template.md';
const destFile = process.env.DEST_FILE ?? 'preview.md';

function getSchoolYear() {
  const schoolYear = new Date().getFullYear() - 2008;
  return `${schoolYear}`;
}

function replaceSections(sections: { [_: string]: string }, input: string): string {
  return input.replace(
    /<!-- PLACEHOLDER:(\w+) -->/g,
    (_, name: string) => sections[name] ?? `<ERROR: section '${name}' not found>`
  );
}

async function run() {
  const sections = {
    YEAR: getSchoolYear(),
    REPOS: 'Coming soon to a page near you...',
  };

  // Keeping everything in memory should be fine
  // because the file size will be small
  const input = await fs.readFile(template, { encoding: 'utf8' });
  const output = replaceSections(sections, input);
  await fs.writeFile(destFile, output);
}

run();
