/** Extract user-facing message from IdP / Angular HttpClient error shapes (matches login handling). */
export function idpErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    error?: { error_description?: string; message?: string; title?: string };
    message?: string;
  };
  return (
    e?.error?.error_description ??
    e?.error?.message ??
    e?.error?.title ??
    e?.message ??
    fallback
  );
}
