import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { User, UserRole } from '../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  listUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/admin/users`);
  }

  updateUser(userId: number, body: { role?: UserRole; is_active?: boolean }): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/admin/users/${userId}`, body);
  }
}
