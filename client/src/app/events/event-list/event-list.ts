import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EventSummary } from '../../core/models/event.model';
import { EventService } from '../event.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.html',
  imports: [RouterLink],
})
export class EventList implements OnInit {
  events = signal<EventSummary[]>([]);
  loading = signal(false);

  constructor(
    private eventService: EventService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading.set(true);
    this.eventService.listEvents().subscribe({
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
    this.eventService.deleteEvent(event.id).subscribe({
      next: () => this.events.update((list) => list.filter((e) => e.id !== event.id)),
    });
  }
}
