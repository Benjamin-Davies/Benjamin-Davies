import fetch from 'node-fetch';

export interface UserData {
  type: 'User';
  login: string;
  bio: string;
}

export interface UserParams {
  user: string;
}

export interface OrgData {
  type: 'Organization';
  login: string;
}

export interface RepoData {
  name: string;
  full_name: string;
  owner: UserData | OrgData;
}

function constructUrl(urlTemplate: string, params: {}) {
  let url = urlTemplate;
  const props = Object.entries(params).map(([k, v]) => [
    k,
    encodeURIComponent(v.toString()),
  ]);

  // Fill in the {key} things
  for (let i = 0; i < props.length; i++) {
    const [key, value] = props[i];
    const newUrl = url.replace(`{${key}}`, value);
    if (newUrl !== url) {
      url = newUrl;
      props.splice(i, 1);
      i--;
    }
  }

  // And then the query params
  if (props.length > 0) {
    url += `?${props.map(([k, v]) => `${k}=${v}`).join('&')}`;
  }

  return url;
}

async function fetchData<T>(urlTemplate: string, params = {}): Promise<T> {
  const url = constructUrl(urlTemplate, params);

  const headers: any = {
    accept: 'application/vnd.github.v3+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`${url} returned ${res.status}:${res.statusText}`);
  }
  return await res.json();
}

export class Api<Data, Parent extends Api<any, any, any>, Params> {
  type: string;

  constructor(public parent: Parent, public params: Params) {}

  async url(): Promise<string> {
    return await this.parent.childUrl(this.type);
  }

  protected dataCache: Data;

  async data(): Promise<Data> {
    const url = await this.url();
    return (
      this.dataCache ??
      (this.dataCache = await fetchData<Data>(url, this.params))
    );
  }

  async childUrl(category?: string): Promise<string> {
    const data = await this.data();
    return data[`${category}_url`];
  }
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
}

export const github = new GitHub();
export default github;
