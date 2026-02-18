import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { vi, beforeEach, afterEach } from 'vitest';

import { authGuard } from '../core/guards/auth.guard';
import { AuthService } from './auth.service';

@Component({ template: '', standalone: true })
class DummyComponent {}

describe('authGuard', () => {
  let router: Router;
  let authService: AuthService;

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideRouter([
          { path: 'protected', component: DummyComponent, canActivate: [authGuard] },
          { path: 'login', component: DummyComponent },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns true when token is present', () => {
    vi.spyOn(authService, 'token', 'get').mockReturnValue('valid-token');
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('returns a UrlTree redirecting to /login when token is absent', () => {
    vi.spyOn(authService, 'token', 'get').mockReturnValue(null);
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
