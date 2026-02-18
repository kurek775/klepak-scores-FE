import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../auth.service';
import { TranslocoPipe } from '@jsverse/transloco';

const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
})
export class Register implements OnInit {
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
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(passwordPattern)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.error.set('');
    this.loading.set(true);

    const { fullName, email, password } = this.form.value;
    this.authService
      .register({ full_name: fullName, email, password })
      .subscribe({
        next: () => {
          this.authService.login({ email, password }).subscribe({
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
