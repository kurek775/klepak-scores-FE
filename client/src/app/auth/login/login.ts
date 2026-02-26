import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { AuthService } from '../auth.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
})
export class Login implements OnInit {
  form!: FormGroup;
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);

  private destroy$ = untilDestroyed();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private transloco: TranslocoService,
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
    this.authService
      .login({ email, password })
      .pipe(
        switchMap(() => this.authService.fetchMe()),
        this.destroy$(),
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/dashboard'),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.detail ?? this.transloco.translate('ERRORS.INVALID_CREDENTIALS'));
        },
      });
  }
}
