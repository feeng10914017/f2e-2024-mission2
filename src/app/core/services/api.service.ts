import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { PUBLIC_FILE } from '../enums/public-file.enum';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  /**
   * 取得 縣市 topoJSON
   * @reference 縣市數據 https://data.gov.tw/dataset/7442
   * @reference 格式轉換 https://mapshaper.org/
   */
  fetchCountyGeoJson(): Observable<TopoJSON.Topology> {
    const url = '/map-topo-json/' + PUBLIC_FILE.COUNTY + '.json';
    return this.http.get<TopoJSON.Topology>(url).pipe(shareReplay(1));
  }

  /**
   * 取得 鄉鎮市區 topoJSON
   * @reference 鄉鎮市區數據 https://data.gov.tw/dataset/7441
   * @reference 格式轉換 https://mapshaper.org/
   */
  fetchTownshipGeoJson(): Observable<TopoJSON.Topology> {
    const url = '/map-topo-json/' + PUBLIC_FILE.TOWNSHIP + '.json';
    return this.http.get<TopoJSON.Topology>(url).pipe(shareReplay(1));
  }
}
