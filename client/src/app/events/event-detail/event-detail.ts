import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EventDetail } from '../../core/models/event.model';
import { Activity, EvaluationType } from '../../core/models/activity.model';
import { User, UserRole } from '../../core/models/user.model';
import { AuthService } from '../../auth/auth.service';
import { EventService } from '../event.service';
import { GroupService } from '../group.service';
import { ScoringService } from '../../scoring/scoring.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.html',
  imports: [RouterLink, FormsModule],
})
export class EventDetailComponent implements OnInit {
  event = signal<EventDetail | null>(null);
  loading = signal(false);
  expandedGroups = signal<Set<number>>(new Set());
  availableEvaluators = signal<User[]>([]);

  // Activity form
  newActivityName = '';
  newActivityType: EvaluationType = EvaluationType.NUMERIC_HIGH;
  evaluationTypes = Object.values(EvaluationType);

  constructor(
    private eventService: EventService,
    private groupService: GroupService,
    private scoringService: ScoringService,
    private route: ActivatedRoute,
    public authService: AuthService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.expandedGroups.set(new Set(event.groups.map((g) => g.id)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    if (this.authService.isAdmin()) {
      this.http.get<User[]>(`${environment.apiUrl}/admin/users`).subscribe({
        next: (users) => {
          this.availableEvaluators.set(
            users.filter((u) => u.is_active && u.role === UserRole.EVALUATOR),
          );
        },
      });
    }
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

  onDragStart(event: DragEvent, userId: number): void {
    event.dataTransfer?.setData('text/plain', String(userId));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, groupId: number): void {
    event.preventDefault();
    const userId = Number(event.dataTransfer?.getData('text/plain'));
    if (userId) {
      this.assignEvaluator(groupId, userId);
    }
  }

  assignEvaluator(groupId: number, userId: number): void {
    this.groupService.assignEvaluator(groupId, userId).subscribe({
      next: () => {
        const evaluator = this.availableEvaluators().find((u) => u.id === userId);
        if (evaluator) {
          this.event.update((ev) => {
            if (!ev) return ev;
            return {
              ...ev,
              groups: ev.groups.map((g) =>
                g.id === groupId
                  ? {
                      ...g,
                      evaluators: [
                        ...g.evaluators,
                        { id: evaluator.id, email: evaluator.email, full_name: evaluator.full_name },
                      ],
                    }
                  : g,
              ),
            };
          });
        }
      },
    });
  }

  removeEvaluator(groupId: number, userId: number): void {
    this.groupService.removeEvaluator(groupId, userId).subscribe({
      next: () => {
        this.event.update((ev) => {
          if (!ev) return ev;
          return {
            ...ev,
            groups: ev.groups.map((g) =>
              g.id === groupId
                ? { ...g, evaluators: g.evaluators.filter((e) => e.id !== userId) }
                : g,
            ),
          };
        });
      },
    });
  }

  getUnassignedEvaluators(): User[] {
    const ev = this.event();
    if (!ev) return [];
    const assignedIds = new Set(ev.groups.flatMap((g) => g.evaluators.map((e) => e.id)));
    return this.availableEvaluators().filter((u) => !assignedIds.has(u.id));
  }

  createActivity(): void {
    const ev = this.event();
    if (!ev || !this.newActivityName.trim()) return;
    this.scoringService
      .createActivity({
        name: this.newActivityName.trim(),
        evaluation_type: this.newActivityType,
        event_id: ev.id,
      })
      .subscribe({
        next: (activity) => {
          this.event.update((e) =>
            e ? { ...e, activities: [...e.activities, activity] } : e,
          );
          this.newActivityName = '';
        },
      });
  }

  deleteActivity(activityId: number): void {
    this.scoringService.deleteActivity(activityId).subscribe({
      next: () => {
        this.event.update((e) =>
          e ? { ...e, activities: e.activities.filter((a) => a.id !== activityId) } : e,
        );
      },
    });
  }
}
