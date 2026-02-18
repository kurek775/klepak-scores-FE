import Dexie, { Table } from 'dexie';

export interface PendingRecord {
  id?: number;
  activityId: number;
  groupId: number;
  participantId: number;
  valueRaw: string | number;
  savedAt: Date;
}

export class OfflineScoresDb extends Dexie {
  pendingRecords!: Table<PendingRecord>;

  constructor() {
    super('klepakOffline');
    this.version(1).stores({
      pendingRecords: '++id, activityId, groupId',
    });
  }
}

export const offlineDb = new OfflineScoresDb();
