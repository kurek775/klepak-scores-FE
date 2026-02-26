import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { InvitationRead } from '../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  constructor(private http: HttpClient) {}

  invite(email: string, role?: string): Observable<InvitationRead> {
    const body: { email: string; role?: string } = { email };
    if (role) body.role = role;
    return this.http.post<InvitationRead>(`${environment.apiUrl}/admin/invitations`, body);
  }

  list(): Observable<InvitationRead[]> {
    return this.http.get<InvitationRead[]>(`${environment.apiUrl}/admin/invitations`);
  }

  revoke(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/invitations/${id}`);
  }
}
