import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface DialogConfig {
  width?: string;
  height?: string;
  panelClass?: string | string[];
  lockBackdrop?: boolean;
  lockScroll?: boolean;
}

export class DialogRef<D, R> {
  private _afterClosedSubject = new Subject<R | undefined>();
  readonly overlayRef: OverlayRef;
  readonly id: string;

  constructor(
    private overlay: Overlay,
    private config?: DialogConfig,
  ) {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      disposeOnNavigation: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      width: this.config?.width,
      height: this.config?.height,
      panelClass: this.config?.panelClass,
    });
    this.id = this.overlayRef.overlayElement.id;

    if (!this.config) return;

    if (!this.config?.lockBackdrop) {
      this.overlayRef.backdropClick().subscribe(() => this.close());
    }
  }

  close(result?: R) {
    this.overlayRef.dispose();
    this._afterClosedSubject.next(result);
    this._afterClosedSubject.complete();
  }

  afterClosed(): Observable<R | undefined> {
    return this._afterClosedSubject.asObservable();
  }
}

export const DIALOG_DATA = new InjectionToken<any>('DIALOG_DATA');

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly _overlay = inject(Overlay);
  private readonly _injector = inject(Injector);
  private activeDialog: string[] = [];

  open<T, D, R>(component: ComponentType<T>, data: D, config?: DialogConfig) {
    if (config?.lockScroll) {
    }

    const dialogRef = new DialogRef<D, R>(this._overlay, config);
    this.toggleScrollLock(dialogRef.id, !!config?.lockScroll);
    dialogRef.overlayRef.detachments().subscribe(() => this.toggleScrollLock(dialogRef.id, false));

    const injector = Injector.create({
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DIALOG_DATA, useValue: data },
      ],
      parent: this._injector,
    });
    const componentPortal = new ComponentPortal(component, null, injector);
    dialogRef.overlayRef.attach(componentPortal);

    return dialogRef;
  }

  private toggleScrollLock(dialogId: string, isLockScroll: boolean): void {
    if (isLockScroll) {
      this.activeDialog.push(dialogId);
    } else {
      this.activeDialog = this.activeDialog.filter((id) => id !== dialogId);
    }

    if (this.activeDialog.length > 0) {
      document.querySelector('body')?.classList.add('overflow-hidden');
    } else {
      document.querySelector('body')?.classList.remove('overflow-hidden');
    }
  }
}
