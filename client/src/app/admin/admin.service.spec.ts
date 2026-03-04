import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AdminService } from './admin.service';
import { environment } from '../../environments/environment';
import { UserRole } from '../core/models/user.model';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('listUsers() calls GET /admin/users', () => {
    const mockUsers = [{ id: 1, email: 'admin@test.com', full_name: 'Admin', role: UserRole.ADMIN, is_active: true }];
    service.listUsers().subscribe((users) => {
      expect(users.length).toBe(1);
      expect(users[0].email).toBe('admin@test.com');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('updateUser() calls PATCH /admin/users/{id}', () => {
    const updated = { id: 2, email: 'eval@test.com', full_name: 'Eval', role: UserRole.ADMIN, is_active: true };
    service.updateUser(2, { role: UserRole.ADMIN }).subscribe((user) => {
      expect(user.role).toBe(UserRole.ADMIN);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/2`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ role: UserRole.ADMIN });
    req.flush(updated);
  });

  it('updateUser() can toggle is_active', () => {
    service.updateUser(3, { is_active: false }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/3`);
    expect(req.request.body).toEqual({ is_active: false });
    req.flush({ id: 3, is_active: false });
  });
});
