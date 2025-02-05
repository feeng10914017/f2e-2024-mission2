import { Component, Input } from '@angular/core';
import { IPoliticalParty } from '../../core/interfaces/i-political-party.interface';
import { BarGroupPointerEvent, DataPoint } from '../components/grouped-bar-chart.component';
import { GroupedLineChartComponent } from '../components/grouped-line-chart.component';

@Component({
  selector: 'app-historical-party-vote-rates',
  imports: [GroupedLineChartComponent],
  template: `
    <div class="rounded-xl border border-solid border-gray-300 bg-white">
      <div class="flex items-center justify-between px-4 pb-3 pt-6">
        <h5 class="text-xl font-bold text-dark">歷屆政黨得票率</h5>

        <div class="flex items-center gap-x-1">
          @for (item of activePartyOrder; track $index) {
            <div class="h-2 w-2 rounded-full" [style.background]="item.REPRESENTATIVE_COLOR"></div>
            <div class="text-xs leading-5 text-dark">{{ item.CN_FULL_NAME }}</div>
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
          <app-grouped-line-chart
            class="block h-full"
            [data]="historicalVoteRates"
            (onPointer)="toggleVotesOverlay($event)" />

          @if (historicalVoteRates.length === 0) {
            <div class="-translate-1/2 absolute left-1/2 top-1/2 text-base text-dark">暫無資料</div>
          }
        }
      </div>
    </div>
  `,
  styles: ``,
})
export class HistoricalPartyVoteRatesComponent {
  @Input({ required: true }) isLoaded!: boolean;
  @Input({ required: true }) activePartyOrder: IPoliticalParty[] = [];
  @Input({ required: true }) historicalVoteRates: DataPoint[] = [];

  protected toggleVotesOverlay(event: BarGroupPointerEvent): void {
    // TODO: add material overlay functionality
  }

  //TODO: add party filter functionality
}
