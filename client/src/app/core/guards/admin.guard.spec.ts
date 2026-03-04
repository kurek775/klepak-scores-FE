import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { vi, beforeEach, afterEach } from 'vitest';
import { Observable } from 'rxjs';

import { adminGuard } from './admin.guard';
import { AuthService } from '../../auth/auth.service';

@Component({ template: '' })
class DummyComponent {}

describe('adminGuard', () => {
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
          { path: 'admin', component: DummyComponent, canActivate: [adminGuard] },
          { path: 'dashboard', component: DummyComponent },
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

  it('allows admin access when session is restored', () => {
    vi.spyOn(authService, 'isSessionRestored').mockReturnValue(true);
    vi.spyOn(authService, 'isAdmin').mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects to /dashboard for non-admin when session is restored', () => {
    vi.spyOn(authService, 'isSessionRestored').mockReturnValue(true);
    vi.spyOn(authService, 'isAdmin').mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });

  it('returns Observable when session is not yet restored', () => {
    vi.spyOn(authService, 'isSessionRestored').mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBeInstanceOf(Observable);
  });
});
