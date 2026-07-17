import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { jsPDF } from 'jspdf';

import { DiplomaItem, DiplomaTemplate } from '../core/models/diploma.model';
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
        // Dense ranking within the category: equal scores share a place and a
        // tie does NOT skip the next place (10,10,9,9,8,7 -> 1,1,2,2,3,4). Print
        // a diploma for everyone whose dense place is 1, 2 or 3 (ties can make
        // that more than three people). The backend uses competition ranking
        // (1,1,3,…), so we derive the dense place from its distinct ranks here.
        const uniqueRanks = [...new Set(cat.participants.map(p => p.rank))].sort((a, b) => a - b);
        const placeOf = new Map(uniqueRanks.map((r, i) => [r, i + 1]));
        const medalists = cat.participants.filter(p => (placeOf.get(p.rank) ?? Infinity) <= 3);
        for (const participant of medalists) {
          const place = placeOf.get(participant.rank) ?? 0;
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
                case 'place':           text = `${place}.`; break;
                case 'activity':        text = activity.activity_name; break;
                case 'category':
                  text = this.formatCategory(item, cat.gender, cat.age_category_name);
                  break;
                default: text = '';
              }
            }
            // Match the editor preview's box model exactly. The preview renders
            // each item in a line-height:1 box whose em-box is vertically
            // centered at (boxTop + 0.5em); horizontal centering pins the text's
            // advance-width midpoint. jsPDF's 'top' baseline instead anchors the
            // font's ascent top (above the em-box), which pushes text too high —
            // so we anchor by the em-box middle ('middle'), which jsPDF and CSS
            // agree on, and offset by half an em for top-anchored items:
            //   centerV=false → preview box top at y%  → em-box middle at y%+0.5em
            //   centerV=true  → preview centers on y%  → em-box middle at y%
            const PT_TO_MM = 25.4 / 72;
            const halfEmMm = 0.5 * item.fontSize * PT_TO_MM;
            const yBaseline = item.centerV ? yMm : yMm + halfEmMm;

            doc.text(text, xMm, yBaseline, {
              align:    item.centerH ? 'center' : 'left',
              baseline: 'middle',
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

  /**
   * Render a category item using its optional per-template overrides. Falls back
   * to the translated gender labels and the "{gender} · {category}" layout so
   * templates saved before this feature keep rendering exactly as before.
   */
  private formatCategory(item: DiplomaItem, gender: string, categoryName: string): string {
    const male = item.genderMale?.trim() || this.transloco.translate('LEADERBOARD.MEN');
    const female = item.genderFemale?.trim() || this.transloco.translate('LEADERBOARD.WOMEN');
    const g = gender === 'M' ? male : gender === 'F' ? female : gender;
    const fmt = item.categoryFormat?.trim() || '{gender} · {category}';
    return fmt.split('{gender}').join(g).split('{category}').join(categoryName);
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
