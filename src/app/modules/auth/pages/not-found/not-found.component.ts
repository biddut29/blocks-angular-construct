// ─── 404 Not Found Page ────────────────────────────────────────────────────────
// Mirrors: React's NotFoundPage
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-background flex flex-col items-center justify-center text-center p-8">
      <h1 class="text-8xl font-extrabold text-primary mb-4">404</h1>
      <h2 class="text-2xl font-bold text-foreground mb-2">Page not found</h2>
      <p class="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <a routerLink="/dashboard"
        class="px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium
               hover:bg-primary/90 transition-colors">
        Back to Dashboard
      </a>
    </div>
  `,
})
export class NotFoundComponent {}
