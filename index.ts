import { promises as fs } from 'fs';
import github, { User } from './github';

const template = 'template.md';
const destFile = process.env.DEST_FILE ?? 'preview.md';
const username = 'Benjamin-Davies';

async function getBio(user: User): Promise<string> {
  const userData = await user.data();
  // Replace double spaces with nbsp
  return userData.bio.replace(/\s\s/g, ' &nbsp;');
}

async function getRepos(_user: User): Promise<string> {
  return 'Coming soon...';
}

function replaceSections(sections: { [_: string]: string }, input: string): string {
  return input.replace(
    /<!-- PLACEHOLDER:(\w+) -->/g,
    (_, name: string) => sections[name] ?? `<ERROR: section '${name}' not found>`
  );
}

async function run() {
  const user = github.user({ user: username });
  const sections = {
    BIO: await getBio(user),
    REPOS: await getRepos(user),
  };

  // Keeping everything in memory should be fine
  // because the file size will be small
  const input = await fs.readFile(template, { encoding: 'utf8' });
  const output = replaceSections(sections, input);
  await fs.writeFile(destFile, output);
}

run();
