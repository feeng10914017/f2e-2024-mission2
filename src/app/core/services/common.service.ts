import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor() {}

  createResizeObservable(element: HTMLElement) {
    return new Observable<ResizeObserverEntry[]>((subscriber) => {
      const resizeObserver = new ResizeObserver((entries) => subscriber.next(entries));
      resizeObserver.observe(element);
      return () => {
        resizeObserver.unobserve(element);
        resizeObserver.disconnect();
      };
    });
  }
}
