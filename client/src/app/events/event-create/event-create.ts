import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ArrowLeftIconComponent } from '../../shared/arrow-left-icon.component';
import { GroupInput, ImportSummary, ParticipantInput } from '../../core/models/event.model';
import { HasUnsavedChanges } from '../../core/guards/unsaved-changes.guard';
import { EventService } from '../event.service';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.html',
  imports: [FormsModule, RouterLink, TranslocoPipe, ArrowLeftIconComponent],
})
export class EventCreate implements HasUnsavedChanges {
  private destroy$ = untilDestroyed();

  eventName = '';
  groups = signal<GroupInput[]>([{ name: '', identifier: '', participants: [] }]);
  error = signal('');
  loading = signal(false);
  summary = signal<ImportSummary | null>(null);
  step = signal<1 | 2>(1);

  constructor(
    private eventService: EventService,
    private router: Router,
    private transloco: TranslocoService,
  ) {}

  hasUnsavedChanges(): boolean {
    if (this.summary()) return false;
    return this.eventName.trim().length > 0 || this.groups().some(g => g.name.trim().length > 0 || g.participants.length > 0);
  }

  addGroup(): void {
    this.groups.update((g) => [...g, { name: '', identifier: '', participants: [] }]);
  }

  removeGroup(index: number): void {
    this.groups.update((g) => g.filter((_, i) => i !== index));
  }

  addParticipant(groupIndex: number): void {
    this.groups.update((groups) =>
      groups.map((g, i) =>
        i === groupIndex
          ? { ...g, participants: [...g.participants, { display_name: '', gender: '', age: null }] }
          : g,
      ),
    );
  }

  removeParticipant(groupIndex: number, participantIndex: number): void {
    this.groups.update((groups) =>
      groups.map((g, i) =>
        i === groupIndex
          ? { ...g, participants: g.participants.filter((_, pi) => pi !== participantIndex) }
          : g,
      ),
    );
  }

  updateGroup(groupIndex: number, field: 'name' | 'identifier', value: string): void {
    this.groups.update((groups) =>
      groups.map((g, i) => (i === groupIndex ? { ...g, [field]: value } : g)),
    );
  }

  updateParticipant(
    groupIndex: number,
    participantIndex: number,
    field: keyof ParticipantInput,
    value: string | number | null,
  ): void {
    this.groups.update((groups) =>
      groups.map((g, gi) =>
        gi === groupIndex
          ? {
              ...g,
              participants: g.participants.map((p, pi) =>
                pi === participantIndex ? { ...p, [field]: value } : p,
              ),
            }
          : g,
      ),
    );
  }

  get isValid(): boolean {
    if (!this.eventName.trim()) return false;
    const groups = this.groups();
    if (groups.length === 0) return false;
    for (const g of groups) {
      if (!g.name.trim()) return false;
      for (const p of g.participants) {
        if (!p.display_name.trim()) return false;
      }
    }
    return true;
  }

  submit(): void {
    if (!this.isValid) return;
    this.error.set('');
    this.loading.set(true);

    const body = {
      name: this.eventName.trim(),
      groups: this.groups().map((g) => ({
        name: g.name.trim(),
        identifier: g.identifier.trim(),
        participants: g.participants.map((p) => ({
          display_name: p.display_name.trim(),
          external_id: p.external_id?.trim() || undefined,
          gender: p.gender?.trim() || undefined,
          age: p.age != null && p.age !== ('' as unknown as number) ? Number(p.age) : undefined,
        })),
      })),
    };

    this.eventService.createEventManual(body).pipe(this.destroy$()).subscribe({
      next: (result) => {
        this.summary.set(result);
        this.step.set(2);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail ?? this.transloco.translate('ERRORS.REQUEST_FAILED'));
      },
    });
  }

  viewEvent(): void {
    const s = this.summary();
    if (s) {
      this.router.navigate(['/events', s.event_id, 'setup']);
    }
  }
}
