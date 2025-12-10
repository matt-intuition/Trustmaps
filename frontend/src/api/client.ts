import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse, SignupRequest, LoginRequest, User } from '../types';

// Backend API URL - update based on environment
const API_URL = __DEV__
  ? 'http://localhost:3001/api'
  : 'https://api.trustmaps.com/api';

const TOKEN_KEY = '@trustmaps:token';

class ApiClient {
  private token: string | null = null;

  async init() {
    this.token = await AsyncStorage.getItem(TOKEN_KEY);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return this.token;
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
    message: string;
    listsCreated: number;
    placesImported: number;
    warnings?: string[];
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
