import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { EMPTY, forkJoin, switchMap, map } from 'rxjs';
import imageCompression from 'browser-image-compression';

import { ArrowLeftIconComponent } from '../../shared/arrow-left-icon.component';
import { HasUnsavedChanges } from '../../core/guards/unsaved-changes.guard';
import { Activity, EvaluationType, ScoreRecord } from '../../core/models/activity.model';
import { GroupDetail, Participant } from '../../core/models/event.model';
import { ScoringService } from '../scoring.service';
import { GroupService } from '../../events/group.service';
import { EventService } from '../../events/event.service';
import { AIResult, AiReviewModal } from '../ai-review-modal/ai-review-modal';
import { OfflineSyncService } from '../../core/services/offline-sync.service';
import { ToastService } from '../../shared/toast.service';
import { untilDestroyed } from '../../core/utils/destroy';
import { formatSeconds, formatTimeValue, parseTimeToSeconds } from '../../core/utils/time-format';

interface ScoreRow {
  participant: Participant;
  value: string | number;
  saved: boolean;
}

@Component({
  selector: 'app-scoring-view',
  templateUrl: './scoring-view.html',
  imports: [RouterLink, FormsModule, AiReviewModal, TranslocoPipe, ArrowLeftIconComponent],
})
export class ScoringView implements OnInit, HasUnsavedChanges {
  activity = signal<Activity | null>(null);
  rows = signal<ScoreRow[]>([]);
  loading = signal(false);
  saving = signal(false);
  processingAI = signal(false);
  showReviewModal = signal(false);
  pendingAIResults = signal<AIResult[]>([]);
  previewImageUrl = signal<string>('');
  pendingCount = signal(0);
  eventId = 0;
  groupId = 0;

  private destroy$ = untilDestroyed();

  constructor(
    private route: ActivatedRoute,
    private scoringService: ScoringService,
    private groupService: GroupService,
    private eventService: EventService,
    private offlineSync: OfflineSyncService,
    private toast: ToastService,
    private transloco: TranslocoService,
  ) {}

  hasUnsavedChanges(): boolean {
    return this.rows().some(r => r.value && !r.saved);
  }

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('eventId'));
    const activityId = Number(this.route.snapshot.paramMap.get('activityId'));
    this.loading.set(true);

    forkJoin({
      event: this.eventService.getEvent(this.eventId),
      groups: this.groupService.getMyGroups(),
    })
      .pipe(
        switchMap(({ event, groups }) => {
          const act = event.activities.find((a) => a.id === activityId);
          if (act) this.activity.set(act);

          const myGroup = groups.find((g) => g.event_id === this.eventId);
          if (!myGroup) {
            this.loading.set(false);
            return EMPTY;
          }
          this.groupId = myGroup.id;

          const groupDetail = event.groups.find((g) => g.id === myGroup.id);
          if (!groupDetail) {
            this.loading.set(false);
            return EMPTY;
          }

          return this.scoringService.getActivityRecords(activityId).pipe(
            map((records) => ({ groupDetail, records })),
          );
        }),
        this.destroy$(),
      )
      .subscribe({
        next: (result) => {
          const { groupDetail, records } = result as { groupDetail: GroupDetail; records: ScoreRecord[] };
          const recordMap = new Map<number, ScoreRecord>();
          for (const r of records) {
            recordMap.set(r.participant_id, r);
          }
          const isTime = this.activity()?.evaluation_type === EvaluationType.TIME_LOW;
          this.rows.set(
            groupDetail.participants.map((p: Participant) => {
              const raw = recordMap.get(p.id)?.value_raw ?? '';
              return {
                participant: p,
                value: isTime && raw !== '' ? formatTimeValue(raw) : raw,
                saved: recordMap.has(p.id),
              };
            }),
          );
          this.loading.set(false);
          this.refreshPendingCount(activityId);
          this.offlineSync.enableAutoSync(this.scoringService, activityId);
        },
        error: () => this.loading.set(false),
      });
  }

  private async refreshPendingCount(activityId: number): Promise<void> {
    const count = await this.offlineSync.getPendingCountForActivity(activityId);
    this.pendingCount.set(count);
  }

  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const act = this.activity();
    if (!act || !this.groupId) return;

    this.processingAI.set(true);

    const previewUrl = URL.createObjectURL(file);

    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    });

    const formData = new FormData();
    formData.append('file', compressed, file.name);
    formData.append('activity_id', act.id.toString());
    formData.append('group_id', this.groupId.toString());

    this.scoringService
      .processImage(formData)
      .pipe(this.destroy$())
      .subscribe({
        next: (results) => {
          const prepared = this.isTime()
            ? results.map((r) => {
                const secs = parseTimeToSeconds(r.value as string);
                return { ...r, value: secs !== null ? formatSeconds(secs) : String(r.value) };
              })
            : results;
          this.previewImageUrl.set(previewUrl);
          this.pendingAIResults.set(prepared);
          this.showReviewModal.set(true);
          this.processingAI.set(false);
          input.value = '';
        },
        error: () => {
          URL.revokeObjectURL(previewUrl);
          this.processingAI.set(false);
          input.value = '';
        },
      });
  }

  onAIConfirm(results: AIResult[]): void {
    this.rows.update((currentRows) =>
      currentRows.map((row) => {
        const match = results.find((r) => r.participant_id === row.participant.id);
        if (match) {
          return { ...row, value: match.value, saved: false };
        }
        return row;
      }),
    );
    this.closeReviewModal();
  }

  onAIDiscard(): void {
    this.closeReviewModal();
  }

  private closeReviewModal(): void {
    this.showReviewModal.set(false);
    this.pendingAIResults.set([]);
    URL.revokeObjectURL(this.previewImageUrl());
    this.previewImageUrl.set('');
  }

  isBoolean = computed(() => this.activity()?.evaluation_type === EvaluationType.BOOLEAN);

  isNumeric = computed(() => {
    const t = this.activity()?.evaluation_type;
    return t === EvaluationType.NUMERIC_HIGH || t === EvaluationType.NUMERIC_LOW;
  });

  isTime = computed(() => this.activity()?.evaluation_type === EvaluationType.TIME_LOW);

  saveAll(): void {
    const act = this.activity();
    if (!act) return;

    const isTime = this.isTime();
    const entries: { participant_id: number; value_raw: string }[] = [];
    const savedIds = new Set<number>();
    let invalidTimes = 0;

    for (const r of this.rows()) {
      if (r.value === '' || r.value === null || r.value === undefined) continue;
      let valueRaw: string;
      if (isTime) {
        const secs = parseTimeToSeconds(r.value as string);
        if (secs === null) {
          invalidTimes++;
          continue;
        }
        valueRaw = String(secs);
      } else {
        valueRaw = String(r.value);
      }
      entries.push({ participant_id: r.participant.id, value_raw: valueRaw });
      savedIds.add(r.participant.id);
    }

    if (invalidTimes > 0) {
      this.toast.error(this.transloco.translate('SCORING.INVALID_TIME', { count: invalidTimes }));
    }
    if (entries.length === 0) return;

    this.saving.set(true);
    this.scoringService
      .submitBulkRecords({ activity_id: act.id, records: entries })
      .pipe(this.destroy$())
      .subscribe({
        next: (records) => {
          this.rows.update((rows) =>
            rows.map((r) => (savedIds.has(r.participant.id) ? { ...r, saved: true } : r)),
          );
          this.saving.set(false);
          this.toast.success(this.transloco.translate('SCORING.RECORDS_SAVED', { count: records.length }));
        },
        error: async () => {
          for (const e of entries) {
            await this.offlineSync.saveRecord({
              activityId: act.id,
              groupId: this.groupId,
              participantId: e.participant_id,
              valueRaw: e.value_raw,
              savedAt: new Date(),
            });
          }
          this.saving.set(false);
          await this.refreshPendingCount(act.id);
          this.toast.success(this.transloco.translate('SCORING.OFFLINE_SAVE_OK'));
        },
      });
  }

  async syncNow(): Promise<void> {
    const act = this.activity();
    if (!act) return;
    const count = await this.offlineSync.syncAll(this.scoringService, act.id);
    if (count > 0) {
      this.rows.update((rows) => rows.map((r) => (r.value !== '' ? { ...r, saved: true } : r)));
      await this.refreshPendingCount(act.id);
    }
  }

  toggleBoolean(row: ScoreRow): void {
    const newValue = row.value === '1' || row.value === 1 ? '0' : '1';
    this.rows.update(rows =>
      rows.map(r => r.participant.id === row.participant.id ? { ...r, value: newValue, saved: false } : r),
    );
  }

  onValueChange(row: ScoreRow): void {
    this.rows.update(rows =>
      rows.map(r => r.participant.id === row.participant.id ? { ...r, saved: false } : r),
    );
  }
}
