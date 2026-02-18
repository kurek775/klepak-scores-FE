import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { offlineDb, PendingRecord } from './offline-scores.db';
import { ScoringService } from '../../scoring/scoring.service';

@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  async saveRecord(record: PendingRecord): Promise<void> {
    await offlineDb.pendingRecords.add(record);
  }

  async getPendingCountForActivity(activityId: number): Promise<number> {
    return offlineDb.pendingRecords
      .where('activityId')
      .equals(activityId)
      .count();
  }

  async getPendingForActivity(activityId: number): Promise<PendingRecord[]> {
    return offlineDb.pendingRecords
      .where('activityId')
      .equals(activityId)
      .toArray();
  }

  async clearActivity(activityId: number): Promise<void> {
    await offlineDb.pendingRecords
      .where('activityId')
      .equals(activityId)
      .delete();
  }

  async syncAll(scoringService: ScoringService, activityId: number): Promise<number> {
    const pending = await this.getPendingForActivity(activityId);
    if (pending.length === 0) return 0;

    const entries = pending.map((r) => ({
      participant_id: r.participantId,
      value_raw: r.valueRaw,
    }));

    await firstValueFrom(
      scoringService.submitBulkRecords({ activity_id: activityId, records: entries }),
    );
    await this.clearActivity(activityId);
    return pending.length;
  }
}
