import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ActivityLeaderboard, LeaderboardResponse } from '../../core/models/leaderboard.model';
import { EventService } from '../event.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.html',
  imports: [RouterLink],
})
export class Leaderboard implements OnInit {
  leaderboard = signal<LeaderboardResponse | null>(null);
  loading = signal(true);
  expandedActivities = signal<Set<number>>(new Set());
  eventId = 0;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService.getLeaderboard(this.eventId).subscribe({
      next: (data) => {
        this.leaderboard.set(data);
        this.expandedActivities.set(new Set(data.activities.map((a) => a.activity_id)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleActivity(activityId: number): void {
    this.expandedActivities.update((set) => {
      const next = new Set(set);
      if (next.has(activityId)) {
        next.delete(activityId);
      } else {
        next.add(activityId);
      }
      return next;
    });
  }

  isExpanded(activityId: number): boolean {
    return this.expandedActivities().has(activityId);
  }

  genderLabel(g: string): string {
    if (g === 'M') return 'Men';
    if (g === 'F') return 'Women';
    return g;
  }

  formatValue(val: string, evalType: string): string {
    if (evalType === 'BOOLEAN') {
      return val === '1' ? '✓' : '✗';
    }
    return val;
  }

  rankMedal(rank: number): string {
    return { 1: '🥇', 2: '🥈', 3: '🥉' }[rank] ?? String(rank);
  }
}
