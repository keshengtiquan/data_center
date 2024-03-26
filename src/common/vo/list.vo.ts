export class ListVo<T> {
  results: Array<T>;
  total: number;
  current: number;
  pageSize: number;

  constructor(
    results: Array<T> = [],
    total: number = 0,
    current: number = 1,
    pageSize: number = 10,
  ) {
    this.results = results;
    this.total = total;
    this.current = current;
    this.pageSize = pageSize;
  }
}
