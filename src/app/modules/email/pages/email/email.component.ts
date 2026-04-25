// ─── Email Page Component ──────────────────────────────────────────────────────
// Mirrors: src/modules/email/pages/ in React project
// Three-panel layout: Sidebar | Email List | Email Detail/Compose

import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgIf, NgFor, NgClass, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideInbox,
  lucideSend,
  lucideFileEdit,
  lucideAlertTriangle,
  lucideTrash2,
  lucideStar,
  lucideSearch,
  lucidePencil,
  lucideRefreshCw,
  lucideChevronLeft,
  lucideChevronRight,
  lucideMoreVertical,
  lucideReply,
  lucideForward,
  lucideTag,
  lucideX,
  lucideCheck,
  lucideLoader,
  lucidePaperclip,
} from '@ng-icons/lucide';
import { EmailService } from '../../services/email.service';
import { Email, EmailCategory, EmailLabel } from '../../../../models/email.model';

type EmailTab = { key: EmailCategory; label: string; icon: string };

@Component({
  selector: 'app-email',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, NgClass, DatePipe, UpperCasePipe, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideInbox,
      lucideSend,
      lucideFileEdit,
      lucideAlertTriangle,
      lucideTrash2,
      lucideStar,
      lucideSearch,
      lucidePencil,
      lucideRefreshCw,
      lucideChevronLeft,
      lucideChevronRight,
      lucideMoreVertical,
      lucideReply,
      lucideForward,
      lucideTag,
      lucideX,
      lucideCheck,
      lucideLoader,
      lucidePaperclip,
    }),
  ],
  template: `
    <div class="flex h-full -m-6 bg-background">
      <!-- ── Left: Category sidebar ─────────────────────────────────────── -->
      <aside class="w-52 border-r border-border flex flex-col shrink-0">
        <!-- Compose button -->
        <div class="p-3">
          <button
            (click)="openCompose()"
            class="w-full flex items-center justify-center gap-2 h-9 bg-primary text-primary-foreground
                   rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ng-icon name="lucidePencil" class="w-4 h-4" />
            Compose
          </button>
        </div>

        <!-- Categories -->
        <nav class="flex-1 px-2 pb-2 space-y-0.5">
          <button
            *ngFor="let tab of tabs"
            (click)="selectCategory(tab.key)"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
            [ngClass]="
              activeCategory() === tab.key
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            "
          >
            <ng-icon [name]="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>

          <!-- Labels -->
          <div class="pt-3">
            <p class="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Labels
            </p>
            <div
              *ngFor="let label of labels()"
              class="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer
                        text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <span class="w-2 h-2 rounded-full shrink-0" [style.background]="label.color"></span>
              {{ label.name }}
            </div>
          </div>
        </nav>
      </aside>

      <!-- ── Middle: Email list ──────────────────────────────────────────── -->
      <div class="w-80 border-r border-border flex flex-col shrink-0">
        <!-- Search -->
        <div class="p-3 border-b border-border">
          <div class="relative">
            <ng-icon
              name="lucideSearch"
              class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            />
            <input
              [(ngModel)]="searchQuery"
              placeholder="Search emails..."
              class="w-full h-8 pl-8 pr-3 rounded-md border border-input bg-muted/50 text-sm
                     focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <!-- Category header -->
        <div class="flex items-center justify-between px-4 py-2 border-b border-border">
          <h2 class="text-sm font-semibold text-foreground capitalize">{{ activeCategory() }}</h2>
          <button
            (click)="refresh()"
            class="p-1 rounded text-muted-foreground hover:text-foreground"
          >
            <ng-icon name="lucideRefreshCw" class="w-4 h-4" />
          </button>
        </div>

        <!-- Email list -->
        <div class="flex-1 overflow-y-auto">
          <div *ngIf="isLoading()" class="flex items-center justify-center p-8">
            <ng-icon name="lucideLoader" class="w-6 h-6 animate-spin text-muted-foreground" />
          </div>

          <div
            *ngIf="!isLoading() && filteredEmails().length === 0"
            class="text-center text-muted-foreground p-8 text-sm"
          >
            No emails in this folder.
          </div>

          <div
            *ngFor="let email of filteredEmails()"
            (click)="selectEmail(email)"
            class="border-b border-border px-4 py-3 cursor-pointer transition-colors"
            [ngClass]="{
              'bg-accent/30': selectedEmail()?.emailId === email.emailId,
              'hover:bg-accent/20': selectedEmail()?.emailId !== email.emailId,
              'font-medium': !email.isRead,
            }"
          >
            <!-- Sender + date -->
            <div class="flex items-center justify-between mb-1">
              <span
                class="text-sm truncate"
                [ngClass]="!email.isRead ? 'text-foreground font-semibold' : 'text-foreground'"
              >
                {{ email.from.name || email.from.email }}
              </span>
              <span class="text-xs text-muted-foreground shrink-0 ml-2">
                {{ email.createdAt | date: 'MMM d' }}
              </span>
            </div>

            <!-- Subject -->
            <div class="flex items-center gap-1.5">
              <ng-icon
                *ngIf="email.isStarred"
                name="lucideStar"
                class="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400"
              />
              <span
                class="text-sm truncate"
                [ngClass]="!email.isRead ? 'text-foreground' : 'text-muted-foreground'"
              >
                {{ email.subject }}
              </span>
            </div>

            <!-- Preview -->
            <p class="text-xs text-muted-foreground truncate mt-0.5">{{ email.bodyText }}</p>

            <!-- Labels -->
            <div *ngIf="email.labels?.length" class="flex gap-1 mt-1.5 flex-wrap">
              <span
                *ngFor="let label of email.labels"
                class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs text-white"
                [style.background]="label.color"
              >
                {{ label.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="border-t border-border px-4 py-2 flex items-center justify-between">
          <span class="text-xs text-muted-foreground"
            >1–{{ filteredEmails().length }} of {{ totalCount() }}</span
          >
          <div class="flex gap-1">
            <button
              class="p-1 rounded hover:bg-accent text-muted-foreground disabled:opacity-40"
              [disabled]="page() <= 1"
              (click)="prevPage()"
            >
              <ng-icon name="lucideChevronLeft" class="w-4 h-4" />
            </button>
            <button class="p-1 rounded hover:bg-accent text-muted-foreground" (click)="nextPage()">
              <ng-icon name="lucideChevronRight" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- ── Right: Email detail / Compose ──────────────────────────────── -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Compose view -->
        <ng-container *ngIf="composeOpen(); else emailDetail">
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 class="font-semibold text-foreground">New Message</h3>
            <button
              (click)="composeOpen.set(false)"
              class="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
            >
              <ng-icon name="lucideX" class="w-4 h-4" />
            </button>
          </div>

          <div class="flex-1 flex flex-col p-6 gap-3">
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <span class="text-sm text-muted-foreground w-8">To</span>
              <input
                [(ngModel)]="composeTo"
                type="email"
                placeholder="recipient@example.com"
                class="flex-1 text-sm bg-transparent focus:outline-none text-foreground"
              />
            </div>
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <span class="text-sm text-muted-foreground w-8">Subject</span>
              <input
                [(ngModel)]="composeSubject"
                type="text"
                placeholder="Email subject"
                class="flex-1 text-sm bg-transparent focus:outline-none text-foreground"
              />
            </div>
            <textarea
              [(ngModel)]="composeBody"
              placeholder="Write your message here..."
              class="flex-1 resize-none bg-transparent text-sm text-foreground focus:outline-none"
            ></textarea>

            <!-- Compose actions -->
            <div class="flex items-center gap-2 pt-3 border-t border-border">
              <button
                (click)="sendEmail()"
                class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm
                       hover:bg-primary/90 transition-colors"
              >
                <ng-icon name="lucideSend" class="w-4 h-4" />
                Send
              </button>
              <button
                (click)="saveDraft()"
                class="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm
                       text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <ng-icon name="lucideFileEdit" class="w-4 h-4" />
                Save Draft
              </button>
              <button
                (click)="composeOpen.set(false)"
                class="ml-auto p-2 rounded-md hover:bg-accent text-muted-foreground"
              >
                <ng-icon name="lucideTrash2" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </ng-container>

        <!-- Email detail view -->
        <ng-template #emailDetail>
          <!-- Empty state -->
          <div
            *ngIf="!selectedEmail()"
            class="flex-1 flex flex-col items-center justify-center text-muted-foreground"
          >
            <ng-icon name="lucideInbox" class="w-12 h-12 mb-3" />
            <p class="text-sm">Select an email to read</p>
          </div>

          <!-- Email content -->
          <ng-container *ngIf="selectedEmail() as email">
            <!-- Email header/actions -->
            <div class="flex items-center gap-2 px-6 py-3 border-b border-border">
              <button
                (click)="selectedEmail.set(null)"
                class="p-1.5 rounded-md hover:bg-accent text-muted-foreground md:hidden"
              >
                <ng-icon name="lucideChevronLeft" class="w-4 h-4" />
              </button>
              <div class="flex items-center gap-2 ml-auto">
                <button
                  (click)="toggleStar(email)"
                  class="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                >
                  <ng-icon
                    name="lucideStar"
                    class="w-4 h-4"
                    [ngClass]="email.isStarred ? 'fill-amber-400 text-amber-400' : ''"
                  />
                </button>
                <button
                  (click)="replyEmail(email)"
                  class="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                >
                  <ng-icon name="lucideReply" class="w-4 h-4" />
                </button>
                <button
                  (click)="forwardEmail(email)"
                  class="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                >
                  <ng-icon name="lucideForward" class="w-4 h-4" />
                </button>
                <button
                  (click)="trashEmail(email)"
                  class="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                >
                  <ng-icon name="lucideTrash2" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Email body -->
            <div class="flex-1 overflow-y-auto p-6">
              <h2 class="text-xl font-bold text-foreground mb-4">{{ email.subject }}</h2>

              <!-- From/To meta -->
              <div class="flex items-start gap-3 mb-6">
                <div
                  class="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0"
                >
                  <span class="text-primary-foreground text-sm font-medium">
                    {{ email.from.name?.[0] || email.from.email[0] | uppercase }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-medium text-foreground text-sm">{{
                        email.from.name || email.from.email
                      }}</span>
                      <span class="text-muted-foreground text-xs ml-1"
                        >&lt;{{ email.from.email }}&gt;</span
                      >
                    </div>
                    <span class="text-xs text-muted-foreground shrink-0 ml-2">
                      {{ email.createdAt | date: 'MMM d, y, h:mm a' }}
                    </span>
                  </div>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    To: {{ email.to.map((t) => t.email).join(', ') }}
                  </p>
                </div>
              </div>

              <!-- Body -->
              <div
                class="prose prose-sm max-w-none text-foreground leading-relaxed"
                [innerHTML]="email.body"
              ></div>

              <!-- Attachments -->
              <div *ngIf="email.attachments?.length" class="mt-6 pt-4 border-t border-border">
                <p class="text-sm font-medium text-foreground mb-2">Attachments</p>
                <div class="flex flex-wrap gap-2">
                  <div
                    *ngFor="let att of email.attachments"
                    class="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm text-muted-foreground hover:bg-accent cursor-pointer"
                  >
                    <ng-icon name="lucidePaperclip" class="w-4 h-4" />
                    {{ att.fileName }}
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
        </ng-template>
      </div>
    </div>
  `,
})
export class EmailComponent implements OnInit {
  private readonly _emailService = inject(EmailService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  // ── State signals ──────────────────────────────────────────────────────────
  readonly activeCategory = signal<EmailCategory>('inbox');
  readonly emails = signal<Email[]>([]);
  readonly selectedEmail = signal<Email | null>(null);
  readonly isLoading = signal(false);
  readonly composeOpen = signal(false);
  readonly labels = signal<EmailLabel[]>([]);
  readonly totalCount = signal(0);
  readonly page = signal(1);

  // Compose form state
  composeTo = '';
  composeSubject = '';
  composeBody = '';
  searchQuery = '';

  // ── Category tabs ──────────────────────────────────────────────────────────
  readonly tabs: EmailTab[] = [
    { key: 'inbox', label: 'Inbox', icon: 'lucideInbox' },
    { key: 'sent', label: 'Sent', icon: 'lucideSend' },
    { key: 'draft', label: 'Drafts', icon: 'lucideFileEdit' },
    { key: 'spam', label: 'Spam', icon: 'lucideAlertTriangle' },
    { key: 'trash', label: 'Trash', icon: 'lucideTrash2' },
  ];

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly filteredEmails = computed(() => {
    if (!this.searchQuery) return this.emails();
    const q = this.searchQuery.toLowerCase();
    return this.emails().filter(
      (e) =>
        e.subject.toLowerCase().includes(q) ||
        e.from.email.toLowerCase().includes(q) ||
        (e.from.name ?? '').toLowerCase().includes(q) ||
        (e.bodyText ?? '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    // Sync active category from route params
    this._route.params.subscribe((params) => {
      if (params['category']) {
        this.activeCategory.set(params['category'] as EmailCategory);
      }
      if (params['emailId']) {
        this._emailService.getEmail(params['emailId']).subscribe((e) => {
          if (e) this.selectedEmail.set(e);
        });
      }
      this._loadEmails();
    });

    this._emailService.getLabels().subscribe((l) => this.labels.set(l));
    this._loadEmails();
  }

  private _loadEmails(): void {
    this.isLoading.set(true);
    this._emailService
      .getEmails({ category: this.activeCategory(), pageNo: this.page(), pageSize: 20 })
      .subscribe((res) => {
        this.emails.set(res.items);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      });
  }

  selectCategory(category: EmailCategory): void {
    this.activeCategory.set(category);
    this.selectedEmail.set(null);
    this.page.set(1);
    this._loadEmails();
  }

  selectEmail(email: Email): void {
    this.selectedEmail.set(email);
    this.composeOpen.set(false);
    // Mark as read
    if (!email.isRead) {
      this._emailService.markAsRead(email.emailId, true).subscribe();
    }
  }

  openCompose(): void {
    this.composeOpen.set(true);
    this.selectedEmail.set(null);
    this.composeTo = '';
    this.composeSubject = '';
    this.composeBody = '';
  }

  sendEmail(): void {
    this._emailService
      .sendEmail({
        subject: this.composeSubject,
        body: this.composeBody,
        to: [{ email: this.composeTo }],
      })
      .subscribe(() => {
        this.composeOpen.set(false);
        if (this.activeCategory() === 'sent') this._loadEmails();
      });
  }

  saveDraft(): void {
    this._emailService
      .saveDraft({
        subject: this.composeSubject,
        body: this.composeBody,
        to: [{ email: this.composeTo }],
      })
      .subscribe(() => this.composeOpen.set(false));
  }

  toggleStar(email: Email): void {
    this._emailService.toggleStar(email.emailId, !email.isStarred).subscribe();
    this.emails.update((list) =>
      list.map((e) => (e.emailId === email.emailId ? { ...e, isStarred: !e.isStarred } : e))
    );
  }

  replyEmail(email: Email): void {
    this.composeTo = email.from.email;
    this.composeSubject = `Re: ${email.subject}`;
    this.composeBody = `\n\n---\nOn ${email.createdAt}, ${email.from.email} wrote:\n${email.bodyText}`;
    this.composeOpen.set(true);
  }

  forwardEmail(email: Email): void {
    this.composeTo = '';
    this.composeSubject = `Fwd: ${email.subject}`;
    this.composeBody = `\n\n---\nForwarded message from ${email.from.email}:\n${email.bodyText}`;
    this.composeOpen.set(true);
  }

  trashEmail(email: Email): void {
    this._emailService.moveToTrash(email.emailId).subscribe(() => {
      this.emails.update((list) => list.filter((e) => e.emailId !== email.emailId));
      this.selectedEmail.set(null);
    });
  }

  refresh(): void {
    this._loadEmails();
  }
  prevPage(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this._loadEmails();
    }
  }
  nextPage(): void {
    this.page.update((p) => p + 1);
    this._loadEmails();
  }
}
