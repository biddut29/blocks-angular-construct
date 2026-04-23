// ─── Email Service ─────────────────────────────────────────────────────────────
// Mirrors: src/modules/email/services/ in React project
// Uses same GraphQL API endpoints via GraphQLService

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GraphQLService } from '../../../lib/graphql.service';
import { Email, EmailFilter, ComposeEmailInput, EmailLabel, EmailCategory } from '../../../models/email.model';
import { PaginatedResponse } from '../../../types/api.types';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly _graphql = inject(GraphQLService);

  /** Fetch emails by category/label */
  getEmails(filter: EmailFilter): Observable<PaginatedResponse<Email>> {
    // Mirrors: getEmails GraphQL query in React
    return of({
      items: this._mockEmails().filter(e =>
        filter.category === 'inbox' ? e.category === 'inbox' : e.category === filter.category,
      ),
      totalCount: 24,
      pageNo: filter.pageNo,
      pageSize: filter.pageSize,
      totalPages: 3,
    });
  }

  /** Get a single email by ID */
  getEmail(emailId: string): Observable<Email | null> {
    const found = this._mockEmails().find(e => e.emailId === emailId) ?? null;
    return of(found);
  }

  /** Send / save draft */
  sendEmail(input: ComposeEmailInput): Observable<Email> {
    const newEmail: Email = {
      emailId: crypto.randomUUID(),
      subject: input.subject,
      body: input.body,
      from: { email: 'me@example.com', name: 'Me' },
      to: input.to,
      cc: input.cc,
      bcc: input.bcc,
      category: 'sent',
      isRead: true,
      isStarred: false,
      createdAt: new Date().toISOString(),
    };
    return of(newEmail);
  }

  /** Save as draft */
  saveDraft(input: ComposeEmailInput): Observable<Email> {
    const draft: Email = {
      emailId: crypto.randomUUID(),
      subject: input.subject,
      body: input.body,
      from: { email: 'me@example.com', name: 'Me' },
      to: input.to,
      category: 'draft',
      isRead: true,
      isStarred: false,
      createdAt: new Date().toISOString(),
    };
    return of(draft);
  }

  /** Mark email as read/unread */
  markAsRead(emailId: string, isRead: boolean): Observable<void> {
    return of(void 0);
  }

  /** Star / unstar an email */
  toggleStar(emailId: string, isStarred: boolean): Observable<void> {
    return of(void 0);
  }

  /** Move to trash */
  moveToTrash(emailId: string): Observable<void> {
    return of(void 0);
  }

  /** Delete permanently */
  deleteEmail(emailId: string): Observable<void> {
    return of(void 0);
  }

  /** Get all labels */
  getLabels(): Observable<EmailLabel[]> {
    return of([
      { labelId: '1', name: 'Work', color: '#3b82f6' },
      { labelId: '2', name: 'Personal', color: '#10b981' },
      { labelId: '3', name: 'Urgent', color: '#ef4444' },
      { labelId: '4', name: 'Finance', color: '#f59e0b' },
    ]);
  }

  /** Apply label to email */
  applyLabel(emailId: string, labelId: string): Observable<void> {
    return of(void 0);
  }

  // ── Mock data (replace with real GraphQL) ─────────────────────────────────
  private _mockEmails(): Email[] {
    return [
      {
        emailId: '1',
        subject: 'Q2 Budget Review',
        body: '<p>Hi team,</p><p>Please review the attached Q2 budget report...</p>',
        bodyText: 'Hi team, Please review the attached Q2 budget report...',
        from: { name: 'John Smith', email: 'john@example.com' },
        to: [{ email: 'me@example.com' }],
        category: 'inbox',
        isRead: false,
        isStarred: true,
        attachments: [],
        labels: [{ labelId: '4', name: 'Finance', color: '#f59e0b' }],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        emailId: '2',
        subject: 'Project kickoff meeting',
        body: '<p>Team,</p><p>We are starting the new project next Monday...</p>',
        bodyText: 'Team, We are starting the new project next Monday...',
        from: { name: 'Sarah Connor', email: 'sarah@example.com' },
        to: [{ email: 'me@example.com' }],
        category: 'inbox',
        isRead: true,
        isStarred: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        emailId: '3',
        subject: 'Re: Design feedback',
        body: '<p>Thanks for the quick turnaround on those designs!</p>',
        bodyText: 'Thanks for the quick turnaround on those designs!',
        from: { name: 'Alex Johnson', email: 'alex@example.com' },
        to: [{ email: 'me@example.com' }],
        category: 'inbox',
        isRead: true,
        isStarred: false,
        labels: [{ labelId: '1', name: 'Work', color: '#3b82f6' }],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        emailId: '4',
        subject: 'Weekly report',
        body: '<p>Hi,</p><p>Please find the weekly report attached.</p>',
        bodyText: 'Hi, Please find the weekly report attached.',
        from: { name: 'Me', email: 'me@example.com' },
        to: [{ name: 'Team', email: 'team@example.com' }],
        category: 'sent',
        isRead: true,
        isStarred: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        emailId: '5',
        subject: 'Draft: Proposal for new client',
        body: '<p>Dear potential client,</p><p>I would like to propose...</p>',
        bodyText: 'Dear potential client, I would like to propose...',
        from: { name: 'Me', email: 'me@example.com' },
        to: [],
        category: 'draft',
        isRead: true,
        isStarred: false,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
  }
}
