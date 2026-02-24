import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { environment } from '../../../environments/environment';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
})
export class ForgotPassword {
  private destroy$ = untilDestroyed();

  form: FormGroup;
  loading = signal(false);
  sent = signal(false);
  error = signal('');

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private transloco: TranslocoService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.error.set('');
    this.loading.set(true);

    this.http
      .post(`${environment.apiUrl}/auth/forgot-password`, { email: this.form.value.email })
      .pipe(this.destroy$())
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.sent.set(true);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.detail ?? this.transloco.translate('ERRORS.REQUEST_FAILED'));
        },
      });
  }
}
