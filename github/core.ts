import { fetchData } from "./util";

export class Api<Data, Parent extends Api<any, any, any>, Params> {
  type: string;

  constructor(public parent: Parent, public params: Params) {}

  async url(): Promise<string> {
    return await this.parent.childUrl(this.type);
  }

  protected dataCache: Data;

  async data(): Promise<Data> {
    const url = await this.url();
    if (!this.dataCache) {
      this.dataCache = await fetchData<Data>(url, this.params);
    }
    return this.dataCache;
  }

  async childUrl(category?: string): Promise<string> {
    const data = await this.data();
    return data[`${category}_url`];
  }
}
