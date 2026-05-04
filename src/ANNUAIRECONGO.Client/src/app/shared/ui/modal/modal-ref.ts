import { OverlayRef } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';

/**
 * Handle returned by ModalService.open(). Use it to close the modal
 * programmatically and to await its result via afterClosed$.
 */
export class ModalRef<TResult = unknown> {
  private readonly afterClosed = new Subject<TResult | undefined>();
  readonly afterClosed$ = this.afterClosed.asObservable();

  constructor(private readonly overlayRef: OverlayRef) {}

  close(result?: TResult): void {
    this.overlayRef.dispose();
    this.afterClosed.next(result);
    this.afterClosed.complete();
  }
}
