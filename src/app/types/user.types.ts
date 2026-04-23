// ─── User Types ────────────────────────────────────────────────────────────────
// Mirrors: src/types/ in React project

export interface Membership {
  orgId: string;
  orgName: string;
  roles: string[];
}

export interface User {
  itemId: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phoneNumber?: string;
  roles: string[];
  permissions: string[];
  active: boolean;
  isVarified: boolean;
  profileImageUrl: string;
  isMfaVerified: boolean;
  mfaEnabled: boolean;
  memberships?: Membership[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** UI collects extra fields; API matches React `signupByEmail` (email + captcha). */
export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  captchaCode?: string;
}

/** React `resetPassword` — query param `code` from recovery email */
export interface ResetPasswordRequest {
  code: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}
