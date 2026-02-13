import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EventDetail, GroupDetail } from '../../core/models/event.model';
import { EventService } from '../event.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.html',
  imports: [RouterLink],
})
export class EventDetailComponent implements OnInit {
  event = signal<EventDetail | null>(null);
  loading = signal(false);
  expandedGroups = signal<Set<number>>(new Set());

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.event.set(event);
        // Expand all groups by default
        this.expandedGroups.set(new Set(event.groups.map((g) => g.id)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleGroup(groupId: number): void {
    this.expandedGroups.update((set) => {
      const next = new Set(set);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  isExpanded(groupId: number): boolean {
    return this.expandedGroups().has(groupId);
  }

  objectEntries(obj: Record<string, string> | null): [string, string][] {
    return obj ? Object.entries(obj) : [];
  }
}
