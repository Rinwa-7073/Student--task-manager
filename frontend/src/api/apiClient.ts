import axios, { AxiosError } from 'axios';
import { config } from '@/config/env';
import { tokenStorage } from '@/lib/tokenStorage';
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

// Attach the JWT (if we have one) to every outgoing request.
apiClient.interceptors.request.use((requestConfig) => {
  const token = tokenStorage.get();
  if (token) {
    requestConfig.headers.set('Authorization', `Bearer ${token}`);
  }
  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiFailure>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? error.message ?? 'Something went wrong';

    // A 401 means the token is missing, expired, or invalid — there's no
    // recovering the current session, so clear it and bounce to /login.
    // Skip this on the auth endpoints themselves: a failed *login attempt*
    // is a normal 401 that the login form should handle inline, not a
    // reason to nuke a (nonexistent) session and reload the page.
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/');
    if (status === 401 && !isAuthEndpoint) {
      tokenStorage.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(new ApiRequestError(message, status, error.response?.data?.errors));
  },
);