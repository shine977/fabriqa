export interface PaginationOptions {
  defaultPageSize?: number;
  maxPageSize?: number;
  defaultCurrent?: number;
}

export interface PaginationResult {
  pageSize: number;
  current: number;
  total?: number;
  [key: string]: any;
}