import { Component } from '@angular/core';

@Component({
  selector: 'app-voting-overview',
  imports: [],
  template: `
    <h5 class="mb-2 mt-4 text-xl font-bold text-dark">各區域投票總覽</h5>
    <table>
      <thead>
        <tr>
          <th [style.width.%]="16">地區</th>
          <th [style.width.%]="26">得票率</th>
          <th [style.width.%]="16">當選人</th>
          <th [style.width.%]="16">投票數</th>
          <th [style.width.%]="26">投票率</th>
        </tr>
      </thead>
      <tbody>
        @for (item of [].constructor(15); track $index) {
          <tr class="cursor-pointer">
            <td>地區</td>
            <td>得票率</td>
            <td>當選人</td>
            <td>投票數</td>
            <td>
              <div class="flex items-center justify-between">
                投票率
                <img src="/images/icons/expand_more.png" alt="expand_more" class="-rotate-90" />
              </div>
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    table {
      @apply w-full table-fixed text-left text-sm text-dark;
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
export class VotingOverviewComponent {}
