import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  toasts = signal<Toast[]>([]);

  success(message: string): void {
    this._add(message, 'success');
  }

  error(message: string): void {
    this._add(message, 'error');
  }

  info(message: string): void {
    this._add(message, 'info');
  }

  remove(id: number): void {
    this.toasts.update((all) => all.filter((t) => t.id !== id));
  }

  private _add(message: string, type: Toast['type']): void {
    const id = ++this.nextId;
    this.toasts.update((all) => [...all, { id, message, type }]);
    setTimeout(() => this.remove(id), 4000);
  }
}
