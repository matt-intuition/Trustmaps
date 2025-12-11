import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse, SignupRequest, LoginRequest, User } from '../types';

// Backend API URL - update based on environment
const API_URL = __DEV__
  ? 'http://localhost:3001/api'
  : 'https://api.trustmaps.com/api';

const TOKEN_KEY = '@trustmaps:token';

class ApiClient {
  private token: string | null = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  async init() {
    if (this.initialized) {
      return;
    }
    this.token = await AsyncStorage.getItem(TOKEN_KEY);
    this.initialized = true;
    console.log('[ApiClient] Token loaded:', this.token ? 'YES (length: ' + this.token.length + ')' : 'NO');
  }

  private async ensureInitialized() {
    // If already initialized, return immediately
    if (this.initialized) {
      return;
    }

    // If init is in progress, wait for it
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    // Initialize now
    console.log('[ApiClient] Auto-initializing...');
    this.initPromise = this.init();
    await this.initPromise;
    this.initPromise = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Always ensure we're initialized before making a request
    await this.ensureInitialized();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log(`[ApiClient] Request to ${endpoint} with auth token`);
    } else {
      console.warn(`[ApiClient] Request to ${endpoint} WITHOUT auth token!`);
    }

    console.log(`[ApiClient] Fetching ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`[ApiClient] Response status: ${response.status} ${response.statusText}`);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[ApiClient] Non-JSON response:', text.substring(0, 200));
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[ApiClient] Response data:`, data);

    if (!response.ok) {
      console.error(`[ApiClient] Request failed:`, data);
      throw new Error(data.message || data.error || 'An error occurred');
    }

    return data;
  }

  async setToken(token: string) {
    this.token = token;
    this.initialized = true;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async clearToken() {
    this.token = null;
    this.initialized = true; // Still initialized, just no token
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return this.token;
  }

  // Generic HTTP methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Auth endpoints
  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Import endpoints
  async uploadZip(fileOrUri: string | File, fileName: string): Promise<{
    fileId: string;
    filePath: string;
    filename: string;
    size: number;
    message: string;
  }> {
    console.log('uploadZip called', typeof fileOrUri, fileName);

    const formData = new FormData();

    // Handle both web File objects and mobile URIs
    if (fileOrUri instanceof File) {
      // Web: use the File object directly
      console.log('Appending web File object');
      formData.append('file', fileOrUri, fileName);
    } else {
      // React Native: append with uri, name, and type
      console.log('Appending React Native file with URI');
      formData.append('file', {
        uri: fileOrUri,
        name: fileName,
        type: 'application/zip',
      } as any);
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    console.log('Uploading to', `${API_URL}/import/upload`);

    const response = await fetch(`${API_URL}/import/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('Response status:', response.status);

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Upload failed');
    }

    return data;
  }
}

export const apiClient = new ApiClient();
