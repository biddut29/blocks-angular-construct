// ─── Calendar Models ───────────────────────────────────────────────────────────
// Mirrors: src/modules/calendar/types/ in React project

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval?: number;
  endDate?: string;
  count?: number;
  byDay?: string[];
  byMonth?: number[];
}

export interface EventMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface CalendarEvent {
  eventId: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  color?: string;
  description?: string;
  meetingLink?: string;
  members?: EventMember[];
  recurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventInput {
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  color?: string;
  description?: string;
  meetingLink?: string;
  members?: string[];
  recurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}

export type UpdateEventInput = Partial<CreateEventInput>;
