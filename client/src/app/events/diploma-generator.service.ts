import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { jsPDF } from 'jspdf';

import { DiplomaTemplate } from '../core/models/diploma.model';
import { LeaderboardResponse } from '../core/models/leaderboard.model';

@Injectable({ providedIn: 'root' })
export class DiplomaGeneratorService {
  constructor(private transloco: TranslocoService) {}

  async generatePdf(
    templates: DiplomaTemplate[],
    leaderboard: LeaderboardResponse,
    eventId: number,
  ): Promise<void> {
    // Pre-resolve all background images
    const bgCache = new Map<string, string | null>();
    for (const tpl of templates) {
      if (tpl.bg_image_url && !bgCache.has(tpl.bg_image_url)) {
        bgCache.set(tpl.bg_image_url, await this.resolveImageToBase64(tpl.bg_image_url));
      }
    }

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

    for (const activity of leaderboard.activities) {
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
            doc.setFont(resolvedFont, 'normal');

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

    doc.save(`diplomas_event_${eventId}.pdf`);
  }

  private genderLabel(g: string): string {
    if (g === 'M') return this.transloco.translate('LEADERBOARD.MEN');
    if (g === 'F') return this.transloco.translate('LEADERBOARD.WOMEN');
    return g;
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
}
