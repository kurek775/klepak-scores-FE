import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { EvaluatorInfo, MyGroup } from '../core/models/event.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  constructor(private http: HttpClient) {}

  assignEvaluator(groupId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/groups/${groupId}/evaluators`, {
      user_id: userId,
    });
  }

  removeEvaluator(groupId: number, userId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/groups/${groupId}/evaluators/${userId}`,
    );
  }

  getGroupEvaluators(groupId: number): Observable<EvaluatorInfo[]> {
    return this.http.get<EvaluatorInfo[]>(
      `${environment.apiUrl}/groups/${groupId}/evaluators`,
    );
  }

  getMyGroups(): Observable<MyGroup[]> {
    return this.http.get<MyGroup[]>(`${environment.apiUrl}/groups/my-groups`);
  }
}
