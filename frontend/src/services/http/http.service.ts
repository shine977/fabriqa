/**
 * HTTP Service
 * 
 * This service provides a unified interface for making HTTP requests.
 * It combines straightforward axios-based CRUD operations for simple cases
 * and rxjs-powered requests for more complex scenarios.
 * 
 * Features:
 * - Simple promise-based API for basic CRUD operations
 * - Observable-based API for complex scenarios
 * - Automatic token handling
 * - Error transformation
 * - Request cancellation
 * - Retry mechanisms
 * - Response caching
 */

import { Observable } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosInstance from './axios-config';
import rxjsHttpService, { HttpMethod, HttpRequestOptions } from './rxjs-http.service';

// Generic type for request and response data
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

// Type for pagination parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Type for filter parameters
export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined;
}

class HttpService {
  // Base URL from configuration
  private baseUrl: string = axiosInstance.defaults.baseURL || '';

  /**
   * Standard GET request - Promise based
   */
  async get<T = any>(
    url: string, 
    params?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await axiosInstance.get<T>(url, { 
        params, 
        ...config 
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Standard POST request - Promise based
   */
  async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Standard PUT request - Promise based
   */
  async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Standard PATCH request - Promise based
   */
  async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await axiosInstance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Standard DELETE request - Promise based
   */
  async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * GET request with pagination and filtering - Promise based
   */
  async getWithPagination<T = any>(
    url: string,
    paginationParams: PaginationParams = {},
    filterParams: FilterParams = {},
    config?: AxiosRequestConfig
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      // Combine pagination and filter params
      const params = {
        ...paginationParams,
        ...filterParams
      };
      
      const response = await axiosInstance.get<{
        data: T[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>(url, { params, ...config });
      
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Batch upload files - Promise based
   */
  async uploadFiles<T = any>(
    url: string,
    files: File[],
    additionalData?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const formData = new FormData();
      
      // Append files
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      
      // Append additional data if provided
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
      }
      
      const response = await axiosInstance.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        ...config
      });
      
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Download file - Promise based
   */
  async downloadFile(
    url: string,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    try {
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
        ...config
      });
      
      // Create a download link and trigger download if filename is provided
      if (filename) {
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      }
      
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // =====================================================================
  // RxJS-based methods for complex scenarios
  // =====================================================================

  /**
   * RxJS-powered GET request
   * For complex scenarios like cancellation, retries, caching
   */
  getWithRx<T = any>(
    url: string,
    params?: any,
    options?: HttpRequestOptions
  ): Observable<T> {
    return rxjsHttpService.request<T>('GET', url, params, options);
  }

  /**
   * RxJS-powered POST request
   */
  postWithRx<T = any>(
    url: string,
    data?: any,
    options?: HttpRequestOptions
  ): Observable<T> {
    return rxjsHttpService.request<T>('POST', url, data, options);
  }

  /**
   * RxJS-powered PUT request
   */
  putWithRx<T = any>(
    url: string,
    data?: any,
    options?: HttpRequestOptions
  ): Observable<T> {
    return rxjsHttpService.request<T>('PUT', url, data, options);
  }

  /**
   * RxJS-powered PATCH request
   */
  patchWithRx<T = any>(
    url: string,
    data?: any,
    options?: HttpRequestOptions
  ): Observable<T> {
    return rxjsHttpService.request<T>('PATCH', url, data, options);
  }

  /**
   * RxJS-powered DELETE request
   */
  deleteWithRx<T = any>(
    url: string,
    params?: any,
    options?: HttpRequestOptions
  ): Observable<T> {
    return rxjsHttpService.request<T>('DELETE', url, params, options);
  }

  /**
   * Unified request method with RxJS
   */
  requestWithRx<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    options?: HttpRequestOptions
  ): Observable<T> {
    return rxjsHttpService.request<T>(method, url, data, options);
  }

  /**
   * Handle and potentially transform errors
   */
  private handleError(error: any): void {
    if (error.response) {
      // The request was made and the server responded with a non-2xx status
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error, no response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
  }

  /**
   * Clear the rxjs HTTP service cache
   */
  clearCache(): void {
    rxjsHttpService.clearCache();
  }

  /**
   * Clear a specific cache entry
   */
  clearCacheEntry(url: string, method: HttpMethod, data?: any): void {
    rxjsHttpService.clearCacheEntry(url, method, data);
  }
}

// Create and export a singleton instance
export const httpService = new HttpService();
export default httpService;
