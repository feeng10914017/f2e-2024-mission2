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
import { BarGroupPointerEvent, DataPoint } from './grouped-bar-chart.component';

@Component({
  selector: 'app-grouped-line-chart',
  imports: [],
  template: ``,
  host: { class: 'block' },
})
export class GroupedLineChartComponent implements OnChanges, AfterViewInit, OnDestroy {
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
    this._updateYAxis(availableWidth);
    this._updateGroupLines(groupWidth, data);
    this._updateLabels(groupWidth);
  }

  /** 更新 Y軸 */
  private _updateYAxis(availableWidth: number): void {
    // 更新 Y 軸比例尺
    this.yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([this.height - this.marginBottom, this.marginTop]);

    const yAxis = d3
      .axisLeft(this.yScale)
      .tickValues([0, 0.2, 0.4, 0.6, 0.8, 1])
      .tickFormat((d) => Number(d) * 100 + '%')
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

  /** 更新 line 群組 */
  private _updateGroupLines(groupWidth: number, data: DataPoint[]): void {
    // 首先按 subgroupId 分組
    const groupedData = d3.group(data, (d) => d.subgroupId);

    // 獲取所有唯一的 groupId
    const subgroups = Array.from(new Set(data.map((d) => d.groupId)));

    // 設置 scales 並創建線條生成器
    const x = d3
      .scalePoint()
      .domain(subgroups)
      .range([this.marginLeft + this.tickInnerGap + groupWidth / 2, this.width - this.marginRight - groupWidth / 2]);
    const y = d3
      .scaleLinear()
      .domain([0, 1])
      .range([this.height - this.marginBottom, this.marginTop]);
    const line = d3
      .line<DataPoint>()
      .x((d) => x(d.groupId) ?? 0)
      .y((d) => y(d.value));

    // 更新或創建線條組
    const groups = this.chartG
      .selectAll<SVGGElement, [string, DataPoint[]]>('g.' + D3ClassName.CHART_DATA_GROUP)
      .data(groupedData);
    groups.exit().remove();

    // 創建新的組
    const groupsEnter = groups.enter().append('g').attr('class', D3ClassName.CHART_DATA_GROUP);
    const groupsMerge = groupsEnter.merge(groups); // 合併現有和新的組

    // 更新每個組線條
    const lines = groupsMerge.selectAll<SVGPathElement, DataPoint[]>('path').data((d) => [d[1]]); // 將每組的數據點數組作為一條線的數據
    lines.exit().remove(); // 移除不需要的線條
    lines // 更新或創建新的線條
      .enter()
      .append('path')
      .merge(lines)
      .transition()
      .duration(500)
      .attr('fill', 'none')
      .attr('stroke', (d) => d[0].color)
      .attr('stroke-width', 1.5)
      .attr('d', (d) => line(d));

    // 更新每個組數據點
    const circles = groupsMerge.selectAll<SVGCircleElement, DataPoint>('circle').data((d) => d[1]);
    circles.exit().remove(); // 移除不需要的點

    const circlesEnter = circles.enter().append('circle');
    circlesEnter // 更新或創建新的點
      .merge(circles)
      .transition()
      .duration(500)
      .attr('cx', (d) => x(d.groupId) ?? 0)
      .attr('cy', (d) => y(d.value))
      .attr('r', 3)
      .attr('fill', (d) => d.color);
    circles
      .merge(circlesEnter)
      .on('pointerover', (event, d) => {
        const sameGroupData = data.filter((point) => point.groupId === d.groupId);
        this.onPointer.emit({ event, data: sameGroupData });
      })
      .on('pointerleave', (event, d) => {
        const sameGroupData = data.filter((point) => point.groupId === d.groupId);
        this.onPointer.emit({ event, data: sameGroupData });
      });

    this._updateLabels(groupWidth);
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
