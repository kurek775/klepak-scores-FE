import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AuthService } from '../auth.service';
import { passwordValidators } from '../../core/validators/password.validator';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
})
export class ResetPassword implements OnInit {
  form: FormGroup;
  token = '';
  loading = signal(false);
  success = signal(false);
  error = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  private destroy$ = untilDestroyed();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private transloco: TranslocoService,
  ) {
    this.form = this.fb.group({
      new_password: ['', passwordValidators],
      confirm_password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.error.set(this.transloco.translate('AUTH.MISSING_RESET_TOKEN'));
    }
  }

  get passwordMismatch(): boolean {
    return this.form.value.new_password !== this.form.value.confirm_password;
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordMismatch || !this.token) return;
    this.error.set('');
    this.loading.set(true);

    this.authService
      .resetPassword(this.token, this.form.value.new_password)
      .pipe(this.destroy$())
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.detail ?? this.transloco.translate('ERRORS.REQUEST_FAILED'));
        },
      });
  }
}
