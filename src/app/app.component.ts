// ─── Root App Component ────────────────────────────────────────────────────────
// Angular equivalent of React's App.tsx — just renders the router outlet

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styleUrl: './app.component.scss',
})
export class AppComponent {}
