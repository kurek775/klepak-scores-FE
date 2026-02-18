import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
  UserRole,
} from '../core/models/user.model';

const TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<User | null>(null);

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly isAdmin = computed(() => this.userSignal()?.role === UserRole.ADMIN);
  readonly id = computed(() => this.userSignal()?.id);
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(body: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${environment.apiUrl}/auth/login`, body).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.access_token);
      }),
    );
  }

  register(body: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, body);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.userSignal.set(null);
    this.router.navigateByUrl('/login');
  }

  tryRestoreSession(): void {
    if (!this.token) return;
    this.http.get<User>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (user) => this.userSignal.set(user),
      error: () => this.logout(),
    });
  }

  fetchMe(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => this.userSignal.set(user)),
    );
  }
}
