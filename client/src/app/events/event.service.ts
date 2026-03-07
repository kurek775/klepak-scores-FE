import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { CsvPreviewResponse, EvaluatorInfo, EventDetail, EventSummary, GroupDetail, ImportSummary, ManualEventCreate, Participant } from '../core/models/event.model';
import { Activity } from '../core/models/activity.model';
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

  importEvent(file: File, eventName: string, columnMapping?: Record<string, string>): Observable<ImportSummary> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('event_name', eventName);
    if (columnMapping) {
      formData.append('column_mapping', JSON.stringify(columnMapping));
    }
    return this.http.post<ImportSummary>(`${environment.apiUrl}/events/import`, formData);
  }

  createEventManual(body: ManualEventCreate): Observable<ImportSummary> {
    return this.http.post<ImportSummary>(`${environment.apiUrl}/events/manual`, body);
  }

  previewCsv(file: File): Observable<CsvPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CsvPreviewResponse>(`${environment.apiUrl}/events/preview-csv`, formData);
  }

  updateEvent(id: number, body: { name?: string; status?: string }): Observable<EventSummary> {
    return this.http.patch<EventSummary>(`${environment.apiUrl}/events/${id}`, body);
  }

  createGroup(eventId: number, body: { name: string; identifier?: string }): Observable<GroupDetail> {
    return this.http.post<GroupDetail>(`${environment.apiUrl}/events/${eventId}/groups`, body);
  }

  updateGroup(groupId: number, body: { name?: string; identifier?: string }): Observable<GroupDetail> {
    return this.http.patch<GroupDetail>(`${environment.apiUrl}/groups/${groupId}`, body);
  }

  deleteGroup(groupId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/groups/${groupId}`);
  }

  addParticipant(groupId: number, body: { display_name: string; external_id?: string; gender?: string; age?: number }): Observable<Participant> {
    return this.http.post<Participant>(`${environment.apiUrl}/groups/${groupId}/participants`, body);
  }

  updateParticipant(participantId: number, body: { display_name?: string; external_id?: string; gender?: string; age?: number }): Observable<Participant> {
    return this.http.patch<Participant>(`${environment.apiUrl}/participants/${participantId}`, body);
  }

  deleteParticipant(participantId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/participants/${participantId}`);
  }

  moveParticipant(participantId: number, groupId: number): Observable<Participant> {
    return this.http.post<Participant>(`${environment.apiUrl}/participants/${participantId}/move`, { group_id: groupId });
  }

  updateActivity(activityId: number, body: { name?: string; description?: string }): Observable<Activity> {
    return this.http.patch<Activity>(`${environment.apiUrl}/activities/${activityId}`, body);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${id}`);
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
    return this.http.post<AgeCategory>(`${environment.apiUrl}/events/${eventId}/age-categories`, body);
  }

  deleteAgeCategory(eventId: number, categoryId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${eventId}/age-categories/${categoryId}`);
  }

  listEventEvaluators(eventId: number): Observable<EvaluatorInfo[]> {
    return this.http.get<EvaluatorInfo[]>(`${environment.apiUrl}/events/${eventId}/evaluators`);
  }

  assignEventEvaluator(eventId: number, userId: number): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${environment.apiUrl}/events/${eventId}/evaluators`, { user_id: userId });
  }

  removeEventEvaluator(eventId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${eventId}/evaluators/${userId}`);
  }

}
