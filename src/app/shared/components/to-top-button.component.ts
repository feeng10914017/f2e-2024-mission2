import { animate, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { fromEvent, map } from 'rxjs';
import { CommonService } from '../../core/services/common.service';

@Component({
  selector: 'app-to-top-button',
  imports: [AsyncPipe],
  template: `
    <div
      [@opacityVisibleHidden]="(toTopBtnVisible$ | async) ? 'visible' : 'hidden'"
      class="fixed bottom-6 right-6 opacity-0">
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-full border border-solid border-primary bg-white"
        (click)="commonService.scrollToTop()">
        <img src="images/icons/arrow_upward.png" alt="arrow_upward" class="pointer-events-none h-5 w-5" />
      </button>
    </div>
  `,
  styles: ``,
  animations: [
    trigger('opacityVisibleHidden', [
      state('visible', style({ opacity: '1' })),
      state('hidden', style({ opacity: '0' })),
      transition('visible => hidden', [animate('0.2s')]),
      transition('hidden => visible', [animate('0.2s')]),
    ]),
  ],
})
export class ToTopButtonComponent {
  protected readonly commonService = inject(CommonService);
  protected readonly toTopBtnVisible$ = fromEvent(window, 'scroll').pipe(
    map(() => document.documentElement.scrollTop > 50),
  );
}
