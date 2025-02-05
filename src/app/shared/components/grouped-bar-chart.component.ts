import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import * as d3 from 'd3';
import { delay, Subject, takeUntil, throttleTime } from 'rxjs';
import { D3ClassName } from '../../core/enums/d3-class.enum';
import { CommonService } from '../../core/services/common.service';

export type DataPoint = { groupId: string; subgroupId: string; value: number; color: string };
export type BarGroupPointerEvent = { event: PointerEvent; data: DataPoint[] };

@Component({
  selector: 'app-grouped-bar-chart',
  imports: [],
  template: ``,
  styles: ``,
  host: { class: 'block' },
})
export class GroupedBarChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: DataPoint[] = [];
  @Input() marginTop = 24;
  @Input() marginRight = 0;
  @Input() marginBottom = 28;
  @Input() marginLeft = 56;
  @Input() groupGap = 0.2;
  @Input() barGap = 0.2;
  @Input() tickInnerGap = 16;
  @Input() tickCount = 4;
  @Output() onPointer = new EventEmitter<BarGroupPointerEvent>();

  private readonly _elementRef = inject(ElementRef);
  private readonly _commonService = inject(CommonService);

  private width = 124;
  private height = 124;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private chartG!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private yAxisG!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private yScale!: d3.ScaleLinear<number, number>;
  private groups: string[] = [];
  private subgroups: string[] = [];

  private readonly _destroy = new Subject<null>();

  ngAfterViewInit() {
    this._initializeChart();

    this._commonService
      .createResizeObservable(this._elementRef.nativeElement)
      .pipe(takeUntil(this._destroy), throttleTime(50), delay(0))
      .subscribe(() => this._updateChartLayout(this.data));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.svg) return;

    if (
      changes['width'] ||
      changes['height'] ||
      changes['marginTop'] ||
      changes['marginRight'] ||
      changes['marginBottom'] ||
      changes['marginLeft'] ||
      changes['groupGap'] ||
      changes['barGap']
    ) {
      const data = changes['data'] ? changes['data'].currentValue : this.data;
      this._updateChartLayout(data);
    }

    if (changes['data']) {
      this._updateChartRender(changes['data'].currentValue);
    }
  }

  ngOnDestroy(): void {
    this._destroy.next(null);
    this._destroy.complete();
  }

  private _initializeChart(): void {
    // 建立 SVG 元素
    this.svg = d3.select(this._elementRef.nativeElement).append('svg');

    // 建立 Y 軸群組
    this.yAxisG = this.svg.append('g');

    // 建立圖表群組
    this.chartG = this.svg.append('g');

    this._updateChartLayout(this.data);
  }

  private _updateChartLayout(data: DataPoint[]): void {
    this.width = this._elementRef.nativeElement.clientWidth;
    this.height = this._elementRef.nativeElement.clientHeight;
    this.svg.attr('width', this.width).attr('height', this.height).attr('viewBox', [0, 0, this.width, this.height]);

    this._updateChartRender(data);
  }

  private _updateChartRender(data: DataPoint[]): void {
    // 更新群組和子群組
    this.groups = Array.from(new Set(data.map((d) => d.groupId)));
    this.subgroups = Array.from(new Set(data.map((d) => d.subgroupId)));

    const availableWidth = this.width - this.marginLeft - this.tickInnerGap - this.marginRight;
    const groupWidth = this.groups.length === 0 ? 0 : availableWidth / this.groups.length;
    this._updateYAxis(availableWidth, data);
    this._updateGroupBars(groupWidth, data);
    this._updateLabels(groupWidth);
  }

  private _calculateTickValues(maxValue: number, count: number): number[] {
    const tickValues = d3.ticks(0, maxValue, count);
    if (tickValues[tickValues.length - 1] < maxValue) {
      tickValues[tickValues.length] = tickValues[tickValues.length - 1] + tickValues[1];
    }

    let step = tickValues[tickValues.length - 1] / count;
    const stepLength = String(step).length;
    if (stepLength >= 4) {
      let firstDigit = Number(String(step).slice(0, 1));
      let secondDigit = Number(String(step).slice(1, 2));
      if (secondDigit < 5 && secondDigit !== 0) {
        secondDigit = 5;
      } else if (secondDigit > 5) {
        firstDigit += 1;
        secondDigit = 0;
      }
      step = Number(`${firstDigit}${secondDigit}`.padEnd(stepLength, '0'));
    }

    const defaultValues = [0, 1000, 2000, 3000, 4000];
    const values = Array(count + 1)
      .fill(step)
      .map((step, i) => step * i);
    return values.every((v) => v === 0) ? defaultValues : values;
  }

  /** 更新 Y軸 */
  private _updateYAxis(availableWidth: number, data: DataPoint[]): void {
    // 計算具體的刻度值
    const maxValue = d3.max(data, (d) => d.value) ?? 0;
    const tickValues = this._calculateTickValues(maxValue, this.tickCount);

    // 更新 Y 軸比例尺
    this.yScale = d3
      .scaleLinear()
      .domain([0, tickValues[tickValues.length - 1]])
      .range([this.height - this.marginBottom, this.marginTop]);

    // 更新 Y 軸
    const replacementBaseline = 10000;
    const canReplaceUnit = tickValues[1] >= replacementBaseline;
    const yAxis = d3
      .axisLeft(this.yScale)
      .tickValues(tickValues)
      .tickFormat((d) => {
        const count = Number(d);
        const value = canReplaceUnit ? count / replacementBaseline : count;
        const unit = canReplaceUnit && value ? '萬' : '';
        return Math.trunc(value).toLocaleString() + unit;
      })
      .tickPadding(this.marginLeft - this.tickInnerGap)
      .tickSizeInner(0)
      .tickSizeOuter(0);

    this.yAxisG
      .attr('transform', `translate(${this.marginLeft + this.tickInnerGap},0)`)
      .call(yAxis)
      .call((g) => g.select('.domain').remove())
      .call((g) => {
        g.selectAll('.tick line').attr('x2', availableWidth).attr('stroke', '#DEE2E6');
        g.selectAll('.tick text').attr('class', D3ClassName.CHART_LABEL);
      });
  }

  /** 更新 bars 群組 */
  private _updateGroupBars(groupWidth: number, data: DataPoint[]): void {
    // 計算尺寸
    const barWidth = (groupWidth * (1 - this.groupGap)) / this.subgroups.length;

    // 更新或創建條形圖
    const groupedData = d3.group(data, (d) => d.groupId);

    // 更新主要群組
    const groups = this.chartG
      .selectAll<SVGGElement, [string, DataPoint[]]>('g.' + D3ClassName.CHART_DATA_GROUP)
      .data(Array.from(groupedData.entries()));
    groups.exit().remove();

    const groupsEnter = groups.enter().append('g').attr('class', D3ClassName.CHART_DATA_GROUP);
    const groupsMerge = groupsEnter
      .merge(groups)
      .attr('transform', (_, i) => `translate(${this.marginLeft + this.tickInnerGap + i * groupWidth},0)`)
      .on('pointerover', (event, d) => this.onPointer.emit({ event, data: d[1] }))
      .on('pointerleave', (event, d) => this.onPointer.emit({ event, data: d[1] }));

    // 更新條形圖
    const bars = groupsMerge.selectAll<SVGRectElement, DataPoint>('rect').data(([_, values]) => values);
    bars.exit().remove();
    bars
      .enter()
      .append('rect')
      .merge(bars)
      .transition()
      .duration(500)
      .attr('x', (d) => {
        const subgroupIndex = this.subgroups.indexOf(d.subgroupId);
        return subgroupIndex * barWidth + (this.groupGap * groupWidth) / 2;
      })
      .attr('y', (d) => this.yScale(d.value))
      .attr('width', barWidth * (1 - this.barGap))
      .attr('height', (d) => this.yScale(0) - this.yScale(d.value))
      .attr('fill', (d) => d.color);
  }

  /** 更新群組標籤 */
  private _updateLabels(groupWidth: number): void {
    const groupLabels = this.svg
      .selectAll<SVGTextElement, string>('text.' + D3ClassName.CHART_X_LABEL)
      .data(this.groups);

    groupLabels.exit().remove();

    groupLabels
      .enter()
      .append('text')
      .attr('class', D3ClassName.CHART_LABEL + ' ' + D3ClassName.CHART_X_LABEL)
      .merge(groupLabels)
      .attr('x', (_, i) => this.marginLeft + this.tickInnerGap + i * groupWidth + groupWidth / 2)
      .attr('y', this.height)
      .text((d) => d);
  }
}
