import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AuthService } from '../../auth/auth.service';
import { ArrowRightIconComponent } from '../../shared/arrow-right-icon.component';
import { ThemeService } from '../../shared/theme.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  imports: [RouterLink, TranslocoPipe, ArrowRightIconComponent],
})
export class Landing implements OnInit {
  currentYear = new Date().getFullYear();

  protected themeService = inject(ThemeService);
  private transloco = inject(TranslocoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  get activeLang(): string {
    return this.transloco.getActiveLang();
  }

  setLang(lang: string): void {
    this.transloco.setActiveLang(lang);
    localStorage.setItem('lang', lang);
  }
}
