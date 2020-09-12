import { Api } from './core';

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

export class Repos extends Api<RepoData[], User, ReposParams> {
  type = 'repos';
}

export const github = new GitHub();
export default github;
