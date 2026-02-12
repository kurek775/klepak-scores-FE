import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  imports: [FormsModule, RouterLink],
})
export class Register {
  fullName = '';
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

    this.authService
      .register({ full_name: this.fullName, email: this.email, password: this.password })
      .subscribe({
        next: () => {
          // Auto-login after registration
          this.authService.login({ email: this.email, password: this.password }).subscribe({
            next: () => {
              this.authService.fetchMe().subscribe({
                next: () => this.router.navigateByUrl('/dashboard'),
                error: () => {
                  this.loading.set(false);
                  this.error.set('Registration succeeded but auto-login failed');
                },
              });
            },
            error: () => {
              this.loading.set(false);
              this.error.set('Registration succeeded but auto-login failed');
            },
          });
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.detail ?? 'Registration failed');
        },
      });
  }
}
