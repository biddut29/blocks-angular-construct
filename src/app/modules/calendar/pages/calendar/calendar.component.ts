// ─── Calendar Component ────────────────────────────────────────────────────────
// Mirrors: src/modules/calendar/pages/CalendarPage.tsx in React project
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideX, lucideCalendar } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import {
  HlmDialog,
  HlmDialogContent,
  HlmDialogHeader,
  HlmDialogFooter,
  HlmDialogTitle,
  HlmDialogDescription,
  HlmDialogTrigger,
} from '@spartan-ng/helm/dialog';
import { CalendarService } from '../../services/calendar.service';
import { CalendarEvent, CreateEventInput } from '../../../../models/calendar.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
    NgIconComponent,
    HlmButton,
    HlmInput,
    HlmLabel,
    BrnDialogContent,
    HlmDialog,
    HlmDialogContent,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmDialogTitle,
    HlmDialogDescription,
    HlmDialogTrigger,
  ],
  viewProviders: [provideIcons({ lucidePlus, lucideX, lucideCalendar })],
  template: `
    <div class="p-6 space-y-6">
      <!-- ── Page Header ─────────────────────────────────────────── -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your events and schedule.
          </p>
        </div>

        <!-- Add Event Button -->
        <hlm-dialog>
          <button hlmBtn hlmDialogTrigger class="flex items-center gap-2">
            <ng-icon name="lucidePlus" size="16"></ng-icon>
            Add Event
          </button>

          <hlm-dialog-content *brnDialogContent="let ctx" class="sm:max-w-md">
            <hlm-dialog-header>
              <h3 hlmDialogTitle>Add New Event</h3>
              <p hlmDialogDescription>Fill in the details to create a new calendar event.</p>
            </hlm-dialog-header>

            <form [formGroup]="eventForm" (ngSubmit)="onSubmitEvent(ctx)" class="space-y-4 py-4">
              <div class="space-y-1">
                <label hlmLabel for="title">Event Title</label>
                <input
                  hlmInput
                  id="title"
                  formControlName="title"
                  placeholder="Team meeting..."
                  class="w-full"
                />
              </div>

              <div class="space-y-1">
                <label hlmLabel for="start">Start Date & Time</label>
                <input
                  hlmInput
                  id="start"
                  type="datetime-local"
                  formControlName="start"
                  class="w-full"
                />
              </div>

              <div class="space-y-1">
                <label hlmLabel for="end">End Date & Time</label>
                <input
                  hlmInput
                  id="end"
                  type="datetime-local"
                  formControlName="end"
                  class="w-full"
                />
              </div>

              <div class="space-y-1">
                <label hlmLabel for="description">Description</label>
                <input
                  hlmInput
                  id="description"
                  formControlName="description"
                  placeholder="Optional description..."
                  class="w-full"
                />
              </div>

              <div class="space-y-1">
                <label hlmLabel for="color">Color</label>
                <input
                  type="color"
                  id="color"
                  formControlName="color"
                  class="h-9 w-full rounded-md border border-input cursor-pointer"
                />
              </div>

              <hlm-dialog-footer class="gap-2">
                <button type="button" hlmBtn variant="outline" (click)="ctx.close()">Cancel</button>
                <button type="submit" hlmBtn [disabled]="eventForm.invalid">Create Event</button>
              </hlm-dialog-footer>
            </form>
          </hlm-dialog-content>
        </hlm-dialog>
      </div>

      <!-- ── Calendar ────────────────────────────────────────────── -->
      <div
        class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4"
      >
        <full-calendar [options]="calendarOptions()"></full-calendar>
      </div>

      <!-- ── Event Detail Dialog (click) ────────────────────────── -->
      @if (selectedEvent()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          (click)="selectedEvent.set(null)"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4"
            (click)="$event.stopPropagation()"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 rounded-full"
                  [style.background-color]="selectedEvent()!.color ?? '#4f46e5'"
                ></div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ selectedEvent()!.title }}
                </h3>
              </div>
              <button
                (click)="selectedEvent.set(null)"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <ng-icon name="lucideX" size="18"></ng-icon>
              </button>
            </div>
            @if (selectedEvent()!.description) {
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {{ selectedEvent()!.description }}
              </p>
            }
            <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <ng-icon name="lucideCalendar" size="14"></ng-icon>
              <span>{{ selectedEvent()!.start | date: 'medium' }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CalendarComponent implements OnInit {
  private readonly calendarService = inject(CalendarService);
  private readonly fb = inject(FormBuilder);

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly events = signal<EventInput[]>([]);
  readonly selectedEvent = signal<CalendarEvent | null>(null);

  // ── Calendar Options (signal) ──────────────────────────────────────────────
  readonly calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    events: [],
    eventClick: (arg: EventClickArg) => this._onEventClick(arg),
    dateClick: (arg: DateClickArg) => this._onDateClick(arg),
  });

  // ── Event Form ─────────────────────────────────────────────────────────────
  readonly eventForm = this.fb.group({
    title: ['', Validators.required],
    start: ['', Validators.required],
    end: ['', Validators.required],
    description: [''],
    color: ['#4f46e5'],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.calendarService.getEvents().subscribe((events) => {
      const calEvents: EventInput[] = events.map((e) => ({
        id: e.eventId,
        title: e.title,
        start: e.start,
        end: e.end,
        allDay: e.allDay ?? false,
        color: e.color ?? '#4f46e5',
        extendedProps: { description: e.description, original: e },
      }));
      this.events.set(calEvents);
      this.calendarOptions.update((opts) => ({ ...opts, events: calEvents }));
    });
  }

  // ── Submit New Event ───────────────────────────────────────────────────────
  onSubmitEvent(ctx: { close: () => void }): void {
    if (this.eventForm.invalid) return;
    const val = this.eventForm.getRawValue();
    const input: CreateEventInput = {
      title: val.title!,
      start: val.start!,
      end: val.end!,
      description: val.description ?? undefined,
      color: val.color ?? '#4f46e5',
    };
    this.calendarService.createEvent(input).subscribe((newEvent) => {
      const calEvent: EventInput = {
        id: newEvent.eventId,
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        color: newEvent.color ?? '#4f46e5',
        extendedProps: { description: newEvent.description, original: newEvent },
      };
      this.events.update((list) => [...list, calEvent]);
      this.calendarOptions.update((opts) => ({ ...opts, events: this.events() }));
      this.eventForm.reset({ color: '#4f46e5' });
      ctx.close();
    });
  }

  // ── Event Click Handler ────────────────────────────────────────────────────
  private _onEventClick(arg: EventClickArg): void {
    const original = arg.event.extendedProps['original'] as CalendarEvent;
    this.selectedEvent.set(original ?? null);
  }

  // ── Date Click Handler ─────────────────────────────────────────────────────
  private _onDateClick(arg: DateClickArg): void {
    const dateStr = arg.dateStr + 'T09:00';
    this.eventForm.patchValue({ start: dateStr, end: dateStr.replace('T09:00', 'T10:00') });
  }
}
