import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as topojson from 'topojson';
import { IDropdownOption } from '../interfaces/i-dropdown-option.interface';
import { Geometries } from '../types/geo-feature.type';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor() {}

  /** 取得自 1996 年以來的年份 */
  getYearsSince1996(): string[] {
    const startYear = 1996;
    const currentYear = new Date().getFullYear();
    return Array(currentYear - startYear)
      .fill(startYear)
      .map((year, i) => String(year + i))
      .filter((year, i) => i % 4 === 0);
  }

  /** 轉換下拉選單選項 */
  convertOption<T>(label: string, value: T): IDropdownOption<T> {
    return { label, value };
  }

  /** 將 TopoJSON 轉換為 GeoJSON Features */
  convertTopoToFeatures(topoJson: TopoJSON.Topology, objectName: string): Geometries {
    return topojson.feature(topoJson, topoJson.objects[objectName]) as Geometries;
  }

  /** 新增 邊界調整 觀察者 */
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

  /** 置頂 */
  scrollToTop(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
}
