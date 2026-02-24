import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { EventDetail, EventSummary, EvaluatorInfo } from '../../core/models/event.model';
import { Activity, EvaluationType } from '../../core/models/activity.model';
import { AgeCategory } from '../../core/models/age-category.model';
import { User, UserRole } from '../../core/models/user.model';
import { AuthService } from '../../auth/auth.service';
import { EventService } from '../event.service';
import { GroupService } from '../group.service';
import { ScoringService } from '../../scoring/scoring.service';
import { ToastService } from '../../shared/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.html',
  imports: [RouterLink, FormsModule, TranslocoPipe],
})
export class EventDetailComponent implements OnInit {
  event = signal<EventDetail | null>(null);
  loading = signal(false);
  savingActivity = signal(false);
  exportingCsv = signal(false);
  expandedGroups = signal<Set<number>>(new Set());
  availableEvaluators = signal<User[]>([]);
  ageCategories = signal<AgeCategory[]>([]);

  private destroy$ = untilDestroyed();

  // Activity form
  newActivityName = '';
  newActivityType: EvaluationType = EvaluationType.NUMERIC_HIGH;
  evaluationTypes: { value: EvaluationType; key: string }[] = [
    { value: EvaluationType.NUMERIC_HIGH, key: 'EVENTS.NUMERIC_HIGH' },
    { value: EvaluationType.NUMERIC_LOW,  key: 'EVENTS.NUMERIC_LOW'  },
    { value: EvaluationType.BOOLEAN,      key: 'EVENTS.BOOLEAN'      },
    { value: EvaluationType.SCORE_SET,    key: 'EVENTS.SCORE_SET'    },
  ];

  // Age bracket form
  newCatName = '';
  newCatMinAge = 0;
  newCatMaxAge = 17;

  // Event evaluator pool
  addToPoolUserId: number | null = null;

  // Move modal
  showMoveModal = signal(false);
  allEvents = signal<EventSummary[]>([]);
  sourceEventId: number | null = null;
  sourceEvaluators = signal<EvaluatorInfo[]>([]);
  moveSelection = signal<Set<number>>(new Set());

  constructor(
    private eventService: EventService,
    private groupService: GroupService,
    private scoringService: ScoringService,
    private route: ActivatedRoute,
    public authService: AuthService,
    private toast: ToastService,
    private http: HttpClient,
  ) { }

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

    this.eventService.getAgeCategories(id).subscribe({
      next: (cats) => this.ageCategories.set(cats),
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

  // -- Event evaluator pool --

  getEvaluatorsNotInPool(): User[] {
    const ev = this.event();
    if (!ev) return [];
    const poolIds = new Set(ev.event_evaluators.map((e) => e.id));
    return this.availableEvaluators().filter((u) => !poolIds.has(u.id));
  }

  addToPool(): void {
    const ev = this.event();
    if (!ev || !this.addToPoolUserId) return;
    const userId = this.addToPoolUserId;
    this.eventService.assignEventEvaluator(ev.id, userId).subscribe({
      next: () => {
        const user = this.availableEvaluators().find((u) => u.id === userId);
        if (user) {
          this.event.update((e) =>
            e ? { ...e, event_evaluators: [...e.event_evaluators, { id: user.id, email: user.email, full_name: user.full_name }] } : e,
          );
          this.toast.success(`${user.full_name} added to pool`);
        }
        this.addToPoolUserId = null;
      },
    });
  }

  removeFromPool(userId: number): void {
    const ev = this.event();
    if (!ev) return;
    const evaluator = ev.event_evaluators.find((e) => e.id === userId);
    // Check if evaluator is assigned to any group
    const inGroup = ev.groups.some((g) => g.evaluators.some((e) => e.id === userId));
    if (inGroup && !confirm('This evaluator is assigned to a group. Removing from pool will also remove group assignment. Continue?')) {
      return;
    }
    this.eventService.removeEventEvaluator(ev.id, userId).subscribe({
      next: () => {
        this.event.update((e) => {
          if (!e) return e;
          return {
            ...e,
            event_evaluators: e.event_evaluators.filter((ev) => ev.id !== userId),
            groups: e.groups.map((g) => ({
              ...g,
              evaluators: g.evaluators.filter((ev) => ev.id !== userId),
            })),
          };
        });
        this.toast.success('Removed from pool');
      },
    });
  }

  openMoveModal(): void {
    this.eventService.listEvents().subscribe({
      next: (events) => {
        const ev = this.event();
        this.allEvents.set(events.filter((e) => e.id !== ev?.id));
        this.showMoveModal.set(true);
      },
    });
  }

  closeMoveModal(): void {
    this.showMoveModal.set(false);
    this.sourceEventId = null;
    this.sourceEvaluators.set([]);
    this.moveSelection.set(new Set());
  }

  onSourceEventChange(): void {
    if (!this.sourceEventId) {
      this.sourceEvaluators.set([]);
      return;
    }
    this.eventService.listEventEvaluators(this.sourceEventId).subscribe({
      next: (evals) => {
        this.sourceEvaluators.set(evals);
        this.moveSelection.set(new Set());
      },
    });
  }

  toggleMoveSelection(userId: number): void {
    this.moveSelection.update((set) => {
      const next = new Set(set);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  confirmMove(): void {
    const ev = this.event();
    if (!ev || !this.sourceEventId || this.moveSelection().size === 0) return;
    this.eventService
      .moveEvaluators(ev.id, {
        source_event_id: this.sourceEventId,
        user_ids: Array.from(this.moveSelection()),
      })
      .subscribe({
        next: () => {
          // Refresh event to get updated evaluator pool
          this.eventService.getEvent(ev.id).subscribe({
            next: (updated) => this.event.set(updated),
          });
          this.closeMoveModal();
          this.toast.success('Evaluators moved');
        },
      });
  }

  // -- Drag & drop (from pool to groups) --

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
        const ev = this.event();
        const evaluator = ev?.event_evaluators.find((u) => u.id === userId)
          ?? this.availableEvaluators().find((u) => u.id === userId);
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
          this.toast.success(`${evaluator.full_name} assigned`);
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
        this.toast.success('Evaluator removed');
      },
    });
  }

  getUnassignedEvaluators(): EvaluatorInfo[] {
    const ev = this.event();
    if (!ev) return [];
    const assignedIds = new Set(ev.groups.flatMap((g) => g.evaluators.map((e) => e.id)));
    // From event pool, filter those not yet assigned to any group
    return ev.event_evaluators.filter((u) => !assignedIds.has(u.id));
  }

  createActivity(): void {
    const ev = this.event();
    if (!ev || !this.newActivityName.trim()) return;
    this.savingActivity.set(true);
    this.scoringService
      .createActivity({
        name: this.newActivityName.trim(),
        evaluation_type: this.newActivityType,
        event_id: ev.id,
      })
      .pipe(this.destroy$())
      .subscribe({
        next: (activity) => {
          this.event.update((e) =>
            e ? { ...e, activities: [...e.activities, activity] } : e,
          );
          this.newActivityName = '';
          this.savingActivity.set(false);
          this.toast.success(`Activity "${activity.name}" created`);
        },
        error: () => this.savingActivity.set(false),
      });
  }

  deleteActivity(activityId: number): void {
    this.scoringService.deleteActivity(activityId).subscribe({
      next: () => {
        this.event.update((e) =>
          e ? { ...e, activities: e.activities.filter((a) => a.id !== activityId) } : e,
        );
        this.toast.success('Activity deleted');
      },
    });
  }

  exportCsv(eventId: number): void {
    this.exportingCsv.set(true);
    this.eventService
      .exportCsv(eventId)
      .pipe(this.destroy$())
      .subscribe({
        next: () => this.exportingCsv.set(false),
        error: () => this.exportingCsv.set(false),
      });
  }

  addAgeCategory(): void {
    const ev = this.event();
    if (!ev || !this.newCatName.trim()) return;
    this.eventService
      .createAgeCategory(ev.id, {
        name: this.newCatName.trim(),
        min_age: this.newCatMinAge,
        max_age: this.newCatMaxAge,
      })
      .subscribe({
        next: (cat) => {
          this.ageCategories.update((cats) => [...cats, cat]);
          this.newCatName = '';
          this.newCatMinAge = 0;
          this.newCatMaxAge = 17;
        },
      });
  }

  removeAgeCategory(categoryId: number): void {
    const ev = this.event();
    if (!ev) return;
    this.eventService.deleteAgeCategory(ev.id, categoryId).subscribe({
      next: () => {
        this.ageCategories.update((cats) => cats.filter((c) => c.id !== categoryId));
      },
    });
  }
}
