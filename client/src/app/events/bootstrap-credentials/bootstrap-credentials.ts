import { Component, input, output } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { BootstrapEvaluatorsResponse } from '../../core/models/event.model';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-bootstrap-credentials',
  standalone: true,
  imports: [TranslocoPipe],
  template: `
    <div
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      (click)="close()"
      (keydown.escape)="close()"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[85vh] flex flex-col"
        (click)="$event.stopPropagation()"
        role="dialog"
        [attr.aria-label]="'EVENTS.BOOTSTRAP_TITLE' | transloco"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {{ 'EVENTS.BOOTSTRAP_TITLE' | transloco }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {{ 'EVENTS.BOOTSTRAP_SUBTITLE' | transloco }}
        </p>

        @if (result().created.length === 0) {
          <p class="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
            {{ 'EVENTS.BOOTSTRAP_NONE' | transloco }}
          </p>
        } @else {
          <div class="overflow-auto rounded-lg border border-gray-200 dark:border-white/10 mb-3">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 uppercase text-xs">
                <tr>
                  <th class="text-left font-medium px-3 py-2">{{ 'EVENTS.COL_TEAM' | transloco }}</th>
                  <th class="text-left font-medium px-3 py-2">{{ 'EVENTS.COL_EMAIL' | transloco }}</th>
                  <th class="text-left font-medium px-3 py-2">{{ 'EVENTS.COL_PASSWORD' | transloco }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-white/[0.06]">
                @for (c of result().created; track c.email) {
                  <tr class="text-gray-900 dark:text-gray-100">
                    <td class="px-3 py-2 whitespace-nowrap">{{ c.group_name }}</td>
                    <td class="px-3 py-2 font-mono text-xs">{{ c.email }}</td>
                    <td class="px-3 py-2 font-mono text-xs">{{ c.password }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (result().skipped_groups.length > 0) {
          <p class="text-xs text-gray-400 dark:text-gray-500 mb-3">
            {{ 'EVENTS.BOOTSTRAP_SKIPPED' | transloco: { count: result().skipped_groups.length } }}
          </p>
        }

        <div class="flex justify-end gap-3 mt-2">
          @if (result().created.length > 0) {
            <button
              (click)="copyAll()"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.05] rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors"
            >
              {{ 'EVENTS.COPY_ALL' | transloco }}
            </button>
            <button
              (click)="downloadCsv()"
              class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-colors"
            >
              {{ 'EVENTS.DOWNLOAD_CSV' | transloco }}
            </button>
          }
          <button
            (click)="close()"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.05] rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors"
          >
            {{ 'COMMON.CLOSE' | transloco }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class BootstrapCredentials {
  result = input.required<BootstrapEvaluatorsResponse>();
  closed = output<void>();

  constructor(
    private toast: ToastService,
    private transloco: TranslocoService,
  ) {}

  private rows(): string[][] {
    return this.result().created.map((c) => [c.group_name, c.email, c.password]);
  }

  copyAll(): void {
    const lines = [['Team', 'Email', 'Password'], ...this.rows()]
      .map((r) => r.join('\t'))
      .join('\n');
    navigator.clipboard?.writeText(lines).then(() => {
      this.toast.success(this.transloco.translate('EVENTS.COPIED'));
    });
  }

  downloadCsv(): void {
    const esc = (v: string) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
    const csv = [['team', 'email', 'password'], ...this.rows()]
      .map((r) => r.map(esc).join(','))
      .join('\r\n');
    const bom = String.fromCharCode(0xfeff); // UTF-8 BOM so Excel reads diacritics
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-${this.result().event_id}-logins.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  close(): void {
    this.closed.emit();
  }
}
