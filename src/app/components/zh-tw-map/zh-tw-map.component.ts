import { AfterViewInit, Component, ElementRef, inject, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import { distinctUntilChanged, forkJoin, map, Subject, takeUntil, throttleTime } from 'rxjs';
import * as topojson from 'topojson';
import { D3ClassName } from '../../core/enums/d3-class.enum';
import { DISTRICT_CODE } from '../../core/enums/district-code.enum';
import { PUBLIC_FILE } from '../../core/enums/public-file.enum';
import { REGION_CODE } from '../../core/enums/region-code.enum';
import { LocationInfo } from '../../core/models/location-info.model';
import { ApiService } from '../../core/services/api.service';
import { CommonService } from '../../core/services/common.service';
import { HistoryManagerService } from '../../core/services/history-manager.service';

type Geometries = FeatureCollection<Geometry, LocationInfo>;
type GeoFeature = Feature<Geometry, LocationInfo>;
type OuterIslandCountySetting = {
  code: REGION_CODE;
  x: number;
  y: number;
  boxWidth: number;
  boxHeight: number;
  projection: d3.GeoProjection;
  path: d3.GeoPath<any, d3.GeoPermissibleObjects>;
  transform: string;
};

@Component({
  selector: 'app-zh-tw-map',
  imports: [],
  template: ``,
  styles: ``,
})
export class ZhTwMapComponent implements AfterViewInit, OnDestroy {
  private readonly _elementRef = inject(ElementRef);
  private readonly _apiService = inject(ApiService);
  private readonly _commonService = inject(CommonService);
  private readonly _historyManagerService = inject(HistoryManagerService);

  private _cachedCountyFeatures: GeoFeature[] = [];
  private _cachedTownshipFeatures: GeoFeature[] = [];

  private _width = 800;
  private _height = 600;
  private _svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private _container!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private _projection!: d3.GeoProjection;
  private _path!: d3.GeoPath<any, d3.GeoPermissibleObjects>;

  private _currentZoom = 1;

  private readonly _countiesCode = [REGION_CODE.Z, REGION_CODE.W, REGION_CODE.X];
  private readonly _outerIslandCountySettings: OuterIslandCountySetting[] = [];
  private readonly _destroy = new Subject<null>();

  ngAfterViewInit(): void {
    this._commonService
      .createResizeObservable(this._elementRef.nativeElement)
      .pipe(takeUntil(this._destroy), throttleTime(50))
      .subscribe((d) => this._rerenderMap());

    this._initializeMap();
    this._initializeMapData();

    this._historyManagerService.region$
      .pipe(takeUntil(this._destroy), distinctUntilChanged())
      .subscribe(async (regionCode) => {
        this._container.selectAll(`.${D3ClassName.COUNTY_NAME}`).style('opacity', '0');
        this._renderTownshipLayer(REGION_CODE.ALL);

        if (regionCode === REGION_CODE.ALL) {
          this._toggleOuterIslandRectFocusRender(false);
          await this.zoomToAllCounty();
          this._container.selectAll(`.${D3ClassName.COUNTY_NAME}`).style('opacity', '1').raise();
        } else {
          const isOuterIsland = !!this._outerIslandCountySettings.find((item) => item.code === regionCode);
          this._toggleOuterIslandRectFocusRender(isOuterIsland);
          await this._zoomToCounty(regionCode);
        }
        this._renderTownshipLayer(regionCode);
      });
  }

  ngOnDestroy(): void {
    this._destroy.next(null);
    this._destroy.complete();
  }

  /** 更新 host container 尺寸 */
  private _updateContainerDimensions(): void {
    this._width = this._elementRef.nativeElement.clientWidth;
    this._height = this._elementRef.nativeElement.clientHeight;
  }

  /** 更新地圖相關設置 */
  private _updateMapLayout(): void {
    this._updateContainerDimensions();
    this._svg.attr('width', this._width).attr('height', this._height);
    this._projection.translate([this._width / 2, this._height / 2]);
    this._path = d3.geoPath().projection(this._projection);
  }

  /** 重新繪製地圖 */
  private _rerenderMap(): void {
    if (!this._svg || !this._projection || !this._path) return;

    this._updateMapLayout();
    this._svg.selectAll('path').attr('d', this._path as any);
  }

  /** 初始化地圖 */
  private _initializeMap(): void {
    this._svg = d3
      .select(this._elementRef.nativeElement)
      .append('svg')
      .on('click', (e) => {
        if (e.target.tagName === 'path' || e.target.tagName === 'rect') return;
        this._historyManagerService.region$.next(REGION_CODE.ALL);
      });
    this._container = this._svg.append('g');
    this._projection = d3.geoMercator().center([120.95, 23.6]).scale(12500);
    this._updateMapLayout();
  }

  /** 初始化地圖資料 */
  private _initializeMapData(): void {
    const MAP_FILE_PATHS = { COUNTY_JSON_PATH: PUBLIC_FILE.COUNTY, TOWNSHIP_JSON_PATH: PUBLIC_FILE.TOWNSHIP };

    /** 將 TopoJSON 轉換為 GeoJSON Features */
    const convertTopoToFeatures = (topoJson: TopoJSON.Topology, objectName: string): Geometries => {
      return topojson.feature(topoJson, topoJson.objects[objectName]) as Geometries;
    };

    /** 處理地理特徵的屬性資料 */
    const processFeatureProperties = (features: GeoJSON.Feature[]): void => {
      features.forEach((feature) => (feature.properties = new LocationInfo(feature.properties)));
    };

    forkJoin([this._apiService.fetchCountyGeoJson(), this._apiService.fetchTownshipGeoJson()])
      .pipe(map((responses) => responses.map((data) => data as TopoJSON.Topology)))
      .subscribe(([countyTopoJson, townshipTopoJson]) => {
        const countyFeatureCollection = convertTopoToFeatures(countyTopoJson, MAP_FILE_PATHS.COUNTY_JSON_PATH);
        processFeatureProperties(countyFeatureCollection.features);
        this._renderCountyLayer(countyFeatureCollection.features);
        this._cachedCountyFeatures = countyFeatureCollection.features;

        const townshipFeatureCollection = convertTopoToFeatures(townshipTopoJson, MAP_FILE_PATHS.TOWNSHIP_JSON_PATH);
        processFeatureProperties(townshipFeatureCollection.features);
        this._cachedTownshipFeatures = townshipFeatureCollection.features;
      });
  }

  /** 渲染 hover 區域 */
  private _renderHighlight(feature: GeoFeature | null, path: d3.GeoPath<any, d3.GeoPermissibleObjects>) {
    this._container
      .selectAll<SVGPathElement, GeoFeature>(`.${D3ClassName.HIGHLIGHT_PATH}`)
      .data(feature ? [feature] : [])
      .join(
        (enter) => {
          enter
            .append('path')
            .attr('d', (d) => path(d))
            .attr('class', D3ClassName.HIGHLIGHT_PATH)
            .style('fill', 'white')
            .style('opacity', '0.2')
            .style('pointer-events', 'none');
          this._svg.selectAll('text').raise();
          return enter;
        },
        (update) => {
          this._svg.selectAll('text').raise();
          return update;
        },
        (exit) => exit.remove(),
      );
  }

  /** 渲染縣、市圖層 */
  private _renderCountyLayer(features: GeoFeature[]): void {
    const outerIslandConfig = { spacing: 8, marginTop: 16, marginLeft: 16 };

    // 本島的處理
    features
      .filter((feature) => !this._countiesCode.includes(feature.properties.COUNTYCODE as REGION_CODE))
      .forEach((feature) => this._drawMainIslandCountry(feature));

    // 離島設定檔的處理
    this._countiesCode.forEach((code, index) => {
      const feature = features.find((feature) => feature.properties.COUNTYCODE === code);
      if (!feature) return;

      const boxWidth = 72;
      const boxHeight = code === REGION_CODE.X ? 138 : 73;
      const x = outerIslandConfig.marginLeft;
      const y = this._outerIslandCountySettings
        .slice(0, index)
        .map((item) => item.boxHeight)
        .reduce((a, b) => a + b, outerIslandConfig.marginTop + outerIslandConfig.spacing * index);
      const projection = d3.geoMercator().fitExtent(
        [
          [x + boxWidth * 0.1, y + boxWidth * 0.1],
          [x + boxWidth * 0.8, y + boxHeight * 0.8],
        ],
        feature,
      );
      const path = d3.geoPath().projection(projection);
      const transform = `translate(${x + boxWidth * 0.1}, ${y + boxHeight * 0.1})`;
      this._outerIslandCountySettings.push({ code, x, y, boxWidth, boxHeight, projection, path, transform });
    });

    // 離島的處理
    features
      .filter((feature) => this._countiesCode.includes(feature.properties.COUNTYCODE as REGION_CODE))
      .forEach((feature) => this._drawOuterIslandCountry(feature));
  }

  /** 繪製主島 */
  private _drawMainIslandCountry(feature: GeoFeature): void {
    const regionCode = feature.properties.COUNTYCODE as REGION_CODE;
    this._container
      .append('g')
      .attr('class', D3ClassName.REGION_UID_PREFIX + regionCode)
      .append('path')
      .attr('class', `${D3ClassName.COUNTY_PATH} ${D3ClassName.PATH_UID_PREFIX + regionCode}`)
      .attr('d', () => this._path(feature))
      .on('mouseenter', (e: MouseEvent) => this._renderHighlight(feature, this._path))
      .on('mouseleave', (e: MouseEvent) => this._renderHighlight(null, this._path))
      .on('click', (e: MouseEvent) => this._historyManagerService.region$.next(regionCode));

    const fontSize = 16 / this._currentZoom;
    const centroid = this._path.centroid(feature).map((item, i) => item + (i * fontSize) / 2);
    const translate = () => {
      let x = 0;
      let y = 0;
      switch (regionCode) {
        case REGION_CODE.C:
          return [x + 30, y + -15];
        case REGION_CODE.A:
          return [x + 5, y + 10];
        case REGION_CODE.F:
          return [x - 5, y + 20];
        case REGION_CODE.H:
          return [x - 15, y - 25];
        case REGION_CODE.O:
          return [x + 35, y - 10];
        case REGION_CODE.J:
          return [x + 5, y + 5];
        case REGION_CODE.K:
          return [x - 5, y];
        case REGION_CODE.B:
          return [x - 20, y + 5];
        case REGION_CODE.P:
          return [x, y - 10];
        case REGION_CODE.I:
          return [x, y + 10];
        case REGION_CODE.Q:
          return [x + 40, y];
        case REGION_CODE.E:
          return [x + 10, y];
        case REGION_CODE.T:
          return [x - 15, y - 30];
        case REGION_CODE.U:
          return [x + 5, y];
        default:
          return [x, y];
      }
    };
    this._container
      .append('text')
      .attr('class', `${D3ClassName.INFO_TEXT} ${D3ClassName.COUNTY_NAME}`)
      .attr('font-size', `${fontSize}px`)
      .attr('x', (d) => String(centroid[0]))
      .attr('y', (d) => String(centroid[1]))
      .attr('transform', (d) => `translate(${translate()[0]},${translate()[1]})`)
      .text(feature.properties.COUNTYNAME)
      .raise();
  }

  /** 繪製離島 */
  private _drawOuterIslandCountry(feature: GeoFeature): void {
    const regionCode = feature.properties.COUNTYCODE as REGION_CODE;
    const targetIndex = this._outerIslandCountySettings.findIndex((item) => item.code === regionCode);
    if (targetIndex === undefined) return;

    const setting = this._outerIslandCountySettings[targetIndex];
    const selection = this._container.append('g').attr('class', D3ClassName.REGION_UID_PREFIX + regionCode);

    selection
      .append('rect')
      .attr('class', 'island-box')
      .attr('x', setting.x)
      .attr('y', setting.y)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('width', setting.boxWidth)
      .attr('height', setting.boxHeight)
      .attr('fill', 'white')
      .on('mouseenter', (e: MouseEvent) => this._renderHighlight(feature, setting.path))
      .on('mouseleave', (e: MouseEvent) => this._renderHighlight(null, setting.path))
      .on('click', (e: MouseEvent) => this._historyManagerService.region$.next(regionCode));

    selection
      .datum((d) => d)
      .append('path')
      .attr('class', `${D3ClassName.COUNTY_PATH} ${D3ClassName.PATH_UID_PREFIX + regionCode}`)
      .attr('d', setting.path(feature))
      .attr('pointer-events', 'none');

    const convertText = (text: string) => (text === '連江' ? '馬祖' : text);
    selection
      .append('text')
      .attr('class', `${D3ClassName.INFO_TEXT} ${D3ClassName.COUNTY_NAME}`)
      .attr('font-size', '16px')
      .attr('x', setting.x + setting.boxWidth / 2)
      .attr('y', setting.y + setting.boxHeight - 12)
      .text(convertText(feature.properties.COUNTYNAME.replace('縣', '')))
      .raise();
  }

  private _getTargetPath(regionCode: REGION_CODE): d3.GeoPath<any, d3.GeoPermissibleObjects> {
    const outerIslandSetting = this._outerIslandCountySettings.find((item) => item.code === regionCode);
    return !!outerIslandSetting ? outerIslandSetting.path : this._path;
  }

  private _toggleOuterIslandRectFocusRender(isOuterIsland: boolean): void {
    this._container
      .selectAll('rect')
      .style('opacity', isOuterIsland ? '0' : '1')
      .style('pointer-events', isOuterIsland ? 'none' : 'auto');
  }

  /** 渲染鄉、鎮、市、區圖層 */
  private _renderTownshipLayer(regionCode: REGION_CODE): void {
    this._container.selectAll<SVGTextElement, GeoFeature>(`.${D3ClassName.TOWNSHIP_NAME}`).remove();
    this._container.selectAll<SVGPathElement, GeoFeature>(`.${D3ClassName.TOWNSHIP_PATH}`).remove();
    if (regionCode === REGION_CODE.ALL || !regionCode) return;

    const regionUidClassName = D3ClassName.REGION_UID_PREFIX + regionCode;
    const targetRegion = this._container.select<SVGGElement>(`.${regionUidClassName}`);
    const targetPath = this._getTargetPath(regionCode);
    const fontSize = 16 / this._currentZoom;

    targetRegion.raise();
    this._cachedTownshipFeatures
      .filter((item) => item.properties.COUNTYCODE === regionCode)
      .forEach((feature) => {
        const districtCode = feature.properties.TOWNCODE as DISTRICT_CODE;
        targetRegion
          .append('path')
          .attr('d', targetPath(feature))
          .attr('class', D3ClassName.TOWNSHIP_PATH)
          .on('mouseenter', (e: MouseEvent) => this._renderHighlight(feature, this._getTargetPath(regionCode)))
          .on('mouseleave', (e: MouseEvent) => this._renderHighlight(null, this._getTargetPath(regionCode)))
          .on('click', (e: MouseEvent) => this._historyManagerService.district$.next(districtCode));

        const centroid = targetPath.centroid(feature).map((item, i) => item + (i * fontSize) / 2);
        this._container
          .append('text')
          .attr('class', `${D3ClassName.INFO_TEXT} ${D3ClassName.TOWNSHIP_NAME}`)
          .attr('font-size', `${fontSize}px`)
          .attr('x', (d) => String(centroid[0]))
          .attr('y', (d) => String(centroid[1]))
          .text(feature.properties.TOWNNAME)
          .raise();
      });
  }

  private async _zoomToCounty(regionCode: REGION_CODE): Promise<void> {
    const feature = this._cachedCountyFeatures.find((f) => f.properties.COUNTYCODE === regionCode);
    if (feature === undefined) return new Promise<void>((resolve, reject) => resolve());

    const targetPath = this._getTargetPath(regionCode);
    const bounds = targetPath.bounds(feature);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1, Math.min(25, 0.9 / Math.max(dx / this._width, dy / this._height)));
    const translate = [this._width / 2 - scale * x, this._height / 2 - scale * y];
    this._currentZoom = scale;

    return this._container
      .transition()
      .duration(500)
      .attr('transform', `translate(${translate[0]},${translate[1]}) scale(${scale})`)
      .end();
  }

  protected async zoomToAllCounty(): Promise<void> {
    this._currentZoom = 1;
    return this._container.transition().duration(500).attr('transform', `translate(0, 0) scale(1)`).end();
  }
}
