export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNo: number;
  pageSize: number;
  totalPages: number;
}