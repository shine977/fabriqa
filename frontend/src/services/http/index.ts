/**
 * HTTP Service Index
 * 
 * This file exports the HTTP service and related utilities.
 */

export * from './http.service';
export { default as httpService } from './http.service';
export { default as axiosInstance } from './axios-config';
export { default as rxjsHttpService } from './rxjs-http.service';

// Re-export types for convenience
export type { HttpResponse, PaginationParams, FilterParams } from './http.service';
export type { HttpMethod, HttpRequestOptions } from './rxjs-http.service';
