// Mirrors: react_Constract/src/constant/sso.ts (image paths → same files under /public/images/)

/** Same filenames as React `src/assets/images/` (served from `public/images/`). */
export const SSO_PROVIDER_IMAGE: Record<string, string> = {
  google: '/images/social_media_google.svg',
  microsoft: '/images/social_media_ms.svg',
  github: '/images/social_media_github.svg',
  linkedin: '/images/social_media_in.svg',
  x: '/images/social_media_x.svg',
  ownsso: '/images/social_media_ownsso.svg',
};

export function ssoProviderImageSrc(provider: string): string {
  const key = (provider || '').toLowerCase().trim();
  return SSO_PROVIDER_IMAGE[key] ?? '/images/social_media_ownsso.svg';
}
