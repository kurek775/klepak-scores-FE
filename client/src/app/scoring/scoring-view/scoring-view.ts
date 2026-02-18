import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Activity, EvaluationType, ScoreRecord } from '../../core/models/activity.model';
import { Participant } from '../../core/models/event.model';
import { ScoringService } from '../scoring.service';
import { GroupService } from '../../events/group.service';
import { EventService } from '../../events/event.service';

interface ScoreRow {
  participant: Participant;
  value: string|number;
  saved: boolean;
}

@Component({
  selector: 'app-scoring-view',
  templateUrl: './scoring-view.html',
  imports: [RouterLink, FormsModule],
})
export class ScoringView implements OnInit {
  activity = signal<Activity | null>(null);
  rows = signal<ScoreRow[]>([]);
  loading = signal(false);
  saving = signal(false);
  eventId = 0;

  constructor(
    private route: ActivatedRoute,
    private scoringService: ScoringService,
    private groupService: GroupService,
    private eventService: EventService,
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('eventId'));
    const activityId = Number(this.route.snapshot.paramMap.get('activityId'));
    this.loading.set(true);

    // Load activity info from event details
    this.eventService.getEvent(this.eventId).subscribe({
      next: (event) => {
        const act = event.activities.find((a) => a.id === activityId);
        if (act) this.activity.set(act);
      },
    });

    // Load evaluator's group participants for this event
    this.groupService.getMyGroups().subscribe({
      next: (groups) => {
        const myGroup = groups.find((g) => g.event_id === this.eventId);
        if (!myGroup) {
          this.loading.set(false);
          return;
        }
        // Get full group detail with participants
        this.eventService.getEvent(this.eventId).subscribe({
          next: (event) => {
            const groupDetail = event.groups.find((g) => g.id === myGroup.id);
            if (!groupDetail) {
              this.loading.set(false);
              return;
            }
            // Load existing records
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
        error: () => this.saving.set(false),
      });
  }

  toggleBoolean(row: ScoreRow): void {
    row.value = row.value === '1' ? '0' : '1';
    row.saved = false;
  }

  onValueChange(row: ScoreRow): void {
    row.saved = false;
  }
}
