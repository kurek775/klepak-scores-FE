import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../auth.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
})
export class Login implements OnInit {
  form!: FormGroup;
  error = signal('');
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.error.set('');
    this.loading.set(true);

    const { email, password } = this.form.value;
    this.authService.login({ email, password }).subscribe({
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
