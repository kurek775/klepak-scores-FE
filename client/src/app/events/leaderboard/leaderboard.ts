import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { jsPDF } from 'jspdf';

import { LeaderboardResponse } from '../../core/models/leaderboard.model';
import { DiplomaTemplate } from '../../core/models/diploma.model';
import { DiplomaService } from '../diploma.service';
import { EventService } from '../event.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.html',
  imports: [RouterLink, TranslocoPipe],
})
export class Leaderboard implements OnInit {
  leaderboard        = signal<LeaderboardResponse | null>(null);
  loading            = signal(true);
  expandedActivities = signal<Set<number>>(new Set());
  diplomaTemplates   = signal<DiplomaTemplate[]>([]);
  generatingPdf      = signal(false);
  eventId            = 0;

  constructor(
    private route:    ActivatedRoute,
    private eventService: EventService,
    private diplomaService: DiplomaService,
    private transloco: TranslocoService,
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));

    this.eventService.getLeaderboard(this.eventId).subscribe({
      next: (data) => {
        this.leaderboard.set(data);
        this.expandedActivities.set(new Set(data.activities.map(a => a.activity_id)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.diplomaService.getTemplates(this.eventId).subscribe({
      next: (templates) => this.diplomaTemplates.set(templates),
      error: () => {},
    });
  }

  toggleActivity(activityId: number): void {
    this.expandedActivities.update(set => {
      const next = new Set(set);
      next.has(activityId) ? next.delete(activityId) : next.add(activityId);
      return next;
    });
  }

  isExpanded(activityId: number): boolean {
    return this.expandedActivities().has(activityId);
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

  private resolveImageToBase64(url: string): Promise<string> {
    if (url.startsWith('data:')) return Promise.resolve(url);
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(r => r.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload  = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  }

  async downloadAllDiplomas(): Promise<void> {
    const templates = this.diplomaTemplates();
    const lb        = this.leaderboard();
    if (templates.length === 0 || !lb) return;

    this.generatingPdf.set(true);
    try {
      // Pre-resolve all background images
      const bgCache = new Map<string, string | null>();
      for (const tpl of templates) {
        if (tpl.bg_image_url && !bgCache.has(tpl.bg_image_url)) {
          bgCache.set(tpl.bg_image_url, await this.resolveImageToBase64(tpl.bg_image_url));
        }
      }

      // Use orientation of first template to initialise the document
      const firstTpl = templates[0];
      const isFirstLandscape = firstTpl.orientation === 'LANDSCAPE';

      const doc = new jsPDF({
        orientation: isFirstLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const robotoData = await this.resolveImageToBase64('/fonts/Roboto-Regular.ttf');
      doc.addFileToVFS('Roboto-Regular.ttf', robotoData.split(',')[1]);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

      // Register all custom fonts across all templates
      const registeredFonts = new Set<string>();
      for (const tpl of templates) {
        if (tpl.fonts) {
          for (const font of tpl.fonts) {
            if (!registeredFonts.has(font.name)) {
              const base64 = font.data.split(',')[1];
              const fileName = `${font.name}.ttf`;
              doc.addFileToVFS(fileName, base64);
              doc.addFont(fileName, font.name, 'normal');
              registeredFonts.add(font.name);
            }
          }
        }
      }

      let participantIndex = 0;
      let firstPage = true;

      for (const activity of lb.activities) {
        for (const cat of activity.categories) {
          for (const participant of cat.participants) {
            const tpl = templates[participantIndex % templates.length];
            participantIndex++;

            const isLandscape = tpl.orientation === 'LANDSCAPE';
            const pageW = isLandscape ? 297 : 210;
            const pageH = isLandscape ? 210 : 297;

            if (!firstPage) {
              doc.addPage('a4', isLandscape ? 'landscape' : 'portrait');
            }
            firstPage = false;

            const bgBase64 = tpl.bg_image_url ? (bgCache.get(tpl.bg_image_url) ?? null) : null;
            if (bgBase64) {
              const fmt = bgBase64.includes('data:image/png') ? 'PNG' : 'JPEG';
              doc.addImage(bgBase64, fmt, 0, 0, pageW, pageH);
            }

            for (const item of tpl.items) {
              const xMm = (item.x / 100) * pageW;
              const yMm = (item.y / 100) * pageH;

              doc.setFontSize(item.fontSize);
              doc.setTextColor(item.color);

              const itemFont = item.fontFamily && item.fontFamily !== 'default'
                ? item.fontFamily : null;
              const resolvedFont = itemFont ?? tpl.default_font ?? 'Roboto';

              if (resolvedFont === 'Roboto') {
                doc.setFont('Roboto', 'normal');
              } else {
                doc.setFont(resolvedFont, 'normal');
              }

              let text = '';
              if (item.type === 'STATIC') {
                text = item.text ?? '';
              } else {
                switch (item.key) {
                  case 'participant_name': text = participant.display_name; break;
                  case 'place':           text = `${participant.rank}.`; break;
                  case 'activity':        text = activity.activity_name; break;
                  case 'category':
                    text = `${this.genderLabel(cat.gender)} · ${cat.age_category_name}`;
                    break;
                  default: text = '';
                }
              }
              doc.text(text, xMm, yMm, {
                align:    item.centerH ? 'center' : 'left',
                baseline: item.centerV ? 'middle'  : 'alphabetic',
              });
            }
          }
        }
      }

      doc.save(`diplomas_event_${this.eventId}.pdf`);
    } finally {
      this.generatingPdf.set(false);
    }
  }
}
