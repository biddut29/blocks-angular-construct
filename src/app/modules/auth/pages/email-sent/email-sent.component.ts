// ─── Email Sent Page (React: /sent-email) ─────────────────────────────────────
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideSendHorizonal } from '@ng-icons/lucide';

@Component({
  selector: 'app-email-sent',
  standalone: true,
  imports: [RouterLink, NgIconComponent, NgIf],
  viewProviders: [provideIcons({ lucideSendHorizonal })],
  template: `
    <div class="bg-card rounded-xl border border-border p-8 shadow-sm text-center">
      <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <ng-icon name="lucideSendHorizonal" class="w-7 h-7 text-primary" />
      </div>
      <h1 class="text-2xl font-bold text-foreground">Email on its way!</h1>
      <p class="text-muted-foreground text-sm mt-2">
        <ng-container *ngIf="emailTo(); else genericCopy">
          We sent a password reset link to <strong>{{ emailTo() }}</strong>. Please check your inbox.
        </ng-container>
        <ng-template #genericCopy>
          We sent a verification email. Please check your inbox and follow the instructions.
        </ng-template>
      </p>
      <a routerLink="/login" class="inline-block mt-6 text-primary hover:underline text-sm">
        Back to sign in
      </a>
    </div>
  `,
})
export class EmailSentComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  readonly emailTo = signal('');

  ngOnInit(): void {
    const e = this._route.snapshot.queryParamMap.get('email');
    if (e) this.emailTo.set(e);
  }
}
