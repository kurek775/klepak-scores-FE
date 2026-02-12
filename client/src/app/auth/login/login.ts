import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [FormsModule, RouterLink],
})
export class Login {
  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    this.error.set('');
    this.loading.set(true);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.authService.fetchMe().subscribe({
          next: () => this.router.navigateByUrl('/dashboard'),
          error: () => {
            this.loading.set(false);
            this.error.set('Failed to load user profile');
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail ?? 'Login failed');
      },
    });
  }
}
