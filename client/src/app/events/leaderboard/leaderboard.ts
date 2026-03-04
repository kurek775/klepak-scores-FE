import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ArrowLeftIconComponent } from '../../shared/arrow-left-icon.component';
import { LeaderboardResponse } from '../../core/models/leaderboard.model';
import { DiplomaTemplate } from '../../core/models/diploma.model';
import { DiplomaService } from '../diploma.service';
import { DiplomaGeneratorService } from '../diploma-generator.service';
import { EventService } from '../event.service';
import { ToastService } from '../../shared/toast.service';
import { createExpandable } from '../../core/utils/expandable';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.html',
  imports: [RouterLink, TranslocoPipe, ArrowLeftIconComponent],
})
export class Leaderboard implements OnInit {
  leaderboard        = signal<LeaderboardResponse | null>(null);
  loading            = signal(true);
  activities         = createExpandable<number>();
  diplomaTemplates   = signal<DiplomaTemplate[]>([]);
  generatingPdf      = signal(false);
  eventId            = 0;

  private destroy$ = untilDestroyed();

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private diplomaService: DiplomaService,
    private diplomaGenerator: DiplomaGeneratorService,
    private toast: ToastService,
    private transloco: TranslocoService,
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));

    this.eventService.getLeaderboard(this.eventId).pipe(this.destroy$()).subscribe({
      next: (data) => {
        this.leaderboard.set(data);
        this.activities.expandAll(data.activities.map(a => a.activity_id));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED'));
      },
    });

    this.diplomaService.getTemplates(this.eventId).pipe(this.destroy$()).subscribe({
      next: (templates) => this.diplomaTemplates.set(templates),
      error: () => this.toast.error(this.transloco.translate('ERRORS.REQUEST_FAILED')),
    });
  }

  toggleActivity(activityId: number): void {
    this.activities.toggle(activityId);
  }

  isExpanded(activityId: number): boolean {
    return this.activities.isExpanded(activityId);
  }

  genderLabel(g: string): string {
    if (g === 'M') return this.transloco.translate('LEADERBOARD.MEN');
    if (g === 'F') return this.transloco.translate('LEADERBOARD.WOMEN');
    return g;
  }

  formatValue(val: string, evalType: string): string {
    return evalType === 'BOOLEAN' ? (val === '1' ? '✓' : '✗') : val;
  }

  rankMedal(rank: number): string {
    return { 1: '🥇', 2: '🥈', 3: '🥉' }[rank] ?? String(rank);
  }

  async downloadAllDiplomas(): Promise<void> {
    const templates = this.diplomaTemplates();
    const lb = this.leaderboard();
    if (templates.length === 0 || !lb) return;

    this.generatingPdf.set(true);
    try {
      await this.diplomaGenerator.generatePdf(templates, lb, this.eventId);
    } finally {
      this.generatingPdf.set(false);
    }
  }
}
