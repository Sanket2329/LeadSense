/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

// ── JWT payload shape ─────────────────────────────────────────────────────────
interface JwtPayload {
  sub:       string;
  email:     string;
  tenantId?: string;
  role?:     string | string[];
  exp:       number;
  firstName?: string;
  lastName?:  string;
  [key: string]: unknown;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

function checkAuth(t: string | null): boolean {
  const u = t ? parseJwt(t) : null;
  return !!u && u.exp * 1000 > Date.now();
}

// ── Context value ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  token:    string | null;
  user:     JwtPayload | null;
  isAuth:   boolean;
  roles:    string[];
  hasRole:  (role: string) => boolean;
  login:    (token: string) => void;
  logout:   () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  // token + isAuth updated together so Date.now() only called in event handlers
  const [token,  setToken]  = useState<string | null>(() => localStorage.getItem('token'));
  const [isAuth, setIsAuth] = useState<boolean>(() => checkAuth(localStorage.getItem('token')));

  const user = useMemo(() => (token ? parseJwt(token) : null), [token]);

  const roles = useMemo((): string[] => {
    return user?.role
      ? Array.isArray(user.role) ? user.role : [user.role]
      : [];
  }, [user]);

  const login = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuth(checkAuth(newToken));   // called in event handler — allowed
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuth(false);
  }, []);

  const hasRole = useCallback(
    (role: string) => roles.includes(role),
    [roles],
  );

  return (
    <AuthContext.Provider value={{
      token,
      user,
      isAuth,
      roles,
      hasRole,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}