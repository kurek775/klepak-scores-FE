import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { EventDetail, EventStatus } from '../../core/models/event.model';
import { AgeCategory } from '../../core/models/age-category.model';
import { EvaluationType } from '../../core/models/activity.model';
import { ArrowLeftIconComponent } from '../../shared/arrow-left-icon.component';
import { ArrowRightIconComponent } from '../../shared/arrow-right-icon.component';
import { AuthService } from '../../auth/auth.service';
import { EventService } from '../event.service';
import { ToastService } from '../../shared/toast.service';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.html',
  imports: [RouterLink, TranslocoPipe, ArrowLeftIconComponent, ArrowRightIconComponent],
})
export class EventDetailComponent implements OnInit {
  event = signal<EventDetail | null>(null);
  loading = signal(false);
  exportingCsv = signal(false);
  expandedGroups = signal<Set<number>>(new Set());
  ageCategories = signal<AgeCategory[]>([]);

  private destroy$ = untilDestroyed();

  EventStatus = EventStatus;

  evaluationTypes: { value: EvaluationType; key: string }[] = [
    { value: EvaluationType.NUMERIC_HIGH, key: 'EVENTS.NUMERIC_HIGH' },
    { value: EvaluationType.NUMERIC_LOW,  key: 'EVENTS.NUMERIC_LOW'  },
    { value: EvaluationType.BOOLEAN,      key: 'EVENTS.BOOLEAN'      },
    { value: EvaluationType.SCORE_SET,    key: 'EVENTS.SCORE_SET'    },
  ];

  getEvalTypeKey(type: EvaluationType): string {
    return this.evaluationTypes.find(t => t.value === type)?.key ?? type;
  }

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private toast: ToastService,
    private transloco: TranslocoService,
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.eventService.getEvent(id).pipe(this.destroy$()).subscribe({
      next: (event) => {
        // DRAFT events: admins go to wizard, evaluators see read-only
        if (event.status === EventStatus.DRAFT && this.authService.isAdmin()) {
          this.router.navigate(['/events', event.id, 'setup'], { replaceUrl: true });
          return;
        }
        this.event.set(event);
        this.expandedGroups.set(new Set(event.groups.map((g) => g.id)));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED'));
      },
    });

    this.eventService.getAgeCategories(id).pipe(this.destroy$()).subscribe({
      next: (cats) => this.ageCategories.set(cats),
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
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

  exportCsv(eventId: number): void {
    this.exportingCsv.set(true);
    this.eventService
      .exportCsv(eventId)
      .pipe(this.destroy$())
      .subscribe({
        next: () => this.exportingCsv.set(false),
        error: () => {
          this.exportingCsv.set(false);
          this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED'));
        },
      });
  }

  updateEventStatus(status: EventStatus): void {
    const ev = this.event();
    if (!ev) return;
    this.eventService.updateEvent(ev.id, { status }).pipe(this.destroy$()).subscribe({
      next: () => {
        // Revert to Draft → redirect to wizard
        if (status === EventStatus.DRAFT) {
          this.router.navigate(['/events', ev.id, 'setup'], { replaceUrl: true });
          return;
        }
        this.event.update((e) => e ? { ...e, status } : e);
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }
}
