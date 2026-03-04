import { Component } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { TranslocoPipe } from '@jsverse/transloco';

import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [A11yModule, TranslocoPipe],
  template: `
    @if (dialog.visible()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
           (click)="dialog.cancel()" (keydown.escape)="dialog.cancel()">
        <div cdkTrapFocus [cdkTrapFocusAutoCapture]="true"
             class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
             (click)="$event.stopPropagation()" role="alertdialog"
             [attr.aria-label]="dialog.options().title">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {{ dialog.options().title }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {{ dialog.options().message }}
          </p>
          <div class="flex justify-end gap-3">
            <button (click)="dialog.cancel()"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.05] rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors">
              {{ dialog.options().cancelText || ('COMMON.CANCEL' | transloco) }}
            </button>
            <button (click)="dialog.accept()"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
              {{ dialog.options().confirmText || ('COMMON.CONFIRM' | transloco) }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  constructor(public dialog: ConfirmDialogService) {}
}
