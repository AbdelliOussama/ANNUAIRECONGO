export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresOnUtc: string;
}

export interface User {
  id: string;
  email: string;
  roles: string[];
  claims: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  companyPosition?: string;
}