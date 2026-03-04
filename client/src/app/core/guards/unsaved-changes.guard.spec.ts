import { TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { unsavedChangesGuard, HasUnsavedChanges } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { defaultLang: 'en', availableLangs: ['en'] },
        }),
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('allows navigation when component has no unsaved changes', () => {
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => false };
    const result = TestBed.runInInjectionContext(() => unsavedChangesGuard(component, {} as any, {} as any, {} as any));
    expect(result).toBe(true);
  });

  it('shows confirm dialog when component has unsaved changes', () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => true };
    const result = TestBed.runInInjectionContext(() => unsavedChangesGuard(component, {} as any, {} as any, {} as any));
    expect(confirmSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('blocks navigation when user cancels confirm dialog', () => {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => true };
    const result = TestBed.runInInjectionContext(() => unsavedChangesGuard(component, {} as any, {} as any, {} as any));
    expect(result).toBe(false);
  });

  it('allows navigation when component lacks hasUnsavedChanges method', () => {
    const component = {} as HasUnsavedChanges;
    const result = TestBed.runInInjectionContext(() => unsavedChangesGuard(component, {} as any, {} as any, {} as any));
    expect(result).toBe(true);
  });
});
