import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import * as d3 from 'd3';
import { delay, Subject, takeUntil, throttleTime } from 'rxjs';
import { CommonService } from '../../core/services/common.service';

// 定義圓弧數據的接口
interface ArcData {
  endAngle: number;
}

// 定義 D3 arc 生成器的類型
type D3Arc = d3.Arc<any, ArcData>;

@Component({
  selector: 'app-pip-chart',
  imports: [],
  template: ``,
  styles: ``,
})
export class PipChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input({ required: true }) turnoutRate: number | null = null;

  private readonly _elementRef = inject(ElementRef);
  private readonly _commonService = inject(CommonService);

  private _width = 124;
  private _height = 124;
  private _svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private _g!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private _background!: d3.Selection<SVGPathElement, ArcData, null, undefined>;
  private _foreground!: d3.Selection<SVGPathElement, ArcData, null, undefined>;
  private _arc!: D3Arc;

  private readonly _tau = 2 * Math.PI;
  private readonly _destroy = new Subject<null>();

  ngOnChanges(changes: SimpleChanges): void {
    const { turnoutRate } = changes;
    if (!turnoutRate) return;

    this._updatePipRender(turnoutRate.currentValue);
  }
  ngAfterViewInit(): void {
    this._commonService
      .createResizeObservable(this._elementRef.nativeElement)
      .pipe(takeUntil(this._destroy), throttleTime(50), delay(0))
      .subscribe(() => this._updatePipLayout());

    this._initializeChart();
  }

  ngOnDestroy(): void {
    this._destroy.next(null);
    this._destroy.complete();
  }

  private _initializeChart(): void {
    const height = Math.min(this._height, this._width);
    const outerRadius = height / 2;
    const innerRadius = outerRadius - 12;
    this._svg = d3.select(this._elementRef.nativeElement).append('svg');
    this._g = this._svg.append('g');
    this._arc = d3.arc<ArcData>().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(0);
    this._background = this._g
      .append('path')
      .datum({ endAngle: this._tau })
      .style('fill', '#E2E8F0')
      .attr('d', this._arc);
    this._foreground = this._g
      .append('path')
      .datum({ endAngle: 0 * this._tau })
      .style('fill', '#D4009B')
      .attr('d', this._arc);

    this._updatePipLayout();
    this._updatePipRender(this.turnoutRate);
  }

  private _updateSvgDimensions(): void {
    this._width = this._elementRef.nativeElement.clientWidth;
    this._height = this._elementRef.nativeElement.clientHeight;
  }

  private _updatePipLayout(): void {
    this._updateSvgDimensions();
    this._svg.attr('viewBox', [0, 0, this._width, this._height]);
    this._g.attr('transform', 'translate(' + this._width / 2 + ',' + this._height / 2 + ')');
    this._background.attr('d', this._arc);
    this._foreground.attr('d', this._arc);
  }

  private _updatePipRender(newAngle: number | null): void {
    if (!this._foreground) return;

    this._foreground
      .transition()
      .duration(750)
      .attrTween('d', this._arcTween(((newAngle || 0) / 100) * this._tau));
  }

  private _arcTween(newAngle: number) {
    // 返回一個用於 transition.attrTween 的函數
    return (d: ArcData) => {
      // d3.interpolate 返回的插值器函數類型
      const interpolate: (t: number) => number = d3.interpolate(d.endAngle, newAngle);

      // 返回一個用於每個動畫幀的函數
      return (t: number) => {
        // 更新數據對象的 endAngle
        d.endAngle = interpolate(t);

        // 使用 arc 生成器創建新的路徑字符串
        return this._arc(d) || '';
      };
    };
  }
}
