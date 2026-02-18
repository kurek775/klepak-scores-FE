import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Activity, ScoreRecord } from '../core/models/activity.model';
import { ToastService } from '../shared/toast.service';

@Injectable({ providedIn: 'root' })
export class ScoringService {
  constructor(
    private http: HttpClient,
    private toast: ToastService,
  ) { }

  createActivity(body: {
    name: string;
    description?: string | null;
    evaluation_type: string;
    event_id: number;
  }): Observable<Activity> {
    return this.http.post<Activity>(`${environment.apiUrl}/activities`, body);
  }

  processImage(formData: FormData): Observable<{ participant_id: number; value: string | number; name: string }[]> {
    return this.http.post<{ participant_id: number; value: string | number; name: string }[]>(
      `${environment.apiUrl}/records/process-image`,
      formData
    );
  }

  getEventActivities(eventId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${environment.apiUrl}/events/${eventId}/activities`);
  }

  deleteActivity(activityId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/activities/${activityId}`);
  }

  submitRecord(body: {
    value_raw: string | number;
    participant_id: number;
    activity_id: number;
  }): Observable<ScoreRecord> {
    return this.http.post<ScoreRecord>(`${environment.apiUrl}/records`, body).pipe(
      tap(() => this.toast.success('Record saved')),
    );
  }

  submitBulkRecords(body: {
    activity_id: number;
    records: { participant_id: number; value_raw: string | number }[];
  }): Observable<ScoreRecord[]> {
    return this.http.post<ScoreRecord[]>(`${environment.apiUrl}/records/bulk`, body).pipe(
      tap((records) => this.toast.success(`${records.length} records saved`)),
    );
  }

  getActivityRecords(activityId: number): Observable<ScoreRecord[]> {
    return this.http.get<ScoreRecord[]>(
      `${environment.apiUrl}/activities/${activityId}/records`,
    );
  }
}
