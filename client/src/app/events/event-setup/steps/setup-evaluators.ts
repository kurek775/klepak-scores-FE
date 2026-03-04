import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { EvaluatorInfo, EventDetail } from '../../../core/models/event.model';
import { GroupService } from '../../group.service';
import { ToastService } from '../../../shared/toast.service';
import { untilDestroyed } from '../../../core/utils/destroy';

@Component({
  selector: 'app-setup-evaluators',
  templateUrl: './setup-evaluators.html',
  imports: [RouterLink, TranslocoPipe, CdkDropList, CdkDrag],
})
export class SetupEvaluators {
  event = input.required<EventDetail>();
  eventUpdated = output<EventDetail>();

  private destroy$ = untilDestroyed();

  constructor(
    private groupService: GroupService,
    private toast: ToastService,
    private transloco: TranslocoService,
  ) {}

  unassignedPoolEvaluators = computed(() => {
    const ev = this.event();
    if (!ev) return [];
    const assignedIds = new Set(ev.groups.flatMap(g => g.evaluators.map(e => e.id)));
    return ev.event_evaluators.filter(e => !assignedIds.has(e.id));
  });

  groupDropListIds = computed(() => {
    const ev = this.event();
    if (!ev) return [];
    return ev.groups.map(g => `group-${g.id}`);
  });

  onDrop(event: CdkDragDrop<{ listId: string }>): void {
    const evaluator: EvaluatorInfo = event.item.data;
    const sourceId = event.previousContainer.data.listId;
    const targetId = event.container.data.listId;

    if (sourceId === targetId) return;

    const sourceGroupId = sourceId.startsWith('group-') ? Number(sourceId.replace('group-', '')) : null;
    const targetGroupId = targetId.startsWith('group-') ? Number(targetId.replace('group-', '')) : null;

    if (sourceId === 'pool' && targetGroupId !== null) {
      this.assignToGroup(targetGroupId, evaluator);
    } else if (sourceGroupId !== null && targetId === 'pool') {
      this.removeFromGroup(sourceGroupId, evaluator.id);
    } else if (sourceGroupId !== null && targetGroupId !== null) {
      this.moveEvaluatorBetweenGroups(sourceGroupId, targetGroupId, evaluator);
    }
  }

  private assignToGroup(groupId: number, evaluator: EvaluatorInfo): void {
    this.groupService.assignEvaluator(groupId, evaluator.id).pipe(this.destroy$()).subscribe({
      next: () => {
        const ev = this.event();
        this.eventUpdated.emit({
          ...ev,
          groups: ev.groups.map(g =>
            g.id === groupId ? { ...g, evaluators: [...g.evaluators, evaluator] } : g,
          ),
        });
        this.toast.success(this.transloco.translate('EVENTS.EVALUATOR_ASSIGNED', { name: evaluator.full_name }));
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }

  private moveEvaluatorBetweenGroups(fromGroupId: number, toGroupId: number, evaluator: EvaluatorInfo): void {
    this.groupService.removeEvaluator(fromGroupId, evaluator.id).pipe(this.destroy$()).subscribe({
      next: () => {
        const ev = this.event();
        this.eventUpdated.emit({
          ...ev,
          groups: ev.groups.map(g =>
            g.id === fromGroupId ? { ...g, evaluators: g.evaluators.filter(e => e.id !== evaluator.id) } : g,
          ),
        });
        this.assignToGroup(toGroupId, evaluator);
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }

  removeFromGroup(groupId: number, userId: number): void {
    this.groupService.removeEvaluator(groupId, userId).pipe(this.destroy$()).subscribe({
      next: () => {
        const ev = this.event();
        this.eventUpdated.emit({
          ...ev,
          groups: ev.groups.map(g =>
            g.id === groupId ? { ...g, evaluators: g.evaluators.filter(e => e.id !== userId) } : g,
          ),
        });
        this.toast.success(this.transloco.translate('EVENTS.EVALUATOR_REMOVED'));
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }
}
