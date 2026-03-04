import { TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { unsavedChangesGuard, HasUnsavedChanges } from './unsaved-changes.guard';
import { ConfirmDialogService } from '../../shared/confirm-dialog.service';

describe('unsavedChangesGuard', () => {
  let confirmDialogService: ConfirmDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { defaultLang: 'en', availableLangs: ['en'] },
        }),
      ],
    });
    confirmDialogService = TestBed.inject(ConfirmDialogService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('allows navigation when component has no unsaved changes', () => {
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => false };
    const result = TestBed.runInInjectionContext(() => unsavedChangesGuard(component, {} as any, {} as any, {} as any));
    expect(result).toBe(true);
  });

  it('shows confirm dialog when component has unsaved changes', async () => {
    const confirmSpy = vi.spyOn(confirmDialogService, 'confirm').mockResolvedValue(true);
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => true };
    const result = await TestBed.runInInjectionContext(() => unsavedChangesGuard(component, {} as any, {} as any, {} as any));
    expect(confirmSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('blocks navigation when user cancels confirm dialog', async () => {
    vi.spyOn(confirmDialogService, 'confirm').mockResolvedValue(false);
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => true };
    const result = await TestBed.runInInjectionContext(() => unsavedChangesGuard(component, {} as any, {} as any, {} as any));
    expect(result).toBe(false);
  });

  it('allows navigation when component lacks hasUnsavedChanges method', () => {
    const component = {} as HasUnsavedChanges;
    const result = TestBed.runInInjectionContext(() => unsavedChangesGuard(component, {} as any, {} as any, {} as any));
    expect(result).toBe(true);
  });
});
