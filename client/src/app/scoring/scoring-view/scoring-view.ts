import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import imageCompression from 'browser-image-compression';

import { Activity, EvaluationType, ScoreRecord } from '../../core/models/activity.model';
import { Participant } from '../../core/models/event.model';
import { ScoringService } from '../scoring.service';
import { GroupService } from '../../events/group.service';
import { EventService } from '../../events/event.service';
import { AIResult, AiReviewModal } from '../ai-review-modal/ai-review-modal';
import { OfflineSyncService } from '../../core/services/offline-sync.service';
import { ToastService } from '../../shared/toast.service';

interface ScoreRow {
  participant: Participant;
  value: string | number;
  saved: boolean;
}

@Component({
  selector: 'app-scoring-view',
  templateUrl: './scoring-view.html',
  imports: [RouterLink, FormsModule, AiReviewModal, TranslocoPipe],
})
export class ScoringView implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private scoringService: ScoringService,
    private groupService: GroupService,
    private eventService: EventService,
    private offlineSync: OfflineSyncService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('eventId'));
    const activityId = Number(this.route.snapshot.paramMap.get('activityId'));
    this.loading.set(true);

    this.eventService.getEvent(this.eventId).subscribe({
      next: (event) => {
        const act = event.activities.find((a) => a.id === activityId);
        if (act) this.activity.set(act);
      },
    });

    this.groupService.getMyGroups().subscribe({
      next: (groups) => {
        const myGroup = groups.find((g) => g.event_id === this.eventId);
        if (!myGroup) {
          this.loading.set(false);
          return;
        }
        this.groupId = myGroup.id;

        this.eventService.getEvent(this.eventId).subscribe({
          next: (event) => {
            const groupDetail = event.groups.find((g) => g.id === myGroup.id);
            if (!groupDetail) {
              this.loading.set(false);
              return;
            }
            this.scoringService.getActivityRecords(activityId).subscribe({
              next: (records) => {
                const recordMap = new Map<number, ScoreRecord>();
                for (const r of records) {
                  recordMap.set(r.participant_id, r);
                }
                this.rows.set(
                  groupDetail.participants.map((p) => ({
                    participant: p,
                    value: recordMap.get(p.id)?.value_raw ?? '',
                    saved: recordMap.has(p.id),
                  })),
                );
                this.loading.set(false);
                this.refreshPendingCount(activityId);
              },
              error: () => this.loading.set(false),
            });
          },
          error: () => this.loading.set(false),
        });
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

    this.scoringService.processImage(formData).subscribe({
      next: (results) => {
        this.previewImageUrl.set(previewUrl);
        this.pendingAIResults.set(results);
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

  get isBoolean(): boolean {
    return this.activity()?.evaluation_type === EvaluationType.BOOLEAN;
  }

  get isNumeric(): boolean {
    const t = this.activity()?.evaluation_type;
    return t === EvaluationType.NUMERIC_HIGH || t === EvaluationType.NUMERIC_LOW;
  }

  saveAll(): void {
    const act = this.activity();
    if (!act) return;

    const entries = this.rows()
      .filter((r) => r.value !== '')
      .map((r) => ({
        participant_id: r.participant.id,
        value_raw: r.value,
      }));

    if (entries.length === 0) return;

    this.saving.set(true);
    this.scoringService
      .submitBulkRecords({ activity_id: act.id, records: entries })
      .subscribe({
        next: () => {
          this.rows.update((rows) =>
            rows.map((r) => (r.value !== '' ? { ...r, saved: true } : r)),
          );
          this.saving.set(false);
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
          this.toast.success('Saved offline');
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
    row.value = row.value === '1' || row.value === 1 ? '0' : '1';
    row.saved = false;
  }

  onValueChange(row: ScoreRow): void {
    row.saved = false;
  }
}
