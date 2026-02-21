import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

import { AuthService } from './auth/auth.service';
import { Navbar } from './shared/layout/navbar/navbar';
import { ToastComponent } from './shared/toast.component';
import { ThemeService } from './shared/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [RouterOutlet, Navbar, ToastComponent],
})
export class App implements OnInit {
  constructor(
    public authService: AuthService,
    private transloco: TranslocoService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.themeService.init();
    this.authService.tryRestoreSession();
    const saved = localStorage.getItem('lang');
    if (saved) {
      this.transloco.setActiveLang(saved);
    }
  }

  setLang(lang: string): void {
    this.transloco.setActiveLang(lang);
    localStorage.setItem('lang', lang);
  }
}
