// ─── JWT decode (payload) ─────────────────────────────────────────────────────
// Mirrors: src/lib/utils/decode-jwt-utils.ts in the React project

/**
 * Decodes a JWT access token to extract `org_id` and other payload claims.
 * Used for organization-scoped role checks (org switcher, protected routes).
 */
export function decodeJWT(token: string): { org_id?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as { org_id?: string };
  } catch {
    return null;
  }
}
