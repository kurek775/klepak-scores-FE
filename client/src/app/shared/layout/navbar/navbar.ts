import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../auth/auth.service';
import { ThemeService } from '../../theme.service';
import { setLanguage } from '../../../core/utils/language';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe],
})
export class Navbar {
  isMobileMenuOpen = signal(false);

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private transloco: TranslocoService,
  ) {}

  logout(): void {
    this.authService.logout();
  }

  setLang(lang: string): void {
    setLanguage(this.transloco, lang);
  }

  get activeLang(): string {
    return this.transloco.getActiveLang();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
