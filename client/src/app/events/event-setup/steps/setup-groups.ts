import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { EventDetail, GroupDetail, Participant } from '../../../core/models/event.model';
import { EventService } from '../../event.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog.service';
import { ToastService } from '../../../shared/toast.service';
import { untilDestroyed } from '../../../core/utils/destroy';

@Component({
  selector: 'app-setup-groups',
  templateUrl: './setup-groups.html',
  imports: [FormsModule, TranslocoPipe],
})
export class SetupGroups {
  event = input.required<EventDetail>();
  eventUpdated = output<EventDetail>();

  private destroy$ = untilDestroyed();

  expandedGroups = signal<Set<number>>(new Set());
  editingGroupId = signal<number | null>(null);
  editingGroupName = signal('');
  addParticipantGroupId = signal<number | null>(null);
  newParticipantName = signal('');
  showAddGroup = signal(false);
  newGroupName = signal('');

  constructor(
    private eventService: EventService,
    private confirmDialog: ConfirmDialogService,
    private toast: ToastService,
    private transloco: TranslocoService,
  ) {}

  toggleGroup(groupId: number): void {
    this.expandedGroups.update(set => {
      const next = new Set(set);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
    });
  }

  isExpanded(groupId: number): boolean {
    return this.expandedGroups().has(groupId);
  }

  // -- Group CRUD --
  addGroup(): void {
    const ev = this.event();
    if (!ev || !this.newGroupName().trim()) return;
    this.eventService.createGroup(ev.id, { name: this.newGroupName().trim() }).pipe(this.destroy$()).subscribe({
      next: (group) => {
        this.emitUpdate({ ...ev, groups: [...ev.groups, group] });
        this.newGroupName.set('');
        this.showAddGroup.set(false);
        this.toast.success(this.transloco.translate('EVENTS.GROUP_ADDED'));
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }

  startEditGroup(group: GroupDetail): void {
    this.editingGroupId.set(group.id);
    this.editingGroupName.set(group.name);
  }

  saveGroup(): void {
    const ev = this.event();
    const id = this.editingGroupId();
    if (!ev || !id || !this.editingGroupName().trim()) return;
    this.eventService.updateGroup(id, { name: this.editingGroupName().trim() }).pipe(this.destroy$()).subscribe({
      next: () => {
        this.emitUpdate({
          ...ev,
          groups: ev.groups.map(g => g.id === id ? { ...g, name: this.editingGroupName().trim() } : g),
        });
        this.editingGroupId.set(null);
        this.toast.success(this.transloco.translate('EVENTS.GROUP_UPDATED'));
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }

  cancelEditGroup(): void {
    this.editingGroupId.set(null);
  }

  async deleteGroup(group: GroupDetail): Promise<void> {
    const ev = this.event();
    if (!ev) return;
    const confirmed = await this.confirmDialog.confirm({
      title: this.transloco.translate('COMMON.CONFIRM_TITLE'),
      message: this.transloco.translate('EVENTS.CONFIRM_DELETE_GROUP', { name: group.name }),
    });
    if (!confirmed) return;
    this.eventService.deleteGroup(group.id).pipe(this.destroy$()).subscribe({
      next: () => {
        this.emitUpdate({ ...ev, groups: ev.groups.filter(g => g.id !== group.id) });
        this.toast.success(this.transloco.translate('EVENTS.GROUP_DELETED'));
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }

  // -- Participant CRUD --
  showAddParticipant(groupId: number): void {
    this.addParticipantGroupId.set(groupId);
    this.newParticipantName.set('');
  }

  addParticipant(groupId: number): void {
    const ev = this.event();
    if (!ev || !this.newParticipantName().trim()) return;
    this.eventService.addParticipant(groupId, { display_name: this.newParticipantName().trim() }).pipe(this.destroy$()).subscribe({
      next: (participant) => {
        this.emitUpdate({
          ...ev,
          groups: ev.groups.map(g =>
            g.id === groupId ? { ...g, participants: [...g.participants, participant] } : g,
          ),
        });
        this.newParticipantName.set('');
        this.addParticipantGroupId.set(null);
        this.toast.success(this.transloco.translate('EVENTS.PARTICIPANT_ADDED'));
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }

  async deleteParticipant(groupId: number, participant: Participant): Promise<void> {
    const ev = this.event();
    if (!ev) return;
    const confirmed = await this.confirmDialog.confirm({
      title: this.transloco.translate('COMMON.CONFIRM_TITLE'),
      message: this.transloco.translate('EVENTS.CONFIRM_DELETE_PARTICIPANT', { name: participant.display_name }),
    });
    if (!confirmed) return;
    this.eventService.deleteParticipant(participant.id).pipe(this.destroy$()).subscribe({
      next: () => {
        this.emitUpdate({
          ...ev,
          groups: ev.groups.map(g =>
            g.id === groupId ? { ...g, participants: g.participants.filter(p => p.id !== participant.id) } : g,
          ),
        });
        this.toast.success(this.transloco.translate('EVENTS.PARTICIPANT_DELETED'));
      },
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }

  private emitUpdate(event: EventDetail): void {
    this.eventUpdated.emit(event);
  }
}
