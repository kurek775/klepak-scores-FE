import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi, beforeEach, afterEach } from 'vitest';

import { authInterceptor } from '../core/interceptors/auth.interceptor';
import { AuthService } from './auth.service';
import { ToastService } from '../shared/toast.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let toastService: ToastService;

  beforeEach(() => {
    // Provide a minimal localStorage so Angular services can initialise
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    toastService = TestBed.inject(ToastService);
  });

  afterEach(() => {
    httpMock.verify();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('attaches Authorization header when token is present', () => {
    vi.spyOn(authService, 'token', 'get').mockReturnValue('my-jwt');
    http.get('/api/test').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt');
    req.flush({});
  });

  it('does not attach Authorization header when no token', () => {
    vi.spyOn(authService, 'token', 'get').mockReturnValue(null);
    http.get('/api/test').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('calls authService.logout() on 401 response', () => {
    vi.spyOn(authService, 'token', 'get').mockReturnValue('expired-token');
    const logoutSpy = vi.spyOn(authService, 'logout').mockImplementation(() => {});
    http.get('/api/protected').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/api/protected');
    req.flush({ detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('calls toastService.error() on 500 response', () => {
    vi.spyOn(authService, 'token', 'get').mockReturnValue(null);
    const errorSpy = vi.spyOn(toastService, 'error');
    http.get('/api/broken').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/api/broken');
    req.flush({ detail: 'Internal Server Error' }, { status: 500, statusText: 'Server Error' });
    expect(errorSpy).toHaveBeenCalledWith('Internal Server Error');
  });

  it('calls toastService.error() with fallback message when no detail', () => {
    vi.spyOn(authService, 'token', 'get').mockReturnValue(null);
    const errorSpy = vi.spyOn(toastService, 'error');
    http.get('/api/broken').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/api/broken');
    req.flush({}, { status: 500, statusText: 'Server Error' });
    expect(errorSpy).toHaveBeenCalledWith('Request failed');
  });

  it('does NOT call toastService.error() on 401 (logout handles it)', () => {
    vi.spyOn(authService, 'token', 'get').mockReturnValue('expired');
    const errorSpy = vi.spyOn(toastService, 'error');
    vi.spyOn(authService, 'logout').mockImplementation(() => {});
    http.get('/api/auth').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/api/auth');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
