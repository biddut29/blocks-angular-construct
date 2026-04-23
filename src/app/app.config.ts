// ─── Application Configuration ────────────────────────────────────────────────
// Angular equivalent of React's index.tsx providers

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './state/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js change detection
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Angular Router with view transitions (like React Router v7 transitions)
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
    ),

    // Angular HttpClient with auth interceptor
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
    ),

    // Animations (needed for Spartan NG dialogs, sheets, tooltips)
    provideAnimationsAsync(),
  ],
};
