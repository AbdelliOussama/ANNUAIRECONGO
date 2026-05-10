export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresOnUtc: string;
}

export interface User {
  userId?: string;
  id: string;
  sub?: string;
  email: string;
  roles: string[];
  claims?: string[];
  /** Optional — populated by /identity/current-user/claims when available. */
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  companyPosition?: string;
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
