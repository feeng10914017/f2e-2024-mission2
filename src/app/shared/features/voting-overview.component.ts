import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { POLITICAL_PARTIES } from '../../core/constants/political-parties.const';
import { AdminCollection } from '../../core/models/admin-collection.model';
import { ElectionInfo } from '../../core/models/election-info.model';
import { VotePercentage } from '../../core/types/vote-percentage.type';
import { VotePercentageBarComponent } from '../components/vote-percentage-bar.component';

type TableItem = {
  ADMIN_NAME: string;
  ADMIN_CODE: string;
  VOTE_PERCENTAGE: VotePercentage[];
  WINNER_NAME: string;
  WINNER_IMG: string;
  WINNER_COLOR: string;
  TOTAL_VOTES: number | null;
  TURNOUT_RATE: number | null;
};

@Component({
  selector: 'app-voting-overview',
  imports: [DecimalPipe, VotePercentageBarComponent],
  template: `
    <h5 class="mb-2 mt-4 text-xl font-bold text-dark">各區域投票總覽</h5>
    <table>
      <thead>
        <tr>
          <th>地區</th>
          <th>得票率</th>
          <th>當選人</th>
          <th>投票數</th>
          <th>投票率</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        @for (item of data; track $index) {
          <tr [class.cursor-pointer]="item.ADMIN_CODE" (click)="onItemClick(item.ADMIN_CODE)">
            <td>{{ item.ADMIN_NAME }}</td>
            <td>
              <div class="grid gap-y-1">
                <div class="flex items-center gap-x-2 xl:hidden">
                  <span class="text-light">當選人</span>
                  <div class="h-8 w-8 overflow-hidden rounded-full" [style.background]="item.WINNER_COLOR">
                    <img
                      [src]="item.WINNER_IMG"
                      alt="winner_img"
                      class="pointer-events-none translate-y-1.5 scale-125" />
                  </div>
                  {{ item.WINNER_NAME }}
                </div>
                <app-vote-percentage-bar class="py-1" [votePercentage]="item.VOTE_PERCENTAGE" [visibleDesc]="false" />
              </div>
            </td>
            <td>
              <div class="flex items-center gap-x-1">
                <div class="h-8 w-8 overflow-hidden rounded-full" [style.background]="item.WINNER_COLOR">
                  <img [src]="item.WINNER_IMG" alt="winner_img" class="pointer-events-none translate-y-1.5 scale-125" />
                </div>
                {{ item.WINNER_NAME }}
              </div>
            </td>
            <td>{{ item.TOTAL_VOTES | number }}</td>
            <td>{{ item.TURNOUT_RATE | number: '1.2-2' }}%</td>
            <td>
              @if (item.ADMIN_CODE) {
                <div class="flex items-center justify-end">
                  <div class="flex h-9 w-9 items-center justify-center">
                    <img src="images/icons/expand_more.png" alt="expand_more" class="-rotate-90" />
                  </div>
                </div>
              }
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    table {
      @apply w-full text-nowrap text-left text-sm text-dark;
    }

    thead tr {
      @apply bg-gray-200;

      th {
        @apply font-normal;

        &:first-child {
          @apply rounded-tl;
        }

        &:last-child {
          @apply rounded-tr;
        }

        &:nth-child(1) {
          @apply xl:w-[16%];
        }
        &:nth-child(2) {
          @apply w-full xl:w-[24%];
        }
        &:nth-child(3) {
          @apply xl:w-[8%];
        }
        &:nth-child(4) {
          @apply xl:w-[16%];
        }
        &:nth-child(5) {
          @apply xl:w-[16%];
        }
        &:nth-child(6) {
          @apply xl:w-[20%];
        }
      }
    }

    tbody tr {
      @apply border-b border-solid border-gray-300;

      td:first-child {
        @apply align-baseline font-bold leading-8 xl:align-middle xl:leading-5;
      }
    }

    tr th,
    tr td {
      @apply py-3 xl:py-1 xl:pe-6;

      &:first-child {
        @apply pe-8 ps-2 xl:pe-6;
      }

      &:nth-child(4),
      &:nth-child(5) {
        @apply text-right;
      }

      &:nth-child(3),
      &:nth-child(4),
      &:nth-child(5) {
        @apply hidden xl:table-cell;
      }
    }
  `,
})
export class VotingOverviewComponent implements OnChanges {
  @Input({ required: true }) electionInfo: ElectionInfo | undefined;
  @Input({ required: true }) candidateNoOrder: number[] = [];

  @Output() adminChange$ = new EventEmitter<string>();

  protected data: TableItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const { electionInfo } = changes;
    if (!electionInfo || !electionInfo.currentValue) return;

    setTimeout(() => this._handleTableData(), 0);
  }

  private _handleTableData(): void {
    if (!this.electionInfo) return;

    this.data = this.electionInfo.ADMIN_COLLECTION.map((item: AdminCollection): TableItem => {
      const VOTE_PERCENTAGE: VotePercentage[] = this.candidateNoOrder
        .map((no) => no - 1)
        .map((i) => {
          return {
            party: this.electionInfo?.CANDIDATES[i]?.PARTY || '',
            voteCount: item.CANDIDATES_VOTES[i].VOTE_COUNT || 0,
          };
        });

      const maxCandidateNo = item.CANDIDATES_VOTES.reduce((max, current) => {
        return (current.VOTE_COUNT || 0) > (max.VOTE_COUNT || 0) ? current : max;
      }).NO;
      const candidate = this.electionInfo?.CANDIDATES.find((c) => c.NO == maxCandidateNo);
      return {
        ADMIN_NAME: item.ADMIN_NAME,
        ADMIN_CODE: item.ADMIN_CODE,
        VOTE_PERCENTAGE: VOTE_PERCENTAGE,
        WINNER_NAME: candidate?.PRESIDENT || 'Unknown Winner',
        WINNER_IMG: candidate ? POLITICAL_PARTIES[candidate.PARTY].PRESIDENT_3D_IMG : '',
        WINNER_COLOR: candidate ? POLITICAL_PARTIES[candidate.PARTY].REPRESENTATIVE_COLOR : '',
        TOTAL_VOTES: item.TOTAL_VOTES,
        TURNOUT_RATE: item.TURNOUT_RATE,
      };
    });
  }

  protected onItemClick(ADMIN_CODE: string): void {
    if (!ADMIN_CODE) return;

    this.adminChange$.emit(ADMIN_CODE);
  }
}
