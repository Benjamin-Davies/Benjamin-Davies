import { promises as fs } from 'fs';
import github, { RepoData, User } from './github';
import { concatAsyncIterables } from './util';

const template = 'template.md';
const destFile = process.env.DEST_FILE ?? 'preview.md';
const username = 'Benjamin-Davies';
const groups = ['stemwana-youthdev', 'DefinitelyTyped'];
const maxCommits = 50;

async function getBio(user: User): Promise<string> {
  const userData = await user.data();
  // Replace double spaces with nbsp
  return userData.bio.replace(/\s\s/g, ' &nbsp;');
}

async function getRepos(user: User): Promise<string> {
  const userRepos = user.repos({ sort: 'updated', per_page: 10 });
  const groupRepos = groups.map((org) =>
    github.org({ org }).repos({ sort: 'updated', per_page: 5 })
  );
  let repos: { data: RepoData; commitCount: number }[] = [];
  for await (const repo of concatAsyncIterables(userRepos, ...groupRepos)) {
    const data = await repo.data();

    const since = new Date();
    since.setMonth(since.getMonth() - 1);
    const commitCount = await repo
      .commits({ author: username, since, per_page: maxCommits })
      .length();

    repos.push({ data, commitCount });
  }

  repos = repos.filter((repo) => repo.commitCount >= 1);
  repos.sort((a, b) => b.commitCount - a.commitCount);

  return repos
    .map(({ data, commitCount }) => {
      let commitCountText: string;
      if (commitCount === 1) {
        commitCountText = '1 commit';
      } else if (commitCount === maxCommits) {
        commitCountText = `${commitCount}+ commits`;
      } else {
        commitCountText = `${commitCount} commits`;
      }
      return `
### [${data.owner.login === username ? data.name : data.full_name}](${data.homepage || data.html_url})

*${commitCountText} in the last month*

${data.description}
`;
    })
    .join('\n');
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
