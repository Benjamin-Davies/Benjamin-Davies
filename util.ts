export async function* concatAsyncIterables<T>(...iterables: AsyncIterable<T>[]): AsyncIterable<T> {
  for (const iterable of iterables) {
    for await (const item of iterable) {
      yield item;
    }
  }
}