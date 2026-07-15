import axios, { AxiosError } from 'axios';
import { config } from '@/config/env';
import type { ApiFailure } from '@/types/api';

/**
 * The single Axios instance every API service should use. Centralizing
 * base URL + interceptors here means adding auth headers, retry logic,
 * or request logging later only requires touching one file.
 */
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

export class ApiRequestError extends Error {
  public readonly status?: number;
  public readonly errors?: unknown;

  constructor(message: string, status?: number, errors?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiFailure>) => {
    const message = error.response?.data?.message ?? error.message ?? 'Something went wrong';
    return Promise.reject(
      new ApiRequestError(message, error.response?.status, error.response?.data?.errors),
    );
  },
);
