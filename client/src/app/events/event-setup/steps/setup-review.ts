import { Component, computed, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { EventDetail } from '../../../core/models/event.model';
import { AgeCategory } from '../../../core/models/age-category.model';
import { EvaluationType } from '../../../core/models/activity.model';
import { EVALUATION_TYPES, getEvalTypeKey } from '../../../core/utils/evaluation-types';

@Component({
  selector: 'app-setup-review',
  templateUrl: './setup-review.html',
  imports: [TranslocoPipe],
})
export class SetupReview {
  event = input.required<EventDetail>();
  ageCategories = input.required<AgeCategory[]>();
  activate = output<void>();

  evaluationTypes = EVALUATION_TYPES;

  hasNoGroups = computed(() => this.event().groups.length === 0);
  hasNoActivities = computed(() => this.event().activities.length === 0);
  hasBlockingErrors = computed(() => this.hasNoGroups() || this.hasNoActivities());

  emptyPoolWarning = computed(() => this.event().event_evaluators.length === 0);
  groupsWithoutEvaluators = computed(() =>
    this.event().groups.filter(g => g.evaluators.length === 0),
  );
  groupsWithoutParticipants = computed(() =>
    this.event().groups.filter(g => g.participants.length === 0),
  );

  getEvalTypeKey = getEvalTypeKey;
}
