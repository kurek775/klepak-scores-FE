import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { EventDetail } from '../../../core/models/event.model';
import { Activity, EvaluationType } from '../../../core/models/activity.model';
import { AgeCategory } from '../../../core/models/age-category.model';
import { EVALUATION_TYPES, getEvalTypeKey } from '../../../core/utils/evaluation-types';
import { EventService } from '../../event.service';
import { ScoringService } from '../../../scoring/scoring.service';
import { ToastService } from '../../../shared/toast.service';
import { untilDestroyed } from '../../../core/utils/destroy';

@Component({
  selector: 'app-setup-activities',
  templateUrl: './setup-activities.html',
  imports: [FormsModule, TranslocoPipe],
})
export class SetupActivities {
  event = input.required<EventDetail>();
  ageCategories = input.required<AgeCategory[]>();
  eventUpdated = output<EventDetail>();
  ageCategoriesUpdated = output<AgeCategory[]>();

  private destroy$ = untilDestroyed();

  savingActivity = signal(false);
  editingActivityId = signal<number | null>(null);
  editingActivityName = '';

  newActivityName = '';
  newActivityType: EvaluationType = EvaluationType.NUMERIC_HIGH;
  evaluationTypes = EVALUATION_TYPES;

  newCatName = '';
  newCatMinAge = 0;
  newCatMaxAge = 17;

  constructor(
    private eventService: EventService,
    private scoringService: ScoringService,
    private toast: ToastService,
    private transloco: TranslocoService,
  ) {}

  getEvalTypeKey = getEvalTypeKey;

  // -- Activity CRUD --
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
          this.eventUpdated.emit({ ...ev, activities: [...ev.activities, activity] });
          this.newActivityName = '';
          this.savingActivity.set(false);
          this.toast.success(this.transloco.translate('EVENTS.ACTIVITY_CREATED', { name: activity.name }));
        },
        error: () => this.savingActivity.set(false),
      });
  }

  deleteActivity(activityId: number): void {
    const ev = this.event();
    if (!ev) return;
    this.scoringService.deleteActivity(activityId).pipe(this.destroy$()).subscribe({
      next: () => {
        this.eventUpdated.emit({ ...ev, activities: ev.activities.filter(a => a.id !== activityId) });
        this.toast.success(this.transloco.translate('EVENTS.ACTIVITY_DELETED'));
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }

  startEditActivity(activity: Activity): void {
    this.editingActivityId.set(activity.id);
    this.editingActivityName = activity.name;
  }

  saveActivity(): void {
    const ev = this.event();
    const id = this.editingActivityId();
    if (!ev || !id || !this.editingActivityName.trim()) return;
    this.eventService.updateActivity(id, { name: this.editingActivityName.trim() }).pipe(this.destroy$()).subscribe({
      next: () => {
        this.eventUpdated.emit({
          ...ev,
          activities: ev.activities.map(a =>
            a.id === id ? { ...a, name: this.editingActivityName.trim() } : a,
          ),
        });
        this.editingActivityId.set(null);
        this.toast.success(this.transloco.translate('EVENTS.ACTIVITY_UPDATED'));
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }

  cancelEditActivity(): void {
    this.editingActivityId.set(null);
  }

  // -- Age Bracket CRUD --
  addAgeCategory(): void {
    const ev = this.event();
    if (!ev || !this.newCatName.trim()) return;
    this.eventService
      .createAgeCategory(ev.id, {
        name: this.newCatName.trim(),
        min_age: this.newCatMinAge,
        max_age: this.newCatMaxAge,
      })
      .pipe(this.destroy$())
      .subscribe({
        next: (cat) => {
          this.ageCategoriesUpdated.emit([...this.ageCategories(), cat]);
          this.newCatName = '';
          this.newCatMinAge = 0;
          this.newCatMaxAge = 17;
        },
        error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
      });
  }

  removeAgeCategory(categoryId: number): void {
    const ev = this.event();
    if (!ev) return;
    this.eventService.deleteAgeCategory(ev.id, categoryId).pipe(this.destroy$()).subscribe({
      next: () => {
        this.ageCategoriesUpdated.emit(this.ageCategories().filter(c => c.id !== categoryId));
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }
}
