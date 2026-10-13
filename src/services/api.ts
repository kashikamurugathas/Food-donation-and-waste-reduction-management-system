/**
 * FoodShare Lanka - REST API Client
 * Connects React Frontend with Backend REST API (Laravel Sanctum & Express endpoints)
 */

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: 'donor' | 'institution';

  // Donor fields
  donor_type?: string;
  venue_name?: string;
  address?: string;
  area?: string;
  district?: string;

  // Institution fields
  institution_name?: string;
  institution_type?: string;
  registration_number?: string;
  contact_person?: string;
  resident_count?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  role: 'donor' | 'institution' | 'admin';
  is_verified: boolean | number;
  created_at?: string;
  profile?: any;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: AuthUser;
  errors?: Record<string, string[]>;
}

const TOKEN_KEY = 'foodshare_auth_token';
const REMEMBERED_EMAIL_KEY = 'foodshare_remembered_email';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, remember: boolean = true): void {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number; errors?: Record<string, string[]> }> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      let errorMessage = data?.message || `Request failed with status ${res.status}`;
      if (data?.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        if (firstErrorKey && data.errors[firstErrorKey]?.[0]) {
          errorMessage = data.errors[firstErrorKey][0];
        }
      }
      return {
        error: errorMessage,
        status: res.status,
        errors: data?.errors,
        data,
      };
    }

    return {
      data,
      status: res.status,
    };
  } catch (err: any) {
    return {
      error: err.message || 'Network error: Unable to connect to server.',
      status: 0,
    };
  }
}

export const authApi = {
  // Real User Registration
  async register(payload: RegisterPayload): Promise<{ success: boolean; error?: string; user?: AuthUser; errors?: Record<string, string[]> }> {
    const res = await apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.error || !res.data) {
      return {
        success: false,
        error: res.error || 'Registration failed.',
        errors: res.errors,
      };
    }

    if (res.data.token && res.data.user) {
      setStoredToken(res.data.token, true);
    }

    return {
      success: true,
      user: res.data.user,
    };
  },

  // Real User Login
  async login(payload: LoginPayload): Promise<{ success: boolean; error?: string; user?: AuthUser; errors?: Record<string, string[]> }> {
    const res = await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });

    if (res.error || !res.data) {
      return {
        success: false,
        error: res.error || 'Login failed.',
        errors: res.errors,
      };
    }

    if (res.data.token && res.data.user) {
      setStoredToken(res.data.token, !!payload.rememberMe);
      if (payload.rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, payload.email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    }

    return {
      success: true,
      user: res.data.user,
    };
  },

  // Real User Logout
  async logout(): Promise<boolean> {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      clearStoredToken();
    }
    return true;
  },

  // Get Current Authenticated User & Verify Token
  async getMe(): Promise<{ success: boolean; user?: AuthUser }> {
    const token = getStoredToken();
    if (!token) return { success: false };

    const res = await apiFetch<{ user: AuthUser }>('/api/auth/me', {
      method: 'GET',
    });

    if (res.data?.user) {
      return { success: true, user: res.data.user };
    }

    // Token is invalid/expired
    clearStoredToken();
    return { success: false };
  },

  // Forgot Password
  async forgotPassword(email: string): Promise<{ success: boolean; message: string; configured?: boolean }> {
    const res = await apiFetch<any>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (res.error) {
      return {
        success: false,
        message: res.error,
        configured: res.data?.configured !== false,
      };
    }

    return {
      success: true,
      message: res.data?.message || 'Password reset instructions have been sent.',
      configured: true,
    };
  },
};
