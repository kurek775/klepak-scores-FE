import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList } from '@angular/cdk/drag-drop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';

import { User, UserRole } from '../../core/models/user.model';
import { EvaluatorInfo, EventSummary } from '../../core/models/event.model';
import { AdminService } from '../admin.service';
import { EventService } from '../../events/event.service';
import { ToastService } from '../../shared/toast.service';
import { untilDestroyed } from '../../core/utils/destroy';

interface EvaluatorRow {
  user: User;
  assignedEventIds: Set<number>;
}

@Component({
  selector: 'app-evaluator-list',
  templateUrl: './evaluator-list.html',
  imports: [FormsModule, TranslocoPipe, RouterLink, CdkDropList, CdkDrag, CdkDragPreview],
})
export class EvaluatorList implements OnInit {
  evaluators = signal<EvaluatorRow[]>([]);
  events = signal<EventSummary[]>([]);
  loading = signal(false);
  filterText = signal('');

  filteredEvaluators = computed(() => {
    const term = this.filterText().toLowerCase().trim();
    if (!term) return this.evaluators();
    return this.evaluators().filter(e =>
      e.user.full_name.toLowerCase().includes(term) ||
      e.user.email.toLowerCase().includes(term),
    );
  });

  evaluatorDropListIds = computed(() =>
    this.filteredEvaluators().map(r => `evaluator-${r.user.id}`),
  );

  private destroy$ = untilDestroyed();

  constructor(
    private adminService: AdminService,
    private eventService: EventService,
    private toast: ToastService,
    private transloco: TranslocoService,
  ) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.loadData();
  }

  private loadData(): void {
    forkJoin({
      users: this.adminService.listUsers(),
      events: this.eventService.listEvents(),
    })
      .pipe(this.destroy$())
      .subscribe({
        next: ({ users, events }) => {
          const evaluatorUsers = users.filter(u => u.role === UserRole.EVALUATOR && u.is_active);
          this.events.set(events);

          const rows: EvaluatorRow[] = evaluatorUsers.map(u => ({
            user: u,
            assignedEventIds: new Set<number>(),
          }));

          if (events.length === 0) {
            this.evaluators.set(rows);
            this.loading.set(false);
            return;
          }

          const evaluatorRequests = events.map(ev => this.eventService.listEventEvaluators(ev.id));
          forkJoin(evaluatorRequests)
            .pipe(this.destroy$())
            .subscribe({
              next: (allEvals) => {
                allEvals.forEach((evals, index) => {
                  const eventId = events[index].id;
                  for (const ev of evals) {
                    const row = rows.find(r => r.user.id === ev.id);
                    if (row) {
                      row.assignedEventIds.add(eventId);
                    }
                  }
                });
                this.evaluators.set(rows);
                this.loading.set(false);
              },
              error: () => {
                this.evaluators.set(rows);
                this.loading.set(false);
                this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED'));
              },
            });
        },
        error: () => {
          this.loading.set(false);
          this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED'));
        },
      });
  }

  /** Prevent items being dropped back into the events shelf */
  noReturnPredicate = () => false;

  getEventName(eventId: number): string {
    return this.events().find(e => e.id === eventId)?.name ?? `Event #${eventId}`;
  }

  onDropEvent(event: CdkDragDrop<{ evaluatorRow: EvaluatorRow }>): void {
    const droppedEvent: EventSummary = event.item.data;
    const evaluatorRow = event.container.data?.evaluatorRow as EvaluatorRow | undefined;
    if (!evaluatorRow) return;

    // Re-emit events signal so Angular restores the shelf (CDK moved the DOM element)
    this.events.update(list => [...list]);

    // Already assigned — skip
    if (evaluatorRow.assignedEventIds.has(droppedEvent.id)) {
      this.toast.info(this.transloco.translate('EVENTS.ALREADY_ASSIGNED'));
      return;
    }

    this.eventService.assignEventEvaluator(droppedEvent.id, evaluatorRow.user.id).pipe(this.destroy$()).subscribe({
      next: () => {
        evaluatorRow.assignedEventIds.add(droppedEvent.id);
        this.evaluators.update(list => [...list]);
        this.toast.success(
          this.transloco.translate('EVENTS.EVALUATOR_ADDED_TO_EVENT', { name: evaluatorRow.user.full_name }),
        );
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }

  removeFromEvent(evaluator: EvaluatorRow, eventId: number): void {
    this.eventService.removeEventEvaluator(eventId, evaluator.user.id).pipe(this.destroy$()).subscribe({
      next: () => {
        evaluator.assignedEventIds.delete(eventId);
        this.evaluators.update(list => [...list]);
        this.toast.success(this.transloco.translate('EVENTS.EVALUATOR_REMOVED_FROM_EVENT'));
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }
}
