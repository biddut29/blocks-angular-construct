// ─── Application Configuration ────────────────────────────────────────────────
// Angular equivalent of React's index.tsx providers

import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { routes } from './app.routes';
import { authInterceptor } from './state/interceptors/auth.interceptor';

export function httpTranslateLoader(http: HttpClient) {
  return {
    getTranslation: (lang: string) => http.get<any>(`/i18n/${lang}.json`),
  } as TranslateLoader;
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js change detection
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Angular Router with view transitions (like React Router v7 transitions)
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    // Angular HttpClient with auth interceptor
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    // i18n (ngx-translate) — load `/public/i18n/*.json`
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: httpTranslateLoader,
          deps: [HttpClient],
        },
      })
    ),

    // Animations (needed for Spartan NG dialogs, sheets, tooltips)
    provideAnimationsAsync(),
  ],
};
