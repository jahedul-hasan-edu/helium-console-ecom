import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import { AUTH_ROUTES, AUTH_STORAGE_KEYS, CLIENT_ROLE_NAME } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { apiService } from "@/lib/apiService";
import type {
  AuthSuccessResponse,
  AuthUser,
  LoginResponse,
  RegisterSuperAdminRequest,
  RegisterTenantAdminRequest,
} from "@/models/Auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  selectedTenantId: string | null;
  isSuperAdmin: boolean;
  isTenantAdmin: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (payload: RegisterSuperAdminRequest | RegisterTenantAdminRequest) => Promise<AuthSuccessResponse>;
  verifyTwoFactor: (tempToken: string, code: string) => Promise<AuthSuccessResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setSelectedTenantId: (tenantId: string | null) => void;
  hasPermission: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  const rawValue = localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_USER);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_USER);
    return null;
  }
}

function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_USER);
  localStorage.removeItem(AUTH_STORAGE_KEYS.SELECTED_TENANT_ID);
  apiService.clearTokens();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedTenantId, setSelectedTenantIdState] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.SELECTED_TENANT_ID);
  });

  const isSuperAdmin = user?.roleName === CLIENT_ROLE_NAME.SUPER_ADMIN;
  const isTenantAdmin = user?.roleName === CLIENT_ROLE_NAME.TENANT_ADMIN;

  const applySession = (payload: AuthSuccessResponse) => {
    apiService.setTokens(payload.accessToken, payload.refreshToken);
    localStorage.setItem(AUTH_STORAGE_KEYS.AUTH_USER, JSON.stringify(payload.user));
    setUser(payload.user);

    if (payload.user.roleName !== CLIENT_ROLE_NAME.SUPER_ADMIN) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.SELECTED_TENANT_ID);
      setSelectedTenantIdState(null);
    }
  };

  const handleForcedLogout = () => {
    clearStoredAuth();
    setUser(null);
    setSelectedTenantIdState(null);
    queryClient.clear();
    navigate(AUTH_ROUTES.LOGIN, { replace: true });
  };

  const refreshUser = async () => {
    const currentUser = await apiService.get<AuthUser>("/api/auth/me", {
      showErrorToast: false,
      showSuccessToast: false,
    });
    localStorage.setItem(AUTH_STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
    setUser(currentUser);
  };

  useEffect(() => {
    const syncSession = async () => {
      const token = apiService.getAccessToken();
      if (!token) {
        clearStoredAuth();
        setUser(null);
        setIsInitializing(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        clearStoredAuth();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    void syncSession();
  }, []);

  useEffect(() => {
    const listener = () => handleForcedLogout();
    window.addEventListener("auth:logout", listener);
    return () => window.removeEventListener("auth:logout", listener);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiService.post<LoginResponse>(
      "/api/auth/login",
      { email, password },
      { showErrorToast: true, showSuccessToast: false }
    );

    if ("requires2FA" in response) {
      return response;
    }

    applySession(response);
    return response;
  };

  const register = async (
    payload: RegisterSuperAdminRequest | RegisterTenantAdminRequest
  ): Promise<AuthSuccessResponse> => {
    const response = await apiService.post<AuthSuccessResponse>("/api/auth/register", payload, {
      showErrorToast: true,
      showSuccessToast: false,
    });
    applySession(response);
    return response;
  };

  const verifyTwoFactor = async (tempToken: string, code: string): Promise<AuthSuccessResponse> => {
    const response = await apiService.post<AuthSuccessResponse>(
      "/api/auth/verify-2fa",
      { tempToken, code },
      { showErrorToast: true, showSuccessToast: false }
    );
    applySession(response);
    return response;
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.post("/api/auth/logout", undefined, {
        showErrorToast: false,
        showSuccessToast: false,
      });
    } catch {
      // Best effort logout.
    } finally {
      handleForcedLogout();
    }
  };

  const setSelectedTenantId = (tenantId: string | null) => {
    if (!isSuperAdmin) {
      return;
    }

    if (tenantId) {
      localStorage.setItem(AUTH_STORAGE_KEYS.SELECTED_TENANT_ID, tenantId);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.SELECTED_TENANT_ID);
    }
    setSelectedTenantIdState(tenantId);
    queryClient.invalidateQueries();
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isInitializing,
      selectedTenantId,
      isSuperAdmin,
      isTenantAdmin,
      login,
      register,
      verifyTwoFactor,
      logout,
      refreshUser,
      setSelectedTenantId,
      hasPermission: () => !!user,
    }),
    [isInitializing, isSuperAdmin, isTenantAdmin, selectedTenantId, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}