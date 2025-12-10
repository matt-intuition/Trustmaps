export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string | null;
  profileImage: string | null;
  trustBalance: number;
  creatorReputation: number;
  totalStaked: number;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    createdLists: number;
    purchases: number;
    stakes: number;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string; // Can be email or username
  password: string;
}

export interface ApiError {
  error: string;
  message: string;
}
