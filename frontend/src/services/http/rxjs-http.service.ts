/**
 * RxJS HTTP Service
 * 
 * This service provides rxjs wrappers for HTTP requests.
 * It's designed for handling complex HTTP scenarios like:
 * - Request cancellation
 * - Concurrent requests
 * - Retry and backoff strategies
 * - Caching and memoization
 * - Complex data transformation pipelines
 */

import { Observable, throwError, timer, of } from 'rxjs';
import { 
  map, 
  catchError, 
  timeout, 
  retry, 
  retryWhen, 
  delayWhen, 
  tap, 
  finalize, 
  shareReplay 
} from 'rxjs/operators';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axiosInstance from './axios-config';

// Type definitions for enhanced clarity
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type HttpRequestOptions = AxiosRequestConfig & {
  retries?: number;
  retryDelay?: number;
  timeoutDuration?: number;
  cacheResponse?: boolean;
  cacheTime?: number;
};

/**
 * Creates a caching key for the request
 */
const createCacheKey = (url: string, method: HttpMethod, data?: any): string => {
  const dataString = data ? JSON.stringify(data) : '';
  return `${method}:${url}:${dataString}`;
};

// Simple in-memory cache implementation
const responseCache = new Map<string, {
  response: any;
  timestamp: number;
}>();

/**
 * RxJS HTTP Service for complex HTTP scenarios
 */
class RxjsHttpService {
  private requestMap = new Map<string, Observable<any>>();

  /**
   * Generic request method that returns an Observable
   */
  request<T>(
    method: HttpMethod,
    url: string,
    data?: any,
    options: HttpRequestOptions = {}
  ): Observable<T> {
    const {
      retries = 3,
      retryDelay = 1000,
      timeoutDuration = 30000,
      cacheResponse = false,
      cacheTime = 60000, // 1 minute default cache time
      ...axiosOptions
    } = options;

    // Check cache first if enabled
    if (cacheResponse) {
      const cacheKey = createCacheKey(url, method, data);
      const cachedItem = responseCache.get(cacheKey);
      
      if (cachedItem && (Date.now() - cachedItem.timestamp < cacheTime)) {
        return of(cachedItem.response);
      }
    }

    // Create the final request config
    const requestConfig: AxiosRequestConfig = {
      url,
      method,
      ...axiosOptions
    };

    // Add data to appropriate property based on method
    if (method === 'GET' || method === 'DELETE') {
      requestConfig.params = data;
    } else {
      requestConfig.data = data;
    }

    // Create observable for HTTP request
    return new Observable<T>(observer => {
      // Create a cancellation token
      const source = axios.CancelToken.source();
      requestConfig.cancelToken = source.token;

      // Make the request
      axiosInstance(requestConfig)
        .then((response: AxiosResponse<T>) => {
          // Cache the response if caching is enabled
          if (cacheResponse) {
            const cacheKey = createCacheKey(url, method, data);
            responseCache.set(cacheKey, {
              response: response.data,
              timestamp: Date.now()
            });
          }
          
          observer.next(response.data);
          observer.complete();
        })
        .catch((error: AxiosError) => {
          // Don't reject if the request was canceled
          if (axios.isCancel(error)) {
            observer.complete();
            return;
          }
          
          observer.error(error);
        });

      // Return a cleanup function that will be called when the Observable is unsubscribed
      return () => {
        source.cancel('Request was canceled by user');
      };
    }).pipe(
      // Apply timeout
      timeout(timeoutDuration),
      
      // Apply retry logic with exponential backoff
      retryWhen(errors => 
        errors.pipe(
          // Retry only a specified number of times
          map((error, i) => {
            if (i >= retries) {
              throw error;
            }
            return i;
          }),
          // Exponential backoff strategy
          delayWhen(attemptCount => {
            const delay = Math.pow(2, attemptCount) * retryDelay;
            console.log(`Retrying request after ${delay}ms`);
            return timer(delay);
          })
        )
      ),
      
      // Error handling
      catchError(error => {
        // Log the error
        console.error('HTTP request failed:', error);
        
        // Transform the error if needed
        const transformedError = this.transformError(error);
        
        // Return a new observable with the error
        return throwError(() => transformedError);
      }),
      
      // Finalize operation (runs on complete or error)
      finalize(() => {
        console.log(`Request to ${url} finalized`);
      }),
      
      // Share replay for multiple subscribers
      shareReplay(1)
    );
  }

  /**
   * Transforms error to a more user-friendly format
   */
  private transformError(error: any): any {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.message || 'Server error occurred',
        originalError: error
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        message: 'No response received from server',
        originalError: error
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        message: error.message || 'Unknown error occurred',
        originalError: error
      };
    }
  }

  /**
   * Clears the entire response cache
   */
  clearCache(): void {
    responseCache.clear();
  }

  /**
   * Clears a specific cache entry
   */
  clearCacheEntry(url: string, method: HttpMethod, data?: any): void {
    const cacheKey = createCacheKey(url, method, data);
    responseCache.delete(cacheKey);
  }
}

export const rxjsHttpService = new RxjsHttpService();
export default rxjsHttpService;
