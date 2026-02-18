import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe],
  standalone: true,
})
export class Navbar {
  isMobileMenuOpen = false;

  constructor(
    public authService: AuthService,
    private transloco: TranslocoService,
  ) {}

  logout(): void {
    this.authService.logout();
  }

  setLang(lang: string): void {
    this.transloco.setActiveLang(lang);
    localStorage.setItem('lang', lang);
  }

  get activeLang(): string {
    return this.transloco.getActiveLang();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
