// ─── Auth Constants ────────────────────────────────────────────────────────────
// Mirrors: react_Constract/src/modules/auth/services/auth.service.ts

export const AUTH_STORAGE_KEY = 'auth-storage';
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

/** Same paths as React `auth.service.ts` / `accounts.service.ts` */
export const AUTH_ENDPOINTS = {
  token: '/idp/v1/Authentication/Token',
  loginOptions: '/idp/v1/Authentication/GetLoginOptions',
  socialLoginEndpoint: '/idp/v1/Authentication/GetSocialLogInEndPoint',
  logout: '/idp/v1/Authentication/Logout',
  logoutAll: '/idp/v1/Authentication/LogoutAll',
  recover: '/idp/v1/Iam/Recover',
  resetPassword: '/idp/v1/Iam/ResetPassword',
  activate: '/idp/v1/Iam/Activate',
  resendActivation: '/idp/v1/Iam/ResendActivation',
  validateActivationCode: '/idp/v1/Iam/ValidateActivationCode',
  signup: '/identifier/v1/People/Signup',
  getAccount: '/idp/v1/Iam/GetAccount',
  getSignUpSetting: '/idp/v1/Iam/GetSignUpSetting',
};
