import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ImportSummary } from '../../core/models/event.model';
import { EventService } from '../event.service';

@Component({
  selector: 'app-event-import',
  templateUrl: './event-import.html',
  imports: [FormsModule, RouterLink],
})
export class EventImport {
  eventName = '';
  selectedFile: File | null = null;
  error = signal('');
  loading = signal(false);
  summary = signal<ImportSummary | null>(null);

  constructor(
    private eventService: EventService,
    private router: Router,
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  onSubmit(): void {
    if (!this.selectedFile || !this.eventName.trim()) return;

    this.error.set('');
    this.loading.set(true);
    this.summary.set(null);

    this.eventService.importEvent(this.selectedFile, this.eventName.trim()).subscribe({
      next: (result) => {
        this.summary.set(result);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail ?? 'Import failed');
      },
    });
  }

  viewEvent(): void {
    const s = this.summary();
    if (s) {
      this.router.navigate(['/events', s.event_id]);
    }
  }
}
