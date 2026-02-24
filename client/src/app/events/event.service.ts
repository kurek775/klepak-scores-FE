import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { CsvPreviewResponse, EventDetail, EventSummary, EvaluatorInfo, ImportSummary, ManualEventCreate, MoveEvaluatorsRequest } from '../core/models/event.model';
import { AgeCategory, AgeCategoryCreate } from '../core/models/age-category.model';
import { LeaderboardResponse } from '../core/models/leaderboard.model';
import { ToastService } from '../shared/toast.service';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  listEvents(): Observable<EventSummary[]> {
    return this.http.get<EventSummary[]>(`${environment.apiUrl}/events`);
  }

  getEvent(id: number): Observable<EventDetail> {
    return this.http.get<EventDetail>(`${environment.apiUrl}/events/${id}`);
  }

  importEvent(file: File, eventName: string, columnMapping?: Record<string, string>): Observable<ImportSummary> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('event_name', eventName);
    if (columnMapping) {
      formData.append('column_mapping', JSON.stringify(columnMapping));
    }
    return this.http.post<ImportSummary>(`${environment.apiUrl}/events/import`, formData).pipe(
      tap((res) => this.toast.success(`Event imported: ${res.groups_created} groups, ${res.participants_created} participants`)),
    );
  }

  createEventManual(body: ManualEventCreate): Observable<ImportSummary> {
    return this.http.post<ImportSummary>(`${environment.apiUrl}/events/manual`, body).pipe(
      tap((res) => this.toast.success(`Event created: ${res.groups_created} groups, ${res.participants_created} participants`)),
    );
  }

  previewCsv(file: File): Observable<CsvPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CsvPreviewResponse>(`${environment.apiUrl}/events/preview-csv`, formData);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${id}`).pipe(
      tap(() => this.toast.success('Event deleted')),
    );
  }

  getLeaderboard(eventId: number): Observable<LeaderboardResponse> {
    return this.http.get<LeaderboardResponse>(`${environment.apiUrl}/events/${eventId}/leaderboard`);
  }

  exportCsv(eventId: number): Observable<Blob> {
    return this.http
      .get(`${environment.apiUrl}/events/${eventId}/export-csv`, { responseType: 'blob' })
      .pipe(
        tap((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `event_${eventId}_export.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }),
      );
  }

  getAgeCategories(eventId: number): Observable<AgeCategory[]> {
    return this.http.get<AgeCategory[]>(`${environment.apiUrl}/events/${eventId}/age-categories`);
  }

  createAgeCategory(eventId: number, body: AgeCategoryCreate): Observable<AgeCategory> {
    return this.http.post<AgeCategory>(`${environment.apiUrl}/events/${eventId}/age-categories`, body).pipe(
      tap(() => this.toast.success('Age category added')),
    );
  }

  deleteAgeCategory(eventId: number, categoryId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${eventId}/age-categories/${categoryId}`).pipe(
      tap(() => this.toast.success('Age category removed')),
    );
  }

  // Event evaluator pool
  listEventEvaluators(eventId: number): Observable<EvaluatorInfo[]> {
    return this.http.get<EvaluatorInfo[]>(`${environment.apiUrl}/events/${eventId}/evaluators`);
  }

  assignEventEvaluator(eventId: number, userId: number): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/events/${eventId}/evaluators`, { user_id: userId });
  }

  removeEventEvaluator(eventId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${eventId}/evaluators/${userId}`);
  }

  moveEvaluators(eventId: number, body: MoveEvaluatorsRequest): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/events/${eventId}/evaluators/move`, body);
  }
}
