// ─── Calendar Service ──────────────────────────────────────────────────────────
// Mirrors: src/modules/calendar/services/ in React project
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GraphQLService } from '../../../lib/graphql.service';
import { CalendarEvent, CreateEventInput, EventMember, UpdateEventInput } from '../../../models/calendar.model';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly _graphql = inject(GraphQLService);

  private mapMemberIds(ids: string[] | undefined): EventMember[] | undefined {
    if (!ids?.length) return undefined;
    return ids.map((userId) => ({
      userId,
      name: userId,
      email: '',
    }));
  }

  // ── Get Events ─────────────────────────────────────────────────────────────
  getEvents(): Observable<CalendarEvent[]> {
    // Mock data — replace with actual GraphQL query
    return of([
      {
        eventId: 'evt-001',
        title: 'Team Standup',
        start: new Date('2024-06-17T09:00:00'),
        end: new Date('2024-06-17T09:30:00'),
        color: '#4f46e5',
        description: 'Daily standup meeting',
        createdAt: new Date().toISOString(),
      },
      {
        eventId: 'evt-002',
        title: 'Product Review',
        start: new Date('2024-06-18T14:00:00'),
        end: new Date('2024-06-18T15:30:00'),
        color: '#0ea5e9',
        description: 'Q2 product review',
        createdAt: new Date().toISOString(),
      },
      {
        eventId: 'evt-003',
        title: 'Client Meeting',
        start: new Date('2024-06-20T10:00:00'),
        end: new Date('2024-06-20T11:00:00'),
        color: '#16a34a',
        description: 'Monthly client sync',
        createdAt: new Date().toISOString(),
      },
      {
        eventId: 'evt-004',
        title: 'Sprint Planning',
        start: new Date('2024-06-24T09:00:00'),
        end: new Date('2024-06-24T12:00:00'),
        color: '#dc2626',
        description: 'Sprint 14 planning',
        allDay: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  // ── Create Event ───────────────────────────────────────────────────────────
  createEvent(input: CreateEventInput): Observable<CalendarEvent> {
    const { members, ...rest } = input;
    const newEvent: CalendarEvent = {
      eventId: `evt-${Date.now()}`,
      ...rest,
      members: this.mapMemberIds(members),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return of(newEvent);
  }

  // ── Update Event ───────────────────────────────────────────────────────────
  updateEvent(id: string, input: UpdateEventInput): Observable<CalendarEvent> {
    const { members, ...rest } = input;
    const updated: CalendarEvent = {
      eventId: id,
      title: rest.title ?? 'Updated Event',
      start: rest.start ?? new Date(),
      end: rest.end ?? new Date(),
      ...rest,
      ...(members !== undefined ? { members: this.mapMemberIds(members) } : {}),
      updatedAt: new Date().toISOString(),
    };
    return of(updated);
  }

  // ── Delete Event ───────────────────────────────────────────────────────────
  deleteEvent(id: string): Observable<void> {
    return of(void 0);
  }
}
