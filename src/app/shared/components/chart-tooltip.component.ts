import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { POLITICAL_PARTIES } from '../../core/constants/political-parties.const';
import { DataPoint } from './grouped-bar-chart.component';

@Component({
  selector: 'app-chart-tooltip',
  imports: [DecimalPipe],
  template: `
    <div class="grid gap-y-2 rounded-lg border border-solid border-gray-300 bg-white p-4 shadow">
      <h6 class="text-base font-bold text-dark">{{ title }}</h6>

      @for (item of dataList; track $index) {
        <div class="flex items-center justify-between gap-x-9 text-xs leading-5 text-dark">
          <div class="flex items-center gap-x-2">
            <div class="h-2 w-2 rounded-full" [style.background]="item.color"></div>
            <div>{{ POLITICAL_PARTIES[item.subgroupId].CN_FULL_NAME }}</div>
          </div>
          <div>{{ item.value | number: '1.2-2' }}{{ unit }}</div>
        </div>
      }
    </div>
  `,
  styles: ``,
})
export class ChartTooltipComponent {
  @Input() title = '';
  @Input() dataList: DataPoint[] = [];
  @Input() unit = '';

  protected readonly POLITICAL_PARTIES = POLITICAL_PARTIES;
}
