import { TranslocoService } from '@jsverse/transloco';

export function setLanguage(transloco: TranslocoService, lang: string): void {
  transloco.setActiveLang(lang);
  localStorage.setItem('lang', lang);
}
