import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { EventSummary } from '../../core/models/event.model';
import { EventService } from '../event.service';
import { AuthService } from '../../auth/auth.service';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.html',
  imports: [RouterLink, TranslocoPipe],
})
export class EventList implements OnInit {
  events = signal<EventSummary[]>([]);
  loading = signal(false);

  private destroy$ = untilDestroyed();

  constructor(
    private eventService: EventService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading.set(true);
    this.eventService.listEvents().pipe(this.destroy$()).subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  deleteEvent(event: EventSummary): void {
    if (!confirm(`Delete event "${event.name}"? This will also delete all groups and participants.`)) {
      return;
    }
    this.eventService.deleteEvent(event.id).pipe(this.destroy$()).subscribe({
      next: () => this.events.update((list) => list.filter((e) => e.id !== event.id)),
    });
  }
}
