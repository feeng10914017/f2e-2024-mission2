import { DecimalPipe, NgClass } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { POLITICAL_PARTIES } from '../../core/constants/political-parties.const';
import { VotePercentage } from '../../core/types/vote-percentage.type';

@Component({
  selector: 'app-vote-percentage-bar',
  imports: [NgClass, DecimalPipe],
  template: `
    <div
      class="flex w-full overflow-hidden rounded-[500px]"
      [ngClass]="{ 'h-2': !visibleDesc, 'h-[18px]': visibleDesc }">
      @for (item of votePercentage; track $index) {
        <div
          class="flex min-h-full items-center justify-center overflow-hidden text-sm leading-[18px] text-white"
          [ngClass]="{ 'bg-gray-200': !POLITICAL_PARTIES[item.party] }"
          [style.flex-basis.%]="(item.voteCount / totalVote) * 100 + 1"
          [style.background]="POLITICAL_PARTIES[item.party] ? POLITICAL_PARTIES[item.party].REPRESENTATIVE_COLOR : ''">
          @if (visibleDesc) {
            {{ (item.voteCount / totalVote) * 100 | number: '1.2-2' }}%
          }
        </div>
      }
    </div>
  `,
  styles: ``,
  host: { class: 'block' },
})
export class VotePercentageBarComponent implements OnChanges {
  @Input({ required: true }) visibleDesc!: boolean;
  @Input({ required: true }) votePercentage!: VotePercentage[];

  protected readonly POLITICAL_PARTIES = POLITICAL_PARTIES;

  protected totalVote = 0;

  ngOnChanges(changes: SimpleChanges): void {
    const { votePercentage } = changes;
    if (!votePercentage) return;

    this.totalVote = (votePercentage.currentValue as VotePercentage[]).reduce((a, b) => a + (b.voteCount || 0), 0);
  }
}
