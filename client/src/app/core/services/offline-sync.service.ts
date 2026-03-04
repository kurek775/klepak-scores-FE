import { Injectable, OnDestroy } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { offlineDb, PendingRecord } from './offline-scores.db';
import { ScoringService } from '../../scoring/scoring.service';

@Injectable({ providedIn: 'root' })
export class OfflineSyncService implements OnDestroy {
  private onlineHandler: (() => void) | null = null;
  private scoringServiceRef: ScoringService | null = null;
  private lastActivityId: number | null = null;

  /** Call once from a component to enable auto-sync when the browser comes back online. */
  enableAutoSync(scoringService: ScoringService, activityId: number): void {
    this.scoringServiceRef = scoringService;
    this.lastActivityId = activityId;

    if (!this.onlineHandler) {
      this.onlineHandler = () => this.onOnline();
      window.addEventListener('online', this.onlineHandler);
    }
  }

  ngOnDestroy(): void {
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
      this.onlineHandler = null;
    }
  }

  private async onOnline(): Promise<void> {
    if (this.scoringServiceRef && this.lastActivityId !== null) {
      await this.syncAll(this.scoringServiceRef, this.lastActivityId);
    }
  }

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
      value_raw: String(r.valueRaw),
    }));

    await firstValueFrom(
      scoringService.submitBulkRecords({ activity_id: activityId, records: entries }),
    );
    await this.clearActivity(activityId);
    return pending.length;
  }
}
