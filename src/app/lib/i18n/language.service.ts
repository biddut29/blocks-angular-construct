import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const LANG_STORAGE_KEY = 'app-lang';

export type SupportedLang = 'en' | 'de';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _translate = inject(TranslateService);

  readonly supported: readonly SupportedLang[] = ['en', 'de'];
  readonly active = signal<SupportedLang>('en');

  init(): void {
    const saved =
      typeof window !== 'undefined'
        ? (window.localStorage.getItem(LANG_STORAGE_KEY) as SupportedLang | null)
        : null;
    const lang: SupportedLang = saved && this.supported.includes(saved) ? saved : 'en';
    this._translate.addLangs([...this.supported]);
    this._translate.setDefaultLang('en');
    this.use(lang);
  }

  use(lang: SupportedLang): void {
    this.active.set(lang);
    this._translate.use(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
  }

  toggle(): void {
    const next: SupportedLang = this.active() === 'en' ? 'de' : 'en';
    this.use(next);
  }
}
