import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi, beforeEach, afterEach } from 'vitest';

import { AuthService } from './auth.service';
import { User, UserRole } from '../core/models/user.model';
import { environment } from '../../environments/environment';

const mockUser: User = {
  id: 1,
  email: 'admin@test.com',
  full_name: 'Admin',
  role: UserRole.ADMIN,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
};

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    get length() { return store.size; },
    key: (index: number) => [...store.keys()][index] ?? null,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login() stores token in localStorage and token getter returns it', () => {
    service.login({ email: 'admin@test.com', password: 'pass' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ access_token: 'test-token', token_type: 'bearer' });
    expect(service.token).toBe('test-token');
  });

  it('logout() clears localStorage and resets user signal', () => {
    localStorageMock.setItem('access_token', 'some-token');
    service.logout();
    expect(service.token).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('isAdmin() returns true only for ADMIN role', () => {
    expect(service.isAdmin()).toBe(false);

    service.fetchMe().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
    req.flush(mockUser);
    expect(service.isAdmin()).toBe(true);
  });

  it('isAdmin() returns false for EVALUATOR role', () => {
    service.fetchMe().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
    req.flush({ ...mockUser, role: UserRole.EVALUATOR });
    expect(service.isAdmin()).toBe(false);
  });

  it('isAuthenticated() is true after fetchMe succeeds', () => {
    service.fetchMe().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
    req.flush(mockUser);
    expect(service.isAuthenticated()).toBe(true);
  });
});
