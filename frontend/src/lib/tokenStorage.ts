const STORAGE_KEY = 'student-task-manager:token';

/**
 * Wraps localStorage access for the JWT. Kept as its own tiny module (not
 * inlined into AuthProvider or apiClient) so both can read/write the same
 * value without importing each other — apiClient needs the token to build
 * request headers, AuthProvider needs it to restore a session on load.
 */
export const tokenStorage = {
  get: (): string | null => localStorage.getItem(STORAGE_KEY),
  set: (token: string): void => localStorage.setItem(STORAGE_KEY, token),
  clear: (): void => localStorage.removeItem(STORAGE_KEY),
};