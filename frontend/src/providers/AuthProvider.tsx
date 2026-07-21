import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/features/auth/api/authApi';
import { tokenStorage } from '@/lib/tokenStorage';
import { ApiRequestError } from '@/api/apiClient';
import type { LoginPayload, RegisterPayload, User } from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  /** True while restoring a session from a stored token on first load. */
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Owns the authenticated session: restores it from a stored JWT on load
 * (so a page refresh doesn't log the person out), and exposes
 * login/register/logout to the rest of the app. `ProtectedRoute` reads
 * `user`/`isLoading` from this to decide whether to render its children
 * or redirect to `/login`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = tokenStorage.get();
      if (!token) return;

      try {
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        // Stored token is invalid/expired — the response interceptor
        // already clears it and redirects; just reset local state here.
        tokenStorage.clear();
      }
    }

    restoreSession().finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authApi.login(payload);
    tokenStorage.set(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await authApi.register(payload);
    tokenStorage.set(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

/** Type guard so callers can surface a real message instead of a generic one. */
export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}