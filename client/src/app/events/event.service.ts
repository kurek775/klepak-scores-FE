import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { EventDetail, EventSummary, ImportSummary } from '../core/models/event.model';
import { AgeCategory, AgeCategoryCreate } from '../core/models/age-category.model';
import { LeaderboardResponse } from '../core/models/leaderboard.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private http: HttpClient) {}

  listEvents(): Observable<EventSummary[]> {
    return this.http.get<EventSummary[]>(`${environment.apiUrl}/events`);
  }

  getEvent(id: number): Observable<EventDetail> {
    return this.http.get<EventDetail>(`${environment.apiUrl}/events/${id}`);
  }

  importEvent(file: File, eventName: string): Observable<ImportSummary> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('event_name', eventName);
    return this.http.post<ImportSummary>(`${environment.apiUrl}/events/import`, formData);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${id}`);
  }

  getLeaderboard(eventId: number): Observable<LeaderboardResponse> {
    return this.http.get<LeaderboardResponse>(`${environment.apiUrl}/events/${eventId}/leaderboard`);
  }

  exportCsv(eventId: number): void {
    this.http
      .get(`${environment.apiUrl}/events/${eventId}/export-csv`, { responseType: 'blob' })
      .subscribe((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event_${eventId}_export.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  getAgeCategories(eventId: number): Observable<AgeCategory[]> {
    return this.http.get<AgeCategory[]>(`${environment.apiUrl}/events/${eventId}/age-categories`);
  }

  createAgeCategory(eventId: number, body: AgeCategoryCreate): Observable<AgeCategory> {
    return this.http.post<AgeCategory>(`${environment.apiUrl}/events/${eventId}/age-categories`, body);
  }

  deleteAgeCategory(eventId: number, categoryId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${eventId}/age-categories/${categoryId}`);
  }
}
