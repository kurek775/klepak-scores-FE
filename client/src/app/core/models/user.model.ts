export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EVALUATOR = 'EVALUATOR',
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AcceptInvitationRequest {
  token: string;
  full_name: string;
  password: string;
}

export interface InvitationRead {
  id: number;
  email: string;
  role: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}
