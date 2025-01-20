import { DecimalPipe, NgClass } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { POLITICAL_PARTIES } from '../../core/constants/political-parties.const';
import { AdminCollection } from '../../core/models/admin-collection.model';
import { CandidatePair } from '../../core/models/candidate-pair.model';
import { CandidateVote } from '../../core/models/candidate-vote.model';
import { ElectionInfo } from '../../core/models/election-info.model';
import { VotePercentage } from '../../core/types/vote-percentage.type';
import { VotePercentageBarComponent } from '../components/vote-percentage-bar.component';

@Component({
  selector: 'app-presidential-votes',
  imports: [NgClass, DecimalPipe, VotePercentageBarComponent],
  template: `
    <div class="rounded-xl bg-gray-200 px-4 pb-4 pt-6">
      <h5 class="mb-4 text-xl font-bold text-dark">總統得票數</h5>
      <div class="3xl:grid-cols-2 grid gap-4 xl:grid-flow-col xl:grid-cols-2 2xl:grid-cols-[3fr_2fr]">
        <div class="grid gap-y-3 rounded-xl bg-white px-6 py-4 md:py-8">
          <div class="grid gap-y-2 md:grid-flow-col md:grid-cols-3">
            @for (item of candidates; track $index; let first = $first) {
              <div
                class="flex"
                [ngClass]="{
                  'md:justify-start': $index === 0,
                  'md:justify-center': $index === 1,
                  'md:justify-end': $index === 2,
                }">
                <div class="grid w-full basis-[200px] grid-flow-col grid-cols-[auto_1fr] gap-x-3">
                  <div
                    class="h-12 w-12 overflow-hidden rounded-2xl"
                    [ngClass]="{ 'cmp-loading': !isLoaded, 'bg-gray-200': isLoaded && !electionInfo }">
                    @if (POLITICAL_PARTIES[item.PARTY]; as party) {
                      <div
                        class="flex h-full w-full items-center justify-center"
                        [style.background]="party.REPRESENTATIVE_COLOR">
                        <img
                          class="pointer-events-none translate-y-[23%] scale-[135%]"
                          [src]="party.PRESIDENT_3D_IMG"
                          [alt]="party.EN_SHORT_NAME" />
                      </div>
                    }
                  </div>

                  <div class="grid grid-flow-row gap-y-[2px]">
                    <div class="text-sm text-light" [ngClass]="{ 'cmp-loading': !isLoaded }">
                      {{ POLITICAL_PARTIES[item.PARTY] ? POLITICAL_PARTIES[item.PARTY].CN_FULL_NAME : '暫無資料' }}
                    </div>
                    <div class="flex items-center justify-start gap-x-1" [ngClass]="{ 'cmp-loading': !isLoaded }">
                      <div class="text-dark">{{ item.PRESIDENT || '暫無資料' }}</div>
                      @if (electionInfo && $first && !!candidatesVotes[$index].VOTE_COUNT) {
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7.32031 13.1797L14.8203 5.67969L13.6484 4.46875L7.32031 10.7969L4.35156 7.82812L3.17969 9L7.32031 13.1797ZM3.10156 3.14062C4.74219 1.5 6.70833 0.679688 9 0.679688C11.2917 0.679688 13.2448 1.5 14.8594 3.14062C16.5 4.75521 17.3203 6.70833 17.3203 9C17.3203 11.2917 16.5 13.2578 14.8594 14.8984C13.2448 16.513 11.2917 17.3203 9 17.3203C6.70833 17.3203 4.74219 16.513 3.10156 14.8984C1.48698 13.2578 0.679688 11.2917 0.679688 9C0.679688 6.70833 1.48698 4.75521 3.10156 3.14062Z"
                            fill="#D4009B" />
                        </svg>
                      }
                    </div>
                    <div class="font-bold text-dark" [ngClass]="{ 'cmp-loading': !isLoaded }">
                      {{ candidatesVotes[$index].VOTE_COUNT || 0 | number }}票
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
          <div>
            <app-vote-percentage-bar
              [ngClass]="{ 'cmp-loading': !isLoaded }"
              [votePercentage]="votePercentage"
              [visibleDesc]="true" />
          </div>
        </div>

        <div class="rounded-xl bg-white px-6 py-4 md:py-8">
          <div class="flex h-full items-center">
            <div class="basis-40 sm:grow md:basis-32">
              <div
                class="h-[124px] w-[124px] overflow-hidden rounded-full bg-red-300"
                [ngClass]="{ 'cmp-loading': !isLoaded }"></div>
            </div>
            <div class="grid-col-1 grid grow-[5] auto-rows-fr gap-x-2 gap-y-4 sm:grid-cols-2">
              <div class="statistic-item" [ngClass]="{ 'cmp-loading after:max-w-[90%]': !isLoaded }">
                <div class="text-sm text-light">投票數</div>
                <div class="font-bold text-dark">{{ totalStatistics.TOTAL_VOTES || 0 | number }}</div>
              </div>
              <div class="statistic-item" [ngClass]="{ 'cmp-loading after:max-w-[90%]': !isLoaded }">
                <div class="text-sm text-light">投票率</div>
                <div class="font-bold text-dark">{{ totalStatistics.TURNOUT_RATE || 0 | number: '1.2-2' }}%</div>
              </div>
              <div class="statistic-item" [ngClass]="{ 'cmp-loading after:max-w-[90%]': !isLoaded }">
                <div class="text-sm text-light">有效票數</div>
                <div class="font-bold text-dark">{{ totalStatistics.VALID_VOTES || 0 | number }}</div>
              </div>
              <div class="statistic-item" [ngClass]="{ 'cmp-loading after:max-w-[90%]': !isLoaded }">
                <div class="text-sm text-light">無效票數</div>
                <div class="font-bold text-dark">{{ totalStatistics.INVALID_VOTES || 0 | number }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .statistic-item {
      @apply grid grid-rows-[auto_1fr] gap-y-1;
    }
  `,
})
export class PresidentialVotesComponent implements OnChanges {
  @Input({ required: true }) isLoaded!: boolean;
  @Input({ required: true }) electionInfo: ElectionInfo | undefined;
  @Input({ required: true }) candidateNoOrder: number[] = [];

  protected readonly POLITICAL_PARTIES = POLITICAL_PARTIES;

  protected candidates!: CandidatePair[];
  protected candidatesVotes!: CandidateVote[];
  protected totalStatistics!: AdminCollection;
  protected votePercentage: VotePercentage[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const { electionInfo, candidateNoOrder } = changes;

    if (electionInfo) {
      const data: ElectionInfo | undefined = electionInfo.currentValue;
      this.candidates = data ? [...data.CANDIDATES] : Array(3).fill(new CandidatePair());
      this.candidatesVotes = data ? [...data.TOTAL_STATISTICS.CANDIDATES_VOTES] : Array(3).fill(new CandidateVote());
      this.totalStatistics = data ? { ...data.TOTAL_STATISTICS } : new AdminCollection();
    }

    if (candidateNoOrder) {
      const orders = candidateNoOrder.currentValue as number[];
      if (orders.length > 0) {
        this.candidates = orders
          .map((n) => n - 1)
          .reduce((acc, i, index) => {
            acc[index] = this.candidates[i];
            return acc;
          }, [] as CandidatePair[]);

        this.candidatesVotes = orders
          .map((n) => n - 1)
          .reduce((acc, i, index) => {
            acc[index] = this.candidatesVotes[i];
            return acc;
          }, [] as CandidateVote[]);
      }
    }

    if (electionInfo) {
      const data: ElectionInfo | undefined = electionInfo.currentValue;
      this.votePercentage = data
        ? this.candidates.map((c, i) => ({
            party: c.PARTY || '',
            voteCount: this.candidatesVotes[i].VOTE_COUNT || 0,
          }))
        : [];
    }
  }
}
