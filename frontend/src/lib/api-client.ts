/**
 * EMSI Univora Academic Platform - API Client
 * Client HTTP TypeScript centralisé pour interagir avec le backend Spring Boot 3 (port 8085)
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api/v1';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly kind: 'http' | 'network' | 'timeout' | 'response' = 'http') {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private static tokenKey = 'emsi_auth_token';
  private static expiryKey = 'emsi_auth_expires_at';

  public static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    for (const storageName of ['sessionStorage', 'localStorage'] as const) {
      try {
        const storage = window[storageName];
        const token = storage.getItem(this.tokenKey);
        const expiry = storage.getItem(this.expiryKey);
        if (token && expiry && Number(expiry) <= Date.now()) {
          storage.removeItem(this.tokenKey);
          storage.removeItem(this.expiryKey);
          continue;
        }
        if (token) return token;
      } catch { /* Try the other storage if this one is restricted. */ }
    }
    return null;
  }

  public static setToken(token: string, remember = true, expiresIn?: number): void {
    if (typeof window !== 'undefined') {
      this.clearToken();
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(this.tokenKey, token);
      if (expiresIn) storage.setItem(this.expiryKey, String(Date.now() + expiresIn * 1000));
    }
  }

  public static clearToken(): void {
    if (typeof window !== 'undefined') {
      for (const storageName of ['localStorage', 'sessionStorage'] as const) {
        try {
          window[storageName].removeItem(this.tokenKey);
          window[storageName].removeItem(this.expiryKey);
        } catch { /* Logout must also work with storage restrictions. */ }
      }
    }
  }

  public static async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        cache: 'no-store',
        signal: options.signal ?? AbortSignal.timeout(15000),
      });
    } catch (error) {
      const timedOut = error instanceof DOMException && ['TimeoutError', 'AbortError'].includes(error.name);
      throw new ApiError(timedOut ? 'Le serveur met trop de temps à répondre.' : 'Impossible de joindre le serveur.', 0, timedOut ? 'timeout' : 'network');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = response.status === 401 ? 'Votre session a expiré. Reconnectez-vous.'
        : response.status === 403 ? 'Votre compte ne dispose pas des droits nécessaires.'
        : response.status >= 500 ? 'Le serveur a rencontré une erreur. Veuillez réessayer.'
        : 'La requête a été refusée. Vérifiez les informations transmises.';
      try {
        const parsed = JSON.parse(errorBody);
        errorMessage = parsed.message || errorMessage;
      } catch {
        // Fallback to plain text
      }
      throw new ApiError(errorMessage, response.status);
    }

    // Handles empty responses (e.g. 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    try {
      return await response.json();
    } catch {
      throw new ApiError('La réponse du serveur est invalide.', response.status, 'response');
    }
  }

  public static get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public static post<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static put<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
