import { Component, inject, Inject } from '@angular/core';
import { catchError, lastValueFrom, of } from 'rxjs';
import { POLITICAL_PARTIES } from '../../../core/constants/political-parties.const';
import { DISTRICT_CODE } from '../../../core/enums/district-code.enum';
import { REGION_CODE } from '../../../core/enums/region-code.enum';
import { ElectionInfo } from '../../../core/models/election-info.model';
import { ApiService } from '../../../core/services/api.service';
import { DIALOG_DATA, DialogRef } from '../../../core/services/dialog.service';
import { GeoFeature } from '../../../core/types/geo-feature.type';
import { ZhTwMapComponent } from '../../layouts/zh-tw-map.component';

export type MobileMapSelectorData = {
  regionFeatures: GeoFeature[];
  districtFeatures: GeoFeature[];
  mapColorConfig: Record<string, string>;
  gregorianYear: string;
};

export type MobileMapSelectorResult = { regionCode: REGION_CODE; districtCode: DISTRICT_CODE };

@Component({
  selector: 'app-mobile-map-selector',
  imports: [ZhTwMapComponent],
  template: `
    <div class="flex h-[calc(100dvh_-_48px)] w-[calc(100dvw_-_24px)] flex-col rounded-2xl bg-white shadow">
      <div class="flex items-center justify-between px-4 py-3">
        <h3 class="text-base font-bold text-dark">台灣地圖</h3>
        <button type="button" class="flex size-5 items-center justify-center rounded-full" (click)="cancel()">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13.1797 12.0078L10.1719 9L13.1797 5.99219L12.0078 4.82031L9 7.82812L5.99219 4.82031L4.82031 5.99219L7.82812 9L4.82031 12.0078L5.99219 13.1797L9 10.1719L12.0078 13.1797L13.1797 12.0078ZM3.10156 3.14062C4.74219 1.5 6.70833 0.679688 9 0.679688C11.2917 0.679688 13.2448 1.5 14.8594 3.14062C16.5 4.75521 17.3203 6.70833 17.3203 9C17.3203 11.2917 16.5 13.2578 14.8594 14.8984C13.2448 16.513 11.2917 17.3203 9 17.3203C6.70833 17.3203 4.74219 16.513 3.10156 14.8984C1.48698 13.2578 0.679688 11.2917 0.679688 9C0.679688 6.70833 1.48698 4.75521 3.10156 3.14062Z"
              fill="#334155" />
          </svg>
        </button>
      </div>
      <div class="grow bg-[#E4FAFF]">
        <app-zh-tw-map
          class="block size-full"
          [mapColorConfig]="mapColorConfig"
          [countyFeatures]="data.regionFeatures"
          [townshipFeatures]="data.districtFeatures"
          [regionCode]="regionCode"
          (regionCodeChange)="changeRegionCode($event)"
          [districtCode]="districtCode" />
      </div>
      <div class="flex items-center justify-between gap-x-5 px-4 py-3">
        <button type="button" class="w-full rounded-md bg-gray-200 px-4 py-2 text-sm text-dark" (click)="cancel()">
          返回
        </button>
        <button type="button" class="w-full rounded-md bg-primary px-4 py-2 text-sm text-white" (click)="search()">
          搜尋
        </button>
      </div>
    </div>
  `,
  styles: ``,
})
export class MobileMapSelectorComponent {
  private readonly _apiService = inject(ApiService);
  protected regionCode = REGION_CODE.ALL;
  protected districtCode = DISTRICT_CODE.ALL;
  protected mapColorConfig!: Record<string, string>;

  constructor(
    public dialogRef: DialogRef<MobileMapSelectorComponent, MobileMapSelectorResult>,
    @Inject(DIALOG_DATA) public data: MobileMapSelectorData,
  ) {
    this.mapColorConfig = { ...data.mapColorConfig };
  }

  private _updateMapColorConfig(electionInfo: ElectionInfo): void {
    const newColorConfig = electionInfo.ADMIN_COLLECTION.map((item) => {
      const maxCandidateVote = item.CANDIDATES_VOTES.reduce((max, cv) => {
        const maxCount = max.VOTE_COUNT ?? -Infinity;
        const itemCount = cv.VOTE_COUNT ?? -Infinity;
        return itemCount > maxCount ? cv : max;
      }, item.CANDIDATES_VOTES[0]);
      const index: number = electionInfo.CANDIDATES.findIndex((c) => c.NO == maxCandidateVote.NO);
      const color = POLITICAL_PARTIES[electionInfo.CANDIDATES[index].PARTY]?.REPRESENTATIVE_COLOR || '';
      return { [item.ADMIN_CODE]: color };
    }).reduce((acc, item) => ({ ...acc, ...item }), {});
    this.mapColorConfig = { ...this.mapColorConfig, ...newColorConfig };
  }

  protected async changeRegionCode(code: REGION_CODE): Promise<void> {
    const fetchApi =
      code === REGION_CODE.ALL
        ? this._apiService.fetchCentralVotesJson(this.data.gregorianYear)
        : this._apiService.fetchCountyVotesJson(this.data.gregorianYear, code);

    const electionInfo = await lastValueFrom(fetchApi.pipe(catchError(() => of(undefined))));
    this._updateMapColorConfig(electionInfo || new ElectionInfo());
    this.regionCode = code;
  }

  protected search(): void {
    const { regionCode, districtCode } = this;
    this.dialogRef.close({ regionCode, districtCode });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
