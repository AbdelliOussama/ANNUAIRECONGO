import { Injectable, Injector, Type, inject } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ModalRef } from '../ui/modal/modal-ref';
import {
  ConfirmModalComponent,
  ConfirmModalData,
} from '../ui/modal/confirm-modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly overlay  = inject(Overlay);
  private readonly injector = inject(Injector);

  /**
   * Open an arbitrary component as a modal.
   * The component should inject ModalRef to close itself with a result.
   */
  open<T, TResult = unknown>(
    component: Type<T>,
    data?: Record<string, unknown>,
  ): ModalRef<TResult> {
    const config = new OverlayConfig({
      hasBackdrop: false, // overlay backdrop replaced by our .modal-overlay so it can be styled in CSS
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      panelClass: 'ac-modal-panel',
    });

    const overlayRef = this.overlay.create(config);
    const modalRef   = new ModalRef<TResult>(overlayRef);

    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: ModalRef, useValue: modalRef },
        ...(data ? Object.entries(data).map(([key, value]) => ({
          provide: key,
          useValue: value,
        })) : []),
      ],
    });

    const portal = new ComponentPortal(component, null, injector);
    const componentRef = overlayRef.attach(portal);

    // If the component declared a `data` input, write it.
    if (data && 'data' in (componentRef.instance as object)) {
      (componentRef as any).setInput('data', data);
    }

    // Esc to close.
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') modalRef.close();
    });

    return modalRef;
  }

  /**
   * Convenience: confirm dialog. Resolves to { confirmed, reason? }.
   *   const { confirmed, reason } = await modal.confirm({ title:'Supprimer?', tone:'danger' });
   */
  confirm(data: ConfirmModalData): Promise<{ confirmed: boolean; reason?: string }> {
    const ref = this.open<ConfirmModalComponent, { confirmed: boolean; reason?: string }>(
      ConfirmModalComponent,
      data as unknown as Record<string, unknown>,
    );
    return new Promise((resolve) => {
      ref.afterClosed$.subscribe((result) => resolve(result ?? { confirmed: false }));
    });
  }
}
