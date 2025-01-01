import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay, tap } from 'rxjs';
import { PUBLIC_FILE } from '../enums/public-file.enum';
import { LocationInfo } from '../models/location-info.model';
import { GeoFeature } from '../types/geo-feature.type';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private commonService: CommonService,
  ) {}

  /**
   * 取得 縣市 topoJSON
   * @reference 縣市數據 https://data.gov.tw/dataset/7442
   * @reference 格式轉換 https://mapshaper.org/
   */
  fetchCountyGeoJson(): Observable<GeoFeature[]> {
    const COUNTY_JSON_PATH = PUBLIC_FILE.COUNTY;
    const url = '/map-topo-json/' + COUNTY_JSON_PATH + '.json';
    return this.http.get<TopoJSON.Topology>(url).pipe(
      map((res) => res as TopoJSON.Topology),
      map((res) => this.commonService.convertTopoToFeatures(res, COUNTY_JSON_PATH)),
      map((res) => res.features),
      tap((features) => features.forEach((item) => (item.properties = new LocationInfo(item.properties)))),
      shareReplay(1),
    );
  }

  /**
   * 取得 鄉鎮市區 topoJSON
   * @reference 鄉鎮市區數據 https://data.gov.tw/dataset/7441
   * @reference 格式轉換 https://mapshaper.org/
   */
  fetchTownshipGeoJson(): Observable<GeoFeature[]> {
    const TOWNSHIP_JSON_PATH = PUBLIC_FILE.TOWNSHIP;
    const url = '/map-topo-json/' + TOWNSHIP_JSON_PATH + '.json';
    return this.http.get<TopoJSON.Topology>(url).pipe(
      map((res) => res as TopoJSON.Topology),
      map((res) => this.commonService.convertTopoToFeatures(res, TOWNSHIP_JSON_PATH)),
      map((res) => res.features),
      tap((features) => features.forEach((item) => (item.properties = new LocationInfo(item.properties)))),
      shareReplay(1),
    );
  }
}
