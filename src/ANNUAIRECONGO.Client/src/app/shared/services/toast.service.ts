import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

let _uid = 0;

/**
 * App-wide toast queue. Mount <ac-toast-host /> once near the root and call
 * any of these methods from anywhere:
 *
 *   const toast = inject(ToastService);
 *   toast.success('Modifications enregistrées.');
 *   toast.error('Connexion impossible.');
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, tone: ToastTone = 'info', duration = 4000): number {
    const id = ++_uid;
    this._toasts.update((list) => [...list, { id, tone, message }]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  success(message: string, duration?: number): number { return this.show(message, 'success', duration); }
  error  (message: string, duration?: number): number { return this.show(message, 'error',   duration); }
  info   (message: string, duration?: number): number { return this.show(message, 'info',    duration); }
  warning(message: string, duration?: number): number { return this.show(message, 'warning', duration); }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
