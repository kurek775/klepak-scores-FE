import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  visible = signal(false);
  options = signal<ConfirmDialogOptions>({ title: '', message: '' });

  private _resolve: ((value: boolean) => void) | null = null;

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    this.options.set(options);
    this.visible.set(true);
    return new Promise<boolean>((resolve) => {
      this._resolve = resolve;
    });
  }

  accept(): void {
    this.visible.set(false);
    this._resolve?.(true);
    this._resolve = null;
  }

  cancel(): void {
    this.visible.set(false);
    this._resolve?.(false);
    this._resolve = null;
  }
}
