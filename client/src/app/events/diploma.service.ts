import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { DiplomaTemplate } from '../core/models/diploma.model';
import { ToastService } from '../shared/toast.service';
import { SKIP_ERROR_TOAST } from '../core/http-context';

@Injectable({ providedIn: 'root' })
export class DiplomaService {
  constructor(
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  getTemplates(eventId: number): Observable<DiplomaTemplate[]> {
    return this.http.get<DiplomaTemplate[]>(
      `${environment.apiUrl}/events/${eventId}/diplomas`,
      { context: new HttpContext().set(SKIP_ERROR_TOAST, true) },
    );
  }

  createTemplate(eventId: number, body: Partial<DiplomaTemplate>): Observable<DiplomaTemplate> {
    return this.http
      .post<DiplomaTemplate>(`${environment.apiUrl}/events/${eventId}/diplomas`, body)
      .pipe(tap(() => this.toast.success('Diploma template saved')));
  }

  updateTemplate(eventId: number, templateId: number, body: Partial<DiplomaTemplate>): Observable<DiplomaTemplate> {
    return this.http
      .put<DiplomaTemplate>(`${environment.apiUrl}/events/${eventId}/diplomas/${templateId}`, body)
      .pipe(tap(() => this.toast.success('Diploma template updated')));
  }

  deleteTemplate(eventId: number, templateId: number): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/events/${eventId}/diplomas/${templateId}`)
      .pipe(tap(() => this.toast.success('Diploma template deleted')));
  }
}
