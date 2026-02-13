import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { EventDetail, EventSummary, ImportSummary } from '../core/models/event.model';

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
}
