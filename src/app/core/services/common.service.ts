import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as topojson from 'topojson';
import { Geometries } from '../types/geo-feature.type';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor() {}

  /** 將 TopoJSON 轉換為 GeoJSON Features */
  convertTopoToFeatures(topoJson: TopoJSON.Topology, objectName: string): Geometries {
    return topojson.feature(topoJson, topoJson.objects[objectName]) as Geometries;
  }

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
