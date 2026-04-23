// Mirrors: react_Constract/src/constant/sso.ts (LoginOption) + auth.ts (GRANT_TYPES)

/** Same string values as React `GRANT_TYPES` */
export const GRANT_TYPES = {
  password: 'password',
  social: 'social',
  clientCredential: 'client-credential',
  oidc: 'authorization_code',
} as const;

export type GrantType = (typeof GRANT_TYPES)[keyof typeof GRANT_TYPES];

export interface LoginOptionSsoInfo {
  provider: string;
  audience: string;
}

export interface LoginOption {
  allowedGrantTypes: string[];
  ssoInfo: LoginOptionSsoInfo[];
  oidc?: { clientId: string; redirectUrl: string };
}

/** React `IGetSignUpSettingResponse` (subset used on sign-in) */
export interface SignupSettings {
  isEmailPasswordSignUpEnabled?: boolean;
  isSSoSignUpEnabled?: boolean;
}
