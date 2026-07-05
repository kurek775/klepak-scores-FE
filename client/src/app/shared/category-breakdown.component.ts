import { Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { GroupDetail } from '../core/models/event.model';
import { AgeCategory } from '../core/models/age-category.model';

interface Bucket {
  key: string;
  name: string;
  range: string | null;
  min: number;
  max: number;
  unassigned: boolean;
  count: number;
  male: number;
  female: number;
}

/**
 * Shows which participants fall into which age category, mirroring the
 * leaderboard's rule (min_age <= age <= max_age). Participants with a blank or
 * out-of-range age land in an "unassigned" bucket.
 */
@Component({
  selector: 'app-category-breakdown',
  standalone: true,
  imports: [TranslocoPipe],
  template: `
    <div>
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
        {{ 'CATEGORIES.TITLE' | transloco }}
      </h3>

      @if (ageCategories().length === 0) {
        <p class="text-sm text-gray-400 dark:text-gray-500 italic">{{ 'CATEGORIES.NONE_DEFINED' | transloco }}</p>
      } @else {
        <div class="rounded-2xl border border-gray-200 dark:border-white/[0.06] divide-y divide-gray-100 dark:divide-white/[0.06] overflow-hidden">
          @for (b of buckets(); track b.key) {
            <div
              class="flex items-center gap-3 px-4 py-3"
              [class]="b.unassigned ? 'bg-amber-50 dark:bg-amber-900/15' : 'bg-white dark:bg-white/[0.02]'"
            >
              <div class="min-w-0">
                <div class="font-bold text-gray-900 dark:text-white truncate">
                  {{ b.unassigned ? ('CATEGORIES.UNASSIGNED' | transloco) : b.name }}
                </div>
                @if (b.range) {
                  <div class="text-xs text-gray-400 dark:text-gray-500">{{ 'CATEGORIES.AGE_RANGE' | transloco }} {{ b.range }}</div>
                }
              </div>

              <div class="ml-auto flex items-center gap-2 shrink-0">
                @if (b.male > 0) {
                  <span class="rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 px-2 py-0.5 text-xs font-semibold">{{ b.male }} M</span>
                }
                @if (b.female > 0) {
                  <span class="rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 px-2 py-0.5 text-xs font-semibold">{{ b.female }} F</span>
                }
                <span class="text-sm font-black text-gray-900 dark:text-white tabular-nums">{{ b.count }}</span>
                <span class="text-xs text-gray-400 dark:text-gray-500">{{ 'CATEGORIES.MEMBERS' | transloco }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CategoryBreakdownComponent {
  groups = input.required<GroupDetail[]>();
  ageCategories = input.required<AgeCategory[]>();

  buckets = computed<Bucket[]>(() => {
    const cats = [...this.ageCategories()].sort((a, b) => a.min_age - b.min_age);
    const buckets: Bucket[] = cats.map((c) => ({
      key: 'cat-' + c.id,
      name: c.name,
      range: `${c.min_age}–${c.max_age}`,
      min: c.min_age,
      max: c.max_age,
      unassigned: false,
      count: 0,
      male: 0,
      female: 0,
    }));
    const unassigned: Bucket = {
      key: 'unassigned', name: '', range: null, min: 0, max: 0,
      unassigned: true, count: 0, male: 0, female: 0,
    };

    for (const group of this.groups()) {
      for (const p of group.participants) {
        const age = p.age;
        let target: Bucket | undefined;
        if (age !== null && age !== undefined) {
          target = buckets.find((b) => age >= b.min && age <= b.max);
        }
        const bucket = target ?? unassigned;
        bucket.count++;
        if (p.gender === 'M') bucket.male++;
        else if (p.gender === 'F') bucket.female++;
      }
    }

    return unassigned.count > 0 ? [...buckets, unassigned] : buckets;
  });
}
