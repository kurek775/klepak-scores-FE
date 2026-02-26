import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ThemeService } from '../../../shared/theme.service';

@Component({
  selector: 'app-evaluator-guide',
  templateUrl: './evaluator-guide.html',
  imports: [RouterLink, TranslocoPipe],
})
export class EvaluatorGuide {
  protected themeService = inject(ThemeService);
  private transloco = inject(TranslocoService);

  currentYear = new Date().getFullYear();

  sections = [
    { id: 'getting-started', labelKey: 'DOCS_EVAL.NAV_GETTING_STARTED' },
    { id: 'your-dashboard', labelKey: 'DOCS_EVAL.NAV_DASHBOARD' },
    { id: 'scoring', labelKey: 'DOCS_EVAL.NAV_SCORING' },
    { id: 'ai-scoring', labelKey: 'DOCS_EVAL.NAV_AI_SCORING' },
    { id: 'ai-review', labelKey: 'DOCS_EVAL.NAV_AI_REVIEW' },
    { id: 'offline', labelKey: 'DOCS_EVAL.NAV_OFFLINE' },
    { id: 'leaderboard', labelKey: 'DOCS_EVAL.NAV_LEADERBOARD' },
  ];

  get activeLang(): string {
    return this.transloco.getActiveLang();
  }

  setLang(lang: string): void {
    this.transloco.setActiveLang(lang);
    localStorage.setItem('lang', lang);
  }
}
