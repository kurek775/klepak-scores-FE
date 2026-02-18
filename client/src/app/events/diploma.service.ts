import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { DiplomaTemplate } from '../core/models/diploma.model';
import { ToastService } from '../shared/toast.service';

@Injectable({ providedIn: 'root' })
export class DiplomaService {
  constructor(
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  getTemplate(eventId: number): Observable<DiplomaTemplate> {
    return this.http.get<DiplomaTemplate>(`${environment.apiUrl}/events/${eventId}/diploma`);
  }

  saveTemplate(eventId: number, body: Partial<DiplomaTemplate>, isNew: boolean): Observable<DiplomaTemplate> {
    if (isNew) {
      return this.http
        .post<DiplomaTemplate>(`${environment.apiUrl}/events/${eventId}/diploma`, body)
        .pipe(tap(() => this.toast.success('Diploma template saved')));
    } else {
      return this.http
        .put<DiplomaTemplate>(`${environment.apiUrl}/events/${eventId}/diploma`, body)
        .pipe(tap(() => this.toast.success('Diploma template updated')));
    }
  }

  deleteTemplate(eventId: number): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/events/${eventId}/diploma`)
      .pipe(tap(() => this.toast.success('Diploma template deleted')));
  }
}
