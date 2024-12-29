import { AfterViewInit, Component, ElementRef, inject, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import { delay, distinctUntilChanged, forkJoin, map, Subject, takeUntil, throttleTime } from 'rxjs';
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
      .pipe(takeUntil(this._destroy), throttleTime(50), delay(0))
      .subscribe(() => this._rerenderMap());

    this._initializeMap();
    this._initializeMapData();

    this._historyManagerService.region$
      .pipe(takeUntil(this._destroy), distinctUntilChanged())
      .subscribe(async (regionCode) => {
        this._container.selectAll(`.${D3ClassName.COUNTY_NAME}`).style('opacity', '0');
        this._renderTownshipLayer(REGION_CODE.ALL);

        if (regionCode === REGION_CODE.ALL) {
          this._toggleOuterIslandRectFocusRender(false);
          await this.zoomToAllCounty().end();
          this._container.selectAll(`.${D3ClassName.COUNTY_NAME}`).style('opacity', '1').raise();
        } else {
          const isOuterIsland = !!this._outerIslandCountySettings.find((item) => item.code === regionCode);
          this._toggleOuterIslandRectFocusRender(isOuterIsland);
          await this._zoomToCounty(regionCode)?.end();
        }
        this._renderTownshipLayer(regionCode);
      });
  }

  ngOnDestroy(): void {
    this._destroy.next(null);
    this._destroy.complete();
  }

  /** 更新 svg 尺寸，取得最新的寬高值 */
  private _updateSvgDimensions(): void {
    this._width = this._elementRef.nativeElement.clientWidth;
    this._height = this._elementRef.nativeElement.clientHeight;
  }

  /** 更新地圖相關設置，包含 svg 尺寸和投影設定 */
  private _updateMapLayout(): void {
    this._updateSvgDimensions();
    this._projection.translate([this._width / 2, this._height / 2]);
    this._path = d3.geoPath().projection(this._projection);
  }

  /** 重新繪製地圖，與縮放定位 */
  private _rerenderMap(): void {
    if (!this._svg || !this._projection || !this._path) return;

    this._updateMapLayout();
    this._container
      .selectAll<SVGPathElement, GeoFeature>(`.${D3ClassName.COUNTY_PATH}`)
      .attr('d', (d) => this._getTargetPath(this._getRegionCode(d))(d));
    this._container
      .selectAll<SVGPathElement, GeoFeature>(`.${D3ClassName.TOWNSHIP_PATH}`)
      .attr('d', (d) => this._getTargetPath(this._getRegionCode(d))(d));
    this._container
      .selectAll<SVGTextElement, GeoFeature>(`.${D3ClassName.INFO_TEXT}`)
      .attr('x', (d) => `${this._getPathCentroid(d)[0]}`)
      .attr('y', (d) => `${this._getPathCentroid(d)[1]}`)
      .attr('transform', (d) => this._getTextTransform(d));
    this._zoomToCounty(this._historyManagerService.region$.getValue());
  }

  /** 初始化地圖的 SVG 和基本 D3 設置 */
  private _initializeMap(): void {
    this._svg = d3
      .select(this._elementRef.nativeElement)
      .append('svg')
      .style('width', '100%')
      .style('height', '100%')
      .on('click', (e) => {
        if (e.target.tagName === 'path' || e.target.tagName === 'rect') return;
        this._historyManagerService.region$.next(REGION_CODE.ALL);
      });
    this._container = this._svg.append('g');
    this._projection = d3.geoMercator().center([120.95, 23.6]).scale(12500);
    this._updateMapLayout();
  }

  /** 初始化地圖數據(加載和處理 GeoJSON 文件)，並設置初始地圖 */
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

  /** 在鼠標懸停於地圖區域時渲染高亮效果 */
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

  /** 渲染地圖的縣、市圖層 */
  private _renderCountyLayer(features: GeoFeature[]): void {
    // 離島設定檔的處理
    const outerIslandConfig = { spacing: 8, marginTop: 16, marginLeft: 16 };
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

    this._container
      .selectAll<SVGGElement, GeoFeature>(`.${D3ClassName.REGION_ITEM}`)
      .data(features)
      .join('g')
      .attr('class', (d) => `${D3ClassName.REGION_ITEM} ${D3ClassName.REGION_UID_PREFIX + this._getRegionCode(d)}`)
      .call((g) => {
        this._drawMainIslandCountry(g.filter((d) => !this._countiesCode.includes(this._getRegionCode(d))));
        this._drawOuterIslandCountry(g.filter((d) => this._countiesCode.includes(this._getRegionCode(d))));
        return g;
      });

    this._renderPlaceNameLayer(features, D3ClassName.COUNTY_NAME);
  }

  /** 繪製本島縣市 */
  private _drawMainIslandCountry(g: d3.Selection<SVGGElement, GeoFeature, SVGGElement, unknown>): void {
    g.selectAll<SVGPathElement, GeoFeature>(`.${D3ClassName.COUNTY_PATH}`)
      .data((d) => [d])
      .join('path')
      .attr('class', (d) => `${D3ClassName.COUNTY_PATH} ${D3ClassName.PATH_UID_PREFIX + this._getRegionCode(d)}`)
      .attr('d', this._path)
      .on('mouseenter', (e: MouseEvent, d: GeoFeature) => this._renderHighlight(d, this._path))
      .on('mouseleave', (e: MouseEvent) => this._renderHighlight(null, this._path))
      .on('click', (e: MouseEvent, d: GeoFeature) => this._historyManagerService.region$.next(this._getRegionCode(d)));
  }

  /** 繪製離島縣市 */
  private _drawOuterIslandCountry(g: d3.Selection<SVGGElement, GeoFeature, SVGGElement, unknown>): void {
    const setting = (feature: GeoFeature) => {
      const index = this._outerIslandCountySettings.findIndex((item) => item.code === this._getRegionCode(feature));
      return this._outerIslandCountySettings[index];
    };

    g.selectAll<SVGPathElement, GeoFeature>(`rect`)
      .data((d) => [d])
      .join('rect')
      .attr('x', (d) => setting(d).x)
      .attr('y', (d) => setting(d).y)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('width', (d) => setting(d).boxWidth)
      .attr('height', (d) => setting(d).boxHeight)
      .attr('fill', 'white')
      .on('mouseenter', (e: MouseEvent, d: GeoFeature) => this._renderHighlight(d, setting(d).path))
      .on('mouseleave', (e: MouseEvent, d: GeoFeature) => this._renderHighlight(null, setting(d).path))
      .on('click', (e: MouseEvent, d: GeoFeature) => this._historyManagerService.region$.next(this._getRegionCode(d)));

    g.selectAll<SVGPathElement, GeoFeature>(`.${D3ClassName.COUNTY_PATH}`)
      .data((d) => [d])
      .join('path')
      .attr('class', (d) => `${D3ClassName.COUNTY_PATH} ${D3ClassName.PATH_UID_PREFIX + this._getRegionCode(d)}`)
      .attr('d', (d) => setting(d).path(d))
      .attr('pointer-events', 'none');
  }

  /** 渲染地圖的鄉、鎮、市、區圖層 */
  private _renderTownshipLayer(regionCode: REGION_CODE): void {
    this._container.selectAll<SVGTextElement, GeoFeature>(`.${D3ClassName.TOWNSHIP_NAME}`).remove();
    this._container.selectAll<SVGPathElement, GeoFeature>(`.${D3ClassName.TOWNSHIP_PATH}`).remove();
    if (regionCode === REGION_CODE.ALL || !regionCode) return;

    const townshipCode = (feature: GeoFeature) => feature.properties.TOWNCODE as DISTRICT_CODE;
    const filteredFeatures = this._cachedTownshipFeatures.filter(
      (feature) => feature.properties.COUNTYCODE === regionCode,
    );
    this._container
      .select<SVGGElement>(`.${D3ClassName.REGION_UID_PREFIX + regionCode}`)
      .selectAll<SVGPathElement, GeoFeature>(`.${D3ClassName.TOWNSHIP_PATH}`)
      .data(filteredFeatures)
      .join('path')
      .attr('class', (d) => `${D3ClassName.TOWNSHIP_PATH} ${D3ClassName.PATH_UID_PREFIX + townshipCode(d)}`)
      .attr('d', (d) => this._getTargetPath(this._getRegionCode(d))(d))
      .on('mouseenter', (e: MouseEvent, d: GeoFeature) => this._renderHighlight(d, this._getTargetPath(regionCode)))
      .on('mouseleave', (e: MouseEvent) => this._renderHighlight(null, this._getTargetPath(regionCode)))
      .on('click', (e: MouseEvent, d: GeoFeature) => this._historyManagerService.district$.next(townshipCode(d)));

    this._renderPlaceNameLayer(filteredFeatures, D3ClassName.TOWNSHIP_NAME);
  }

  /** 切換離島矩形的可見性和互動性 */
  private _toggleOuterIslandRectFocusRender(isOuterIsland: boolean): void {
    this._container
      .selectAll('rect')
      .style('opacity', isOuterIsland ? '0' : '1')
      .style('pointer-events', isOuterIsland ? 'none' : 'auto');
  }

  /** 獲取指定區域的區域代碼 */
  private _getRegionCode(feature: GeoFeature): REGION_CODE {
    return feature.properties.COUNTYCODE as REGION_CODE;
  }

  /** 獲取指定區域的 D3 路徑生成器 */
  private _getTargetPath(regionCode: REGION_CODE): d3.GeoPath<any, d3.GeoPermissibleObjects> {
    const outerIslandSetting = this._outerIslandCountySettings.find((item) => item.code === regionCode);
    return !!outerIslandSetting ? outerIslandSetting.path : this._path;
  }

  /** 獲取指定區域的中心點位置 */
  private _getPathCentroid(feature: GeoFeature): [number, number] {
    const index = this._outerIslandCountySettings.findIndex((item) => item.code === this._getRegionCode(feature));
    const isOusterIslandCountyName = feature.properties.COUNTYCODE && !feature.properties.TOWNCODE;
    if (index !== -1 && isOusterIslandCountyName) {
      return [
        this._outerIslandCountySettings[index].x + this._outerIslandCountySettings[index].boxWidth / 2,
        this._outerIslandCountySettings[index].y + this._outerIslandCountySettings[index].boxHeight - 12,
      ];
    }

    return this._getTargetPath(this._getRegionCode(feature))
      .centroid(feature)
      .map((item, i) => item + (i * this._getTextFontSize()) / 2) as [number, number];
  }

  /** 獲取指定區域的文字大小 */
  private _getTextFontSize(): number {
    return 16 / this._currentZoom;
  }

  /** 獲取指定區域的文字特殊偏移量 */
  private _getTextTransform(feature: GeoFeature): string {
    const isCounty = !feature.properties.TOWNCODE;
    const translate = (regionCode: REGION_CODE, isCounty: boolean) => {
      if (!isCounty) return { x: 0, y: 0 };

      switch (regionCode) {
        case REGION_CODE.C:
          return { x: 30, y: -15 };
        case REGION_CODE.A:
          return { x: 5, y: 10 };
        case REGION_CODE.F:
          return { x: -5, y: 20 };
        case REGION_CODE.H:
          return { x: -15, y: -25 };
        case REGION_CODE.O:
          return { x: 35, y: -10 };
        case REGION_CODE.J:
          return { x: 5, y: 5 };
        case REGION_CODE.K:
          return { x: -5, y: 0 };
        case REGION_CODE.B:
          return { x: -20, y: 5 };
        case REGION_CODE.P:
          return { x: 0, y: -10 };
        case REGION_CODE.I:
          return { x: 0, y: 10 };
        case REGION_CODE.Q:
          return { x: 40, y: 0 };
        case REGION_CODE.E:
          return { x: 10, y: 0 };
        case REGION_CODE.T:
          return { x: -15, y: -30 };
        case REGION_CODE.U:
          return { x: 5, y: 0 };
        default:
          return { x: 0, y: 0 };
      }
    };
    const { x, y } = translate(this._getRegionCode(feature), isCounty);
    return `translate(${x}, ${y})`;
  }

  /** 獲取指定區域的文字內容 */
  private _getTextContent(feature: GeoFeature): string {
    if (!feature.properties.TOWNCODE) {
      if (this._countiesCode.includes(this._getRegionCode(feature))) {
        const convertText = (text: string) => (text === '連江' ? '馬祖' : text);
        return convertText(feature.properties.COUNTYNAME.replace('縣', ''));
      } else {
        return feature.properties.COUNTYNAME;
      }
    } else {
      return feature.properties.TOWNNAME;
    }
  }

  /** 渲染地名標籤圖層 */
  private _renderPlaceNameLayer(features: GeoFeature[], className: D3ClassName) {
    let section = this._container;
    if (className === D3ClassName.TOWNSHIP_NAME) {
      const regionCode = this._getRegionCode(features[0]);
      const index = this._outerIslandCountySettings.findIndex((item) => item.code === regionCode);
      if (index !== -1) section = section.select(`.${D3ClassName.REGION_UID_PREFIX + regionCode}`);
    }

    section
      .selectAll<SVGTextElement, GeoFeature>(`.${className}`)
      .data(features)
      .join('text')
      .attr('class', `${D3ClassName.INFO_TEXT} ${className}`)
      .attr('font-size', `${this._getTextFontSize()}px`)
      .attr('x', (d) => `${this._getPathCentroid(d)[0]}`)
      .attr('y', (d) => `${this._getPathCentroid(d)[1]}`)
      .attr('transform', (d) => this._getTextTransform(d))
      .text((d) => this._getTextContent(d))
      .raise();
  }

  /** 聚焦到特定縣市 */
  private _zoomToCounty(regionCode: REGION_CODE): d3.Transition<SVGGElement, unknown, null, undefined> | undefined {
    const feature = this._cachedCountyFeatures.find((f) => f.properties.COUNTYCODE === regionCode);
    if (feature === undefined) return;

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
      .interrupt()
      .transition()
      .duration(500)
      .attr('transform', `translate(${translate[0]},${translate[1]}) scale(${scale})`);
  }

  /** 聚焦到全部 */
  protected zoomToAllCounty(): d3.Transition<SVGGElement, unknown, null, undefined> {
    this._currentZoom = 1;
    return this._container.interrupt().transition().duration(500).attr('transform', `translate(0, 0) scale(1)`);
  }
}
