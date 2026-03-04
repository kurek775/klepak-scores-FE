import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
    const transloco = inject(TranslocoService);
    return confirm(transloco.translate('COMMON.UNSAVED_CHANGES_WARNING'));
  }
  return true;
};
