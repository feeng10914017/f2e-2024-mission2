import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, ComponentRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { IPoliticalParty } from '../../core/interfaces/i-political-party.interface';
import { ChartTooltipComponent } from '../components/chart-tooltip.component';
import { BarGroupPointerEvent, DataPoint, GroupedBarChartComponent } from '../components/grouped-bar-chart.component';

@Component({
  selector: 'app-historical-party-vote-counts',
  imports: [GroupedBarChartComponent],
  template: `
    <div class="rounded-xl border border-solid border-gray-300 bg-white">
      <div class="flex items-center justify-between px-4 pb-3 pt-6">
        <h5 class="text-xl font-bold text-dark">歷屆政黨得票數</h5>

        <div class="flex items-center gap-x-1">
          @for (item of activePartyOrder; track $index) {
            <button type="button" class="flex items-center gap-x-1" (click)="onFilter($index)">
              <div class="h-2 w-2 rounded-full" [style.background]="item.REPRESENTATIVE_COLOR"></div>
              <div class="text-xs leading-5 text-dark" [class.line-through]="filterStateList[$index]">
                {{ item.CN_FULL_NAME }}
              </div>
            </button>
          }
        </div>
      </div>

      <div class="relative h-64 px-4 pb-6 pt-3">
        @if (!isLoaded) {
          <div class="flex h-full flex-col justify-evenly">
            @for (item of [].constructor(4); track $index) {
              <div class="cmp-loading h-8"></div>
            }
          </div>
        } @else {
          <app-grouped-bar-chart
            class="block h-full"
            [data]="filteredCounts"
            (onPointer)="toggleTooltip$.next($event)" />

          @if (historicalVoteCounts.length === 0) {
            <div class="-translate-1/2 absolute left-1/2 top-1/2 text-base text-dark">暫無資料</div>
          }
        }
      </div>
    </div>
  `,
  styles: ``,
})
export class HistoricalPartyVoteCountsComponent implements OnChanges, OnInit, OnDestroy {
  @Input({ required: true }) isLoaded!: boolean;
  @Input({ required: true }) activePartyOrder: IPoliticalParty[] = [];
  @Input({ required: true }) historicalVoteCounts: DataPoint[] = [];

  private readonly _overlay = inject(Overlay);
  private readonly _overlayPositionBuilder = inject(OverlayPositionBuilder);
  private readonly _destroy = new Subject<void>();
  private _overlayRef: OverlayRef | null = null;
  private _tooltipRef: ComponentRef<ChartTooltipComponent> | null = null;

  protected readonly toggleTooltip$ = new Subject<BarGroupPointerEvent>();
  protected filterStateList: boolean[] = [];
  protected originalCounts: DataPoint[] = [];
  protected filteredCounts: DataPoint[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const { activePartyOrder, historicalVoteCounts } = changes;

    if (activePartyOrder) {
      const list = activePartyOrder.currentValue as IPoliticalParty[];
      this.filterStateList = list.map(() => false);
    }

    if (historicalVoteCounts) {
      this.originalCounts = historicalVoteCounts.currentValue;
      this.filteredCounts = historicalVoteCounts.currentValue;
    }
  }

  ngOnInit(): void {
    this.toggleTooltip$.pipe(takeUntil(this._destroy)).subscribe((e) => {
      const isShowTooltip = e.event.type === 'pointerover';
      isShowTooltip ? this._showTooltip(e) : this._hiddenTooltip(e);
    });
  }

  ngOnDestroy(): void {
    this._overlayRef?.dispose();
    this._destroy.next();
    this._destroy.complete();
  }

  private _showTooltip(e: BarGroupPointerEvent): void {
    const element = e.event.target as HTMLElement;
    if (!document.body.contains(element)) return;

    const positionStrategy = this._overlayPositionBuilder
      .flexibleConnectedTo(element)
      .withPush(false)
      .withPositions([{ originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' }]);

    if (this._overlayRef === null) {
      this._overlayRef = this._overlay.create({
        positionStrategy,
        scrollStrategy: this._overlay.scrollStrategies.reposition(),
        panelClass: '!pointer-event-none',
      });
    }

    if (this._tooltipRef === null) {
      const portal = new ComponentPortal(ChartTooltipComponent);
      this._tooltipRef = this._overlayRef.attach(portal);
    }

    this._tooltipRef.instance.title = e.data[0].groupId + '年得票數';
    this._tooltipRef.instance.unit = '票';
    this._tooltipRef.instance.dataList = e.data;
    this._overlayRef.updatePositionStrategy(positionStrategy);
    this._overlayRef.updatePosition();
  }

  private _hiddenTooltip(event: BarGroupPointerEvent): void {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
      this._tooltipRef = null;
    }
  }

  protected onFilter(index: number): void {
    this.filterStateList[index] = !this.filterStateList[index];

    const activeParties = this.activePartyOrder
      .map((item) => item.EN_SHORT_NAME)
      .filter((item, index) => !this.filterStateList[index]);
    this.filteredCounts = this.originalCounts.filter((item) => activeParties.includes(item.subgroupId));
  }
}
