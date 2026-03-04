import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ThemeService } from '../../../shared/theme.service';
import { setLanguage } from '../../../core/utils/language';

@Component({
  selector: 'app-admin-guide',
  templateUrl: './admin-guide.html',
  imports: [RouterLink, TranslocoPipe],
})
export class AdminGuide {
  protected themeService = inject(ThemeService);
  private transloco = inject(TranslocoService);

  currentYear = new Date().getFullYear();

  sections = [
    { id: 'dashboard', labelKey: 'DOCS_ADMIN.NAV_DASHBOARD' },
    { id: 'creating-events', labelKey: 'DOCS_ADMIN.NAV_CREATING_EVENTS' },
    { id: 'setup-wizard', labelKey: 'DOCS_ADMIN.NAV_SETUP_WIZARD' },
    { id: 'csv-import', labelKey: 'DOCS_ADMIN.NAV_CSV_IMPORT' },
    { id: 'groups-participants', labelKey: 'DOCS_ADMIN.NAV_GROUPS' },
    { id: 'evaluator-assignment', labelKey: 'DOCS_ADMIN.NAV_EVALUATOR_ASSIGNMENT' },
    { id: 'activities', labelKey: 'DOCS_ADMIN.NAV_ACTIVITIES' },
    { id: 'age-categories', labelKey: 'DOCS_ADMIN.NAV_AGE_CATEGORIES' },
    { id: 'leaderboard', labelKey: 'DOCS_ADMIN.NAV_LEADERBOARD' },
    { id: 'diploma-editor', labelKey: 'DOCS_ADMIN.NAV_DIPLOMA' },
    { id: 'user-management', labelKey: 'DOCS_ADMIN.NAV_USERS' },
  ];

  get activeLang(): string {
    return this.transloco.getActiveLang();
  }

  setLang(lang: string): void {
    setLanguage(this.transloco, lang);
  }
}
