import { Component, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ArrowLeftIconComponent } from '../../shared/arrow-left-icon.component';
import { CsvPreviewResponse, ImportSummary } from '../../core/models/event.model';
import { EventService } from '../event.service';
import { untilDestroyed } from '../../core/utils/destroy';

const SYSTEM_FIELDS = [
  { value: '', label: 'IMPORT.UNMAPPED' },
  { value: 'display_name', label: 'IMPORT.FIELD_DISPLAY_NAME' },
  { value: 'group_name', label: 'IMPORT.FIELD_GROUP_NAME' },
  { value: 'group_identifier', label: 'IMPORT.FIELD_GROUP_IDENTIFIER' },
  { value: 'external_id', label: 'IMPORT.FIELD_EXTERNAL_ID' },
  { value: 'gender', label: 'IMPORT.FIELD_GENDER' },
  { value: 'age', label: 'IMPORT.FIELD_AGE' },
];

@Component({
  selector: 'app-event-import',
  templateUrl: './event-import.html',
  imports: [FormsModule, RouterLink, TranslocoPipe, SlicePipe, ArrowLeftIconComponent],
})
export class EventImport {
  private destroy$ = untilDestroyed();

  eventName = '';
  selectedFile: File | null = null;
  error = signal('');
  loading = signal(false);
  summary = signal<ImportSummary | null>(null);

  // CSV preview state
  step = signal<1 | 2 | 3>(1);
  preview = signal<CsvPreviewResponse | null>(null);
  columnMapping = signal<Record<string, string>>({});
  systemFields = SYSTEM_FIELDS;

  constructor(
    private eventService: EventService,
    private router: Router,
    private transloco: TranslocoService,
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  previewCsv(): void {
    if (!this.selectedFile || !this.eventName.trim()) return;
    this.error.set('');
    this.loading.set(true);

    this.eventService.previewCsv(this.selectedFile).pipe(this.destroy$()).subscribe({
      next: (result) => {
        this.preview.set(result);
        // Auto-map: if a CSV header matches a system field name (case-insensitive), pre-select it
        const mapping: Record<string, string> = {};
        const systemFieldValues = SYSTEM_FIELDS.map((f) => f.value).filter(Boolean);
        for (const header of result.headers) {
          const normalized = header.trim().toLowerCase();
          const match = systemFieldValues.find((f) => f === normalized);
          if (match) {
            mapping[header] = match;
          }
        }
        this.columnMapping.set(mapping);
        this.step.set(2);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail ?? this.transloco.translate('ERRORS.REQUEST_FAILED'));
      },
    });
  }

  setMapping(csvHeader: string, systemField: string): void {
    this.columnMapping.update((m) => {
      const next = { ...m };
      if (systemField) {
        next[csvHeader] = systemField;
      } else {
        delete next[csvHeader];
      }
      return next;
    });
  }

  getMappedField(csvHeader: string): string {
    return this.columnMapping()[csvHeader] ?? '';
  }

  isFieldUsed(fieldValue: string, currentHeader: string): boolean {
    if (!fieldValue) return false;
    const mapping = this.columnMapping();
    return Object.entries(mapping).some(
      ([header, value]) => value === fieldValue && header !== currentHeader,
    );
  }

  get mappingValid(): boolean {
    const values = Object.values(this.columnMapping());
    return values.includes('display_name') && values.includes('group_name');
  }

  confirmImport(): void {
    if (!this.selectedFile || !this.eventName.trim()) return;
    this.error.set('');
    this.loading.set(true);

    const mapping = this.columnMapping();
    const hasMapping = Object.keys(mapping).length > 0;

    this.eventService
      .importEvent(this.selectedFile, this.eventName.trim(), hasMapping ? mapping : undefined)
      .pipe(this.destroy$())
      .subscribe({
        next: (result) => {
          this.summary.set(result);
          this.step.set(3);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.detail ?? this.transloco.translate('ERRORS.REQUEST_FAILED'));
        },
      });
  }

  backToUpload(): void {
    this.step.set(1);
    this.preview.set(null);
    this.error.set('');
  }

  viewEvent(): void {
    const s = this.summary();
    if (s) {
      this.router.navigate(['/events', s.event_id, 'setup']);
    }
  }
}
