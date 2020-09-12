import { nextTick } from 'process';
import { Api, CollectionApi } from './core';

export interface UserData {
  type: 'User' | 'Organization';
  login: string;
  bio: string;
}

export interface UserParams {
  user: string;
}

export interface RepoData {
  name: string;
  full_name: string;
  owner: UserData;
}

export interface ReposParams {
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
}

export interface CommitData {
  sha: string;
  author: UserData;
  commiter: UserData;
}

export class GitHub extends Api<{}, null, {}> {
  constructor() {
    super(null, {});
  }

  async url() {
    return 'https://api.github.com';
  }

  user(params: UserParams) {
    return new User(this, params);
  }
}

export class User extends Api<UserData, GitHub, UserParams> {
  type = 'user';

  repos(params: ReposParams = {}) {
    return new Repos(this, params);
  }
}

export class Repos extends CollectionApi<RepoData, User, ReposParams, Repo> {
  type = 'repos';

  protected createItem(data: RepoData): Repo {
    const repo = new Repo(this.parent, null);
    repo.dataCache = data;
    return repo;
  }
}

export class Repo extends Api<RepoData, User, {}> {
  type = 'repo';

  commits() {
    return new Commits(this, {});
  }
}

export class Commits extends CollectionApi<CommitData, Repo, {}, Commit> {
  type = 'commits';

  protected createItem(data: CommitData) {
    const commit = new Commit(this.parent, {});
    commit.dataCache = data;
    return commit;
  }
}

export class Commit extends Api<CommitData, Repo, {}> {
  type = 'commit';
}

export const github = new GitHub();
export default github;
