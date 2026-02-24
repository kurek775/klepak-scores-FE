import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MonoTypeOperatorFunction } from 'rxjs';

/**
 * Call in a field initializer (injection context) to get a reusable
 * RxJS operator that completes when the component is destroyed.
 *
 * Usage:
 *   private destroy$ = untilDestroyed();
 *   ...
 *   obs$.pipe(this.destroy$()).subscribe(...)
 */
export function untilDestroyed(): <T>() => MonoTypeOperatorFunction<T> {
  const ref = inject(DestroyRef);
  return <T>() => takeUntilDestroyed<T>(ref);
}
