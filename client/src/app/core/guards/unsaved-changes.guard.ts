import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

import { ConfirmDialogService } from '../../shared/confirm-dialog.service';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
    const transloco = inject(TranslocoService);
    const confirmDialog = inject(ConfirmDialogService);
    return confirmDialog.confirm({
      title: transloco.translate('COMMON.CONFIRM_TITLE'),
      message: transloco.translate('COMMON.UNSAVED_CHANGES_WARNING'),
      confirmText: transloco.translate('COMMON.LEAVE_PAGE'),
      cancelText: transloco.translate('COMMON.STAY_ON_PAGE'),
    });
  }
  return true;
};
