import { fetchData } from './util';

export type AnyApi = Api<any, AnyApi, any>;

export class Api<Data, Parent extends AnyApi, Params> {
  type: string;
  dataCache: Data;

  constructor(public parent: Parent, public params: Params) {}

  async url(): Promise<string> {
    return await this.parent.childUrl(this.type);
  }

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

export class CollectionApi<
    Data,
    Parent extends AnyApi,
    Params,
    Item extends AnyApi
  >
  extends Api<Data[], Parent, Params>
  implements AsyncIterableIterator<Item> {
  private index = 0;

  protected createItem(_data: Data): Item {
    throw new Error('Method not implemented.');
  }

  async length(): Promise<number> {
    const data = await this.data();
    return data.length;
  }

  async next(): Promise<IteratorResult<Item>> {
    const data = await this.data();
    if (this.index < data.length) {
      const value = this.createItem(data[this.index]);
      this.index++;
      return { value };
    } else {
      return { done: true, value: null };
    }
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<Item> {
    return this;
  }
}
