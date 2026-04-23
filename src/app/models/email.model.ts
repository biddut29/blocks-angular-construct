// ─── Email Models ──────────────────────────────────────────────────────────────
// Mirrors: src/modules/email/types/ in React project

export type EmailCategory = 'inbox' | 'sent' | 'draft' | 'spam' | 'trash';

export interface EmailAttachment {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url?: string;
}

export interface EmailLabel {
  labelId: string;
  name: string;
  color: string;
}

export interface EmailContact {
  name?: string;
  email: string;
}

export interface Email {
  emailId: string;
  subject: string;
  body: string;
  bodyText?: string;
  from: EmailContact;
  to: EmailContact[];
  cc?: EmailContact[];
  bcc?: EmailContact[];
  category: EmailCategory;
  labels?: EmailLabel[];
  attachments?: EmailAttachment[];
  isRead: boolean;
  isStarred: boolean;
  isImportant?: boolean;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt?: string;
  threadId?: string;
  parentEmailId?: string;
}

export interface ComposeEmailInput {
  subject: string;
  body: string;
  to: EmailContact[];
  cc?: EmailContact[];
  bcc?: EmailContact[];
  attachments?: File[];
  labels?: string[];
}

export interface EmailFilter {
  category: EmailCategory;
  labelId?: string;
  search?: string;
  pageNo: number;
  pageSize: number;
}
