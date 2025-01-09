import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { POLITICAL_PARTIES } from '../../core/constants/political-parties.const';
import { AdminCollection } from '../../core/models/admin-collection.model';
import { ElectionInfo } from '../../core/models/election-info.model';
import { VotePercentage } from '../../core/types/vote-percentage.type';
import { VotePercentageBarComponent } from '../vote-percentage-bar/vote-percentage-bar.component';

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
          <th [style.max-width.%]="16">地區</th>
          <th [style.width.%]="24">得票率</th>
          <th [style.max-width.%]="8">當選人</th>
          <th [style.max-width.%]="16" class="text-right">投票數</th>
          <th [style.max-width.%]="16" class="text-right">投票率</th>
          <th [style.max-width.%]="20"></th>
        </tr>
      </thead>
      <tbody>
        @for (item of data; track $index) {
          <tr [class.cursor-pointer]="item.ADMIN_CODE" (click)="onItemClick(item.ADMIN_CODE)">
            <td>{{ item.ADMIN_NAME }}</td>
            <td><app-vote-percentage-bar [votePercentage]="item.VOTE_PERCENTAGE" [visibleDesc]="false" /></td>
            <td>
              <div class="flex items-center">
                <div class="mr-1 h-8 w-8 overflow-hidden rounded-full" [style.background]="item.WINNER_COLOR">
                  <img [src]="item.WINNER_IMG" alt="winner_img" class="pointer-events-none translate-y-1.5 scale-125" />
                </div>
                {{ item.WINNER_NAME }}
              </div>
            </td>
            <td class="text-right">{{ item.TOTAL_VOTES | number }}</td>
            <td class="text-right">{{ item.TURNOUT_RATE | number: '1.2-2' }}%</td>
            <td>
              @if (item.ADMIN_CODE) {
                <div class="flex items-center justify-end">
                  <img src="/images/icons/expand_more.png" alt="expand_more" class="-rotate-90" />
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
      @apply w-full table-fixed text-nowrap text-left text-sm text-dark;
    }

    thead {
      @apply bg-gray-200;
    }

    table thead th:first-child {
      @apply rounded-tl;
    }

    table thead th:last-child {
      @apply rounded-tr;
    }

    tbody tr {
      @apply border-b border-solid border-gray-300;
    }

    tr th:first-child,
    tr td:first-child {
      @apply ps-2;
    }

    tr th,
    tr td {
      @apply py-2 pe-6;
    }

    th {
      @apply font-normal;
    }

    tr td:first-child {
      @apply font-bold;
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
