import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../auth.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { PASSWORD_PATTERN } from '../../core/validators/password.validator';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
})
export class Register implements OnInit {
  form!: FormGroup;
  error = signal('');
  loading = signal(false);
  pendingApproval = signal(false);

  private destroy$ = untilDestroyed();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.error.set('');
    this.loading.set(true);

    const { fullName, email, password } = this.form.value;
    this.authService
      .register({ full_name: fullName, email, password })
      .pipe(this.destroy$())
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.pendingApproval.set(true);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.detail ?? 'Registration failed');
        },
      });
  }
}
