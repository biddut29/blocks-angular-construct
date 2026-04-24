// ─── Password policy (Angular validators + helpers) ───────────────────────────
// Rules mirror: react_Constract/src/modules/auth/hooks/use-password-strength/

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_ALLOWED_SPECIAL = '@$!%*?&';
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 30;

const SPECIAL_CHAR_REGEX = /[@$!%*?&]/;

export interface PasswordChecks {
  length: boolean;
  case: boolean;
  number: boolean;
  special: boolean;
}

export function evaluatePasswordChecks(password: string | null | undefined): PasswordChecks {
  const p = password ?? '';
  return {
    length: p.length >= PASSWORD_MIN_LENGTH && p.length <= PASSWORD_MAX_LENGTH,
    case: /[a-z]/.test(p) && /[A-Z]/.test(p),
    number: /\d/.test(p),
    special: SPECIAL_CHAR_REGEX.test(p),
  };
}

export function allPasswordChecksMet(checks: PasswordChecks): boolean {
  return Object.values(checks).every(Boolean);
}

/** Same weighting as React `SharedPasswordStrengthChecker` (no exclude-password row). */
export function passwordStrengthBarPercent(
  checks: PasswordChecks,
  password: string,
  confirmPassword: string,
): number {
  const keys = Object.keys(checks) as (keyof PasswordChecks)[];
  const total = keys.length + 1;
  let met = keys.filter(k => checks[k]).length;
  const passwordsMatch = password !== '' && password === confirmPassword;
  if (passwordsMatch) met += 1;
  return total > 0 ? (met / total) * 100 : 0;
}

export function passwordStrengthBarColorClass(percent: number): string {
  if (percent <= 25) return 'bg-red-500';
  if (percent <= 50) return 'bg-orange-500';
  if (percent <= 75) return 'bg-yellow-500';
  return 'bg-green-600';
}

/** Attach to `password` control — empty value is left to `Validators.required`. */
export function passwordPolicyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = (control.value as string) ?? '';
    if (!v) return null;
    const checks = evaluatePasswordChecks(v);
    return allPasswordChecksMet(checks) ? null : { passwordPolicy: true };
  };
}

export const PASSWORD_REQUIREMENT_ROWS: ReadonlyArray<{ key: keyof PasswordChecks; label: string }> =
  [
    { key: 'length', label: 'Between 8 and 30 characters' },
    { key: 'case', label: 'At least 1 uppercase and 1 lowercase letter' },
    { key: 'number', label: 'At least 1 digit' },
    {
      key: 'special',
      label: `At least 1 special character (${PASSWORD_ALLOWED_SPECIAL.split('').join(' ')})`,
    },
  ];

export function passwordsMatchMet(password: string, confirmPassword: string): boolean {
  return password !== '' && password === confirmPassword;
}
