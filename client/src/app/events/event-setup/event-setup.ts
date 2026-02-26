import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { EventDetail, EventStatus } from '../../core/models/event.model';
import { AgeCategory } from '../../core/models/age-category.model';
import { ArrowLeftIconComponent } from '../../shared/arrow-left-icon.component';
import { EventService } from '../event.service';
import { ToastService } from '../../shared/toast.service';
import { untilDestroyed } from '../../core/utils/destroy';
import { SetupGroups } from './steps/setup-groups';
import { SetupActivities } from './steps/setup-activities';
import { SetupEvaluators } from './steps/setup-evaluators';
import { SetupReview } from './steps/setup-review';

@Component({
  selector: 'app-event-setup',
  templateUrl: './event-setup.html',
  imports: [
    RouterLink,
    TranslocoPipe,
    ArrowLeftIconComponent,
    SetupGroups,
    SetupActivities,
    SetupEvaluators,
    SetupReview,
  ],
})
export class EventSetup implements OnInit {
  event = signal<EventDetail | null>(null);
  ageCategories = signal<AgeCategory[]>([]);
  loading = signal(false);
  currentStep = signal<1 | 2 | 3 | 4>(1);
  visitedSteps = signal<Set<number>>(new Set([1]));

  private destroy$ = untilDestroyed();

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private transloco: TranslocoService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.eventService.getEvent(id).pipe(this.destroy$()).subscribe({
      next: (event) => {
        if (event.status !== EventStatus.DRAFT) {
          this.router.navigate(['/events', event.id], { replaceUrl: true });
          return;
        }
        this.event.set(event);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.eventService.getAgeCategories(id).pipe(this.destroy$()).subscribe({
      next: (cats) => this.ageCategories.set(cats),
    });
  }

  goToStep(step: 1 | 2 | 3 | 4): void {
    if (this.visitedSteps().has(step) || step <= this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  nextStep(): void {
    const current = this.currentStep();
    if (current < 4) {
      const next = (current + 1) as 1 | 2 | 3 | 4;
      this.currentStep.set(next);
      this.visitedSteps.update(s => {
        const n = new Set(s);
        n.add(next);
        return n;
      });
    }
  }

  prevStep(): void {
    const current = this.currentStep();
    if (current > 1) {
      this.currentStep.set((current - 1) as 1 | 2 | 3 | 4);
    }
  }

  isStepAccessible(step: number): boolean {
    return this.visitedSteps().has(step) || step <= this.currentStep();
  }

  onEventUpdated(event: EventDetail): void {
    this.event.set(event);
  }

  onAgeCategoriesUpdated(cats: AgeCategory[]): void {
    this.ageCategories.set(cats);
  }

  activateEvent(): void {
    const ev = this.event();
    if (!ev) return;
    this.eventService.updateEvent(ev.id, { status: EventStatus.ACTIVE }).pipe(this.destroy$()).subscribe({
      next: () => {
        this.toast.success(this.transloco.translate('SETUP.ACTIVATED_SUCCESS'));
        this.router.navigate(['/events', ev.id]);
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }
}
