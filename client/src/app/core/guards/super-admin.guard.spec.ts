import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { vi, beforeEach, afterEach } from 'vitest';
import { Observable } from 'rxjs';

import { superAdminGuard } from './super-admin.guard';
import { AuthService } from '../../auth/auth.service';

@Component({ template: '' })
class DummyComponent {}

describe('superAdminGuard', () => {
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
          { path: 'super-admin', component: DummyComponent, canActivate: [superAdminGuard] },
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

  it('allows super admin access when session is restored', () => {
    vi.spyOn(authService, 'isSessionRestored').mockReturnValue(true);
    vi.spyOn(authService, 'isSuperAdmin').mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects to /dashboard for non-super-admin when session is restored', () => {
    vi.spyOn(authService, 'isSessionRestored').mockReturnValue(true);
    vi.spyOn(authService, 'isSuperAdmin').mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });

  it('returns Observable when session is not yet restored', () => {
    vi.spyOn(authService, 'isSessionRestored').mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
    expect(result).toBeInstanceOf(Observable);
  });
});
