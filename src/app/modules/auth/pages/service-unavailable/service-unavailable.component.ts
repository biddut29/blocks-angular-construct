// ─── 503 Service Unavailable Page ─────────────────────────────────────────────
// Mirrors: React's ServiceUnavailablePage
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-service-unavailable',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-background flex flex-col items-center justify-center text-center p-8">
      <h1 class="text-8xl font-extrabold text-muted-foreground mb-4">503</h1>
      <h2 class="text-2xl font-bold text-foreground mb-2">Service Unavailable</h2>
      <p class="text-muted-foreground mb-8">
        We're undergoing maintenance. Please check back shortly.
      </p>
      <a routerLink="/dashboard"
        class="px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium
               hover:bg-primary/90 transition-colors">
        Try again
      </a>
    </div>
  `,
})
export class ServiceUnavailableComponent {}
