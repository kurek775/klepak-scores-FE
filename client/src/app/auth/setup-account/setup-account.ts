import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../auth.service';
import { PASSWORD_PATTERN } from '../../core/validators/password.validator';
import { untilDestroyed } from '../../core/utils/destroy';

@Component({
  selector: 'app-setup-account',
  templateUrl: './setup-account.html',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
})
export class SetupAccount implements OnInit {
  form!: FormGroup;
  token = '';
  email = signal('');
  role = signal('');
  loading = signal(false);
  validating = signal(true);
  error = signal('');
  tokenInvalid = signal(false);

  private destroy$ = untilDestroyed();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
      confirmPassword: ['', Validators.required],
    });

    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.validating.set(false);
      this.tokenInvalid.set(true);
      this.error.set('Missing invitation token.');
      return;
    }

    this.authService.validateInvitation(this.token).pipe(this.destroy$()).subscribe({
      next: (res) => {
        this.email.set(res.email);
        this.role.set(res.role);
        this.validating.set(false);
      },
      error: (err) => {
        this.validating.set(false);
        this.tokenInvalid.set(true);
        this.error.set(err.error?.detail ?? 'Invalid or expired invitation token.');
      },
    });
  }

  get passwordMismatch(): boolean {
    return this.form.value.password !== this.form.value.confirmPassword;
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordMismatch || !this.token) return;
    this.error.set('');
    this.loading.set(true);

    this.authService
      .acceptInvitation({
        token: this.token,
        full_name: this.form.value.fullName,
        password: this.form.value.password,
      })
      .pipe(
        switchMap(() => this.authService.fetchMe()),
        this.destroy$(),
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/dashboard'),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.detail ?? 'Account setup failed.');
        },
      });
  }
}
