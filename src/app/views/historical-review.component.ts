import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  lastValueFrom,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { POLITICAL_PARTIES } from '../core/constants/political-parties.const';
import { DISTRICT_CODE } from '../core/enums/district-code.enum';
import { REGION_CODE } from '../core/enums/region-code.enum';
import { IDropdownOption } from '../core/interfaces/i-dropdown-option.interface';
import { IPoliticalParty } from '../core/interfaces/i-political-party.interface';
import { ElectionInfo } from '../core/models/election-info.model';
import { ApiService } from '../core/services/api.service';
import { CommonService } from '../core/services/common.service';
import { DialogConfig, DialogService } from '../core/services/dialog.service';
import { GeoFeature } from '../core/types/geo-feature.type';
import { BreadcrumbComponent } from '../shared/components/breadcrumb.component';
import { DataPoint } from '../shared/components/grouped-bar-chart.component';
import { ToTopButtonComponent } from '../shared/components/to-top-button.component';
import {
  MobileMapSelectorComponent,
  MobileMapSelectorData,
  MobileMapSelectorResult,
} from '../shared/dialogs/mobile-map-selector/mobile-map-selector.component';
import { HistoricalPartyVoteCountsComponent } from '../shared/features/historical-party-vote-counts.component';
import { HistoricalPartyVoteRatesComponent } from '../shared/features/historical-party-vote-rates.component';
import { PresidentialVotesComponent } from '../shared/features/presidential-votes.component';
import { VotingOverviewComponent } from '../shared/features/voting-overview.component';
import { FooterComponent } from '../shared/layouts/footer.component';
import { HeaderComponent } from '../shared/layouts/header.component';
import { ZhTwMapComponent } from '../shared/layouts/zh-tw-map.component';

@Component({
  selector: 'app-historical-review',
  imports: [
    HeaderComponent,
    ZhTwMapComponent,
    BreadcrumbComponent,
    PresidentialVotesComponent,
    HistoricalPartyVoteCountsComponent,
    HistoricalPartyVoteRatesComponent,
    VotingOverviewComponent,
    FooterComponent,
    ToTopButtonComponent,
  ],
  template: `
    <app-header
      [gregorianYearOptions]="gregorianYearOptions"
      [gregorianYear]="gregorianYear"
      (gregorianYearChange)="changeGregorianYear($event)"
      [regionOptions]="regionOptions"
      [regionCode]="regionCode"
      (regionCodeChange)="changeRegionCode($event)"
      [districtOptions]="districtOptions"
      [districtCode]="districtCode"
      (districtCodeChange)="changeDistrictCode($event)" />

    <div class="grid grid-cols-1 2xl:grid-cols-[500px,1fr]">
      <div class="relative bg-[#E4FAFF]">
        @if (regionFeatures.length !== 0 && districtFeatures.length !== 0) {
          <div class="top:auto static h-[148px] 2xl:sticky 2xl:top-[65px] 2xl:h-[calc(100dvh-65px)]">
            <div class="absolute flex size-full items-center justify-center bg-[#49505799] 2xl:hidden">
              <button
                type="button"
                class="rounded-md bg-primary px-4 py-2 text-sm text-white"
                (click)="selectMobileMap()">
                進入地圖
              </button>
            </div>

            <div class="pointer-events-none size-full 2xl:pointer-events-auto">
              @if (adminTitle !== adminCentralTitle) {
                <div class="absolute left-6 top-6 z-10 hidden items-center rounded-[500px] bg-white p-1 2xl:flex">
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200"
                    (click)="backToPreviousLevel()">
                    <img src="images/icons/arrow_back.png" alt="arrow_back" class="pointer-events-none h-5 w-5" />
                  </button>
                  <div class="mx-2 text-base font-bold text-dark">返回</div>
                </div>

                @if (activePartyOrder.length > 0) {
                  <div
                    class="absolute bottom-4 left-4 z-10 hidden items-center gap-x-1 rounded-[500px] bg-white px-2 2xl:flex">
                    @for (item of activePartyOrder; track $index) {
                      <div class="h-2 w-2 rounded-full" [style.background]="item.REPRESENTATIVE_COLOR"></div>
                      <div class="text-xs leading-5 text-dark">{{ item.CN_FULL_NAME }}</div>
                    }
                  </div>
                }
              }

              <app-zh-tw-map
                class="block size-full"
                [mapColorConfig]="mapColorConfig"
                [countyFeatures]="regionFeatures"
                [townshipFeatures]="districtFeatures"
                [regionCode]="regionCode"
                (regionCodeChange)="changeRegionCode($event)"
                [districtCode]="districtCode"
                (districtCodeChange)="changeDistrictCode($event)" />
            </div>
          </div>
        }
      </div>

      <div class="flex flex-col justify-between">
        <div class="grid auto-rows-min grid-cols-1 gap-6 px-4 py-8 2xl:grid-cols-2 2xl:px-12">
          <div class="grid gap-y-3 2xl:col-span-2">
            <div class="flex items-center gap-x-3">
              @if (adminTitle !== adminCentralTitle) {
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200"
                  (click)="backToPreviousLevel()">
                  <img src="images/icons/arrow_back.png" alt="arrow_back" class="pointer-events-none h-5 w-5" />
                </button>
              }
              <h2 class="text-2xl font-bold text-dark 2xl:text-3xl">{{ adminTitle }}</h2>
            </div>

            <div>
              @if (breadcrumbList.length > 1) {
                <app-breadcrumb [breadcrumbList]="breadcrumbList" />
              }
            </div>

            <app-presidential-votes
              [isLoaded]="isLoaded"
              [electionInfo]="electionInfo"
              [candidateNoOrder]="candidateNoOrder" />
          </div>

          <app-historical-party-vote-counts
            [isLoaded]="isLoaded"
            [activePartyOrder]="activePartyOrder"
            [historicalVoteCounts]="historicalVoteCounts" />

          <app-historical-party-vote-rates
            [isLoaded]="isLoaded"
            [activePartyOrder]="activePartyOrder"
            [historicalVoteRates]="historicalVoteRates" />

          <app-voting-overview
            class="2xl:col-span-2"
            [electionInfo]="electionInfo"
            [candidateNoOrder]="candidateNoOrder"
            (adminChange$)="changeAdminCodeWithSubAdmin($event)" />
        </div>
        <app-footer />
      </div>
    </div>

    <app-to-top-button />
  `,
  styles: ``,
})
export class HistoricalReviewComponent implements OnInit, OnDestroy {
  private readonly _route = inject(ActivatedRoute);
  private readonly _apiService = inject(ApiService);
  private readonly _commonService = inject(CommonService);
  private readonly _dialogService = inject(DialogService);
  private readonly _destroy = new Subject<void>();
  private readonly _refetchVoteData$ = new Subject<[string, REGION_CODE, DISTRICT_CODE]>();

  protected readonly adminCentralTitle = '全臺縣市總統得票';
  protected readonly gregorianYearOptions = this._commonService
    .getYearsSince1996()
    .map((year) => this._commonService.convertOption(year, year));
  protected regionOptions: IDropdownOption<REGION_CODE>[] = [];
  protected districtOptions: IDropdownOption<DISTRICT_CODE>[] = [];

  protected regionFeatures: GeoFeature[] = [];
  protected districtFeatures: GeoFeature[] = [];
  protected mapColorConfig: Record<string, string> = {};

  protected gregorianYear = '';
  protected regionCode = REGION_CODE.ALL;
  protected districtCode = DISTRICT_CODE.ALL;

  protected adminTitle = this.adminCentralTitle;
  protected breadcrumbList: string[] = [];

  protected candidateNoOrder: number[] = [];
  protected activePartyOrder: IPoliticalParty[] = [];
  protected electionInfo: ElectionInfo | undefined;
  protected historicalVoteCounts: DataPoint[] = [];
  protected historicalVoteRates: DataPoint[] = [];

  protected isLoaded = false;

  ngOnInit(): void {
    this._fetchMapGeoJson();

    this._refetchVoteData$
      .pipe(
        takeUntil(this._destroy),
        debounceTime(100),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap((fetchArr) => this._fetchVotingData(...fetchArr)),
      )
      .subscribe((resArr) => this._renderVotingData(...resArr));

    const { beginGregorianYear } = this._route.snapshot.queryParams;
    this.gregorianYear = beginGregorianYear || this._commonService.getYearsSince1996().pop();
    this._refetchVoteData$.next([this.gregorianYear, this.regionCode, this.districtCode]);
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  private _fetchMapGeoJson(): void {
    this._apiService.fetchCountyGeoJson().subscribe((data) => (this.regionFeatures = data));
    this._apiService.fetchTownshipGeoJson().subscribe((data) => (this.districtFeatures = data));
  }

  private _fetchVotingData(
    gregorianYear: string,
    regionCode: REGION_CODE,
    districtCode: DISTRICT_CODE,
  ): Observable<[string, REGION_CODE, DISTRICT_CODE, (ElectionInfo | undefined)[]]> {
    const fetchObservables = this._commonService
      .getYearsSince1996()
      .map((year) => {
        if (districtCode !== DISTRICT_CODE.ALL) {
          return this._apiService.fetchTownVotesJson(year, districtCode);
        } else if (regionCode !== REGION_CODE.ALL) {
          return this._apiService.fetchCountyVotesJson(year, regionCode);
        } else {
          return this._apiService.fetchCentralVotesJson(year);
        }
      })
      .map((obs) => obs.pipe(catchError(() => of(undefined))));
    return forkJoin(fetchObservables).pipe(map((list) => [gregorianYear, regionCode, districtCode, list]));
  }

  private async _renderVotingData(
    gregorianYear: string,
    regionCode: REGION_CODE,
    districtCode: DISTRICT_CODE,
    electionInfoList: (ElectionInfo | undefined)[],
  ): Promise<void> {
    // 當切換年份時清空地圖縣市的顏色設定
    if (this.gregorianYear !== gregorianYear) {
      this.mapColorConfig = {};

      // 若非縣市維度，要同時更新地圖縣市的顏色
      if (regionCode !== REGION_CODE.ALL) {
        const centralApi = this._apiService.fetchCentralVotesJson(gregorianYear).pipe(catchError(() => of(undefined)));
        const centralData = (await lastValueFrom(centralApi)) || new ElectionInfo();
        this._updateMapColorConfig(centralData);
      }
    }

    // 設定縣市下拉選單
    if (this.regionOptions.length === 1) {
      this.regionOptions =
        this.regionFeatures
          .map((region) => region.properties)
          .map((prop) => this._commonService.convertOption(prop.COUNTYNAME, prop.COUNTYCODE as REGION_CODE))
          .sort((a, b) => a.value.localeCompare(b.value) * -1) || [];
    }

    // 設定鄉鎮市下拉選單
    if (regionCode === REGION_CODE.ALL) this.districtOptions = [];
    if (regionCode !== REGION_CODE.ALL && districtCode === DISTRICT_CODE.ALL) {
      this.districtOptions =
        this.districtFeatures
          .map((district) => district.properties)
          .filter((prop) => prop.COUNTYCODE === regionCode)
          .map((prop) => this._commonService.convertOption(prop.TOWNNAME, prop.TOWNCODE as DISTRICT_CODE))
          .sort((a, b) => a.value.localeCompare(b.value) * -1) || [];
    }

    // 設定下拉選單值
    this.gregorianYear = gregorianYear;
    this.regionCode = regionCode;
    this.districtCode = districtCode;

    // 設定當前行政區資訊
    const index = electionInfoList.findIndex((item) => item?.ELECTION_GREGORIAN_YEAR === gregorianYear);
    this.electionInfo = electionInfoList[index];

    // 設定頁面標題與麵包蟹
    if (regionCode === REGION_CODE.ALL) {
      this.adminTitle = this.adminCentralTitle;
      this.breadcrumbList = [];
    } else {
      const activeRegionOption = this.regionOptions.find((op) => op.value === regionCode);
      const regionLabel = activeRegionOption?.label || 'Unknown Region Code: ' + regionCode;
      const activeDistrictOption = this.districtOptions.find((op) => op.value === districtCode);
      const districtLabel = activeDistrictOption?.label || 'Unknown District Code: ' + districtCode;
      this.adminTitle = districtCode === DISTRICT_CODE.ALL ? regionLabel : districtLabel;
      this.breadcrumbList = [this.adminCentralTitle, regionLabel];
      if (districtCode !== DISTRICT_CODE.ALL) this.breadcrumbList.push(districtLabel);
    }

    // 設定政黨排序
    this.candidateNoOrder = [...(this.electionInfo?.TOTAL_STATISTICS?.CANDIDATES_VOTES || [])]
      .sort((a, b) => (b.VOTE_COUNT || 0) - (a.VOTE_COUNT || 0))
      .map((item) => item.NO || 0);

    // 設定歷屆政黨資訊
    this.activePartyOrder = this.candidateNoOrder.reduce((acc, no) => {
      const candidate = this.electionInfo?.CANDIDATES.find((item) => item.NO == no);
      if (candidate) acc.push(POLITICAL_PARTIES[candidate.PARTY]);
      return acc;
    }, [] as IPoliticalParty[]);
    this._calculateHistoricalVotingData(this.activePartyOrder, electionInfoList);
    this._updateMapColorConfig(this.electionInfo || new ElectionInfo());

    this._commonService.scrollToTop();
    if (!this.isLoaded) this.isLoaded = true;
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

  private _calculateHistoricalVotingData(
    partyOrder: IPoliticalParty[],
    electionInfoList: (ElectionInfo | undefined)[],
  ): void {
    const historicalVoteCounts: DataPoint[] = [];
    const historicalVoteRates: DataPoint[] = [];
    if (electionInfoList.every((info) => info === undefined) || partyOrder.length === 0) {
      this.historicalVoteCounts = historicalVoteCounts;
      this.historicalVoteRates = historicalVoteRates;
      return;
    }

    this._commonService
      .getYearsSince1996()
      .map((year) => String(year))
      .forEach((year) => {
        if (partyOrder.length === 0) {
          const emptyDataPoint = { groupId: year, subgroupId: '', value: 0, color: '' };
          historicalVoteCounts.push(emptyDataPoint);
          historicalVoteRates.push(emptyDataPoint);
          return;
        }

        const index = electionInfoList.findIndex((item) => item?.ELECTION_GREGORIAN_YEAR === year);
        const activeElectionInfo = electionInfoList[index] || new ElectionInfo();
        const candidates = activeElectionInfo.CANDIDATES;
        const candidatesVotes = activeElectionInfo.TOTAL_STATISTICS.CANDIDATES_VOTES;
        partyOrder.forEach((p) => {
          const countPoint = { groupId: year, subgroupId: p.EN_SHORT_NAME, value: 0, color: p.REPRESENTATIVE_COLOR };
          const targetCandidate = candidates.find((c) => c.PARTY === p.EN_SHORT_NAME);
          const targetCandidateVote = candidatesVotes.find((v) => v.NO == targetCandidate?.NO);
          countPoint.value = targetCandidateVote?.VOTE_COUNT || 0;
          historicalVoteCounts.push(countPoint);

          const ratePoint = { groupId: year, subgroupId: p.EN_SHORT_NAME, value: 0, color: p.REPRESENTATIVE_COLOR };
          const totalVotes = activeElectionInfo.TOTAL_STATISTICS.TOTAL_VOTES || 0;
          ratePoint.value = totalVotes ? countPoint.value / totalVotes : 0;
          historicalVoteRates.push(ratePoint);
        });
      });
    this.historicalVoteCounts = historicalVoteCounts;
    this.historicalVoteRates = historicalVoteRates;
  }

  protected changeGregorianYear(year: string): void {
    this._refetchVoteData$.next([year, this.regionCode, this.districtCode]);
  }

  protected changeRegionCode(code: REGION_CODE): void {
    this._refetchVoteData$.next([this.gregorianYear, code, DISTRICT_CODE.ALL]);
  }

  protected changeDistrictCode(code: DISTRICT_CODE): void {
    this._refetchVoteData$.next([this.gregorianYear, this.regionCode, code]);
  }

  protected changeAdminCodeWithSubAdmin(code: string): void {
    if (this.regionCode === REGION_CODE.ALL) {
      this.changeRegionCode(code as REGION_CODE);
    } else if (this.districtCode === DISTRICT_CODE.ALL) {
      this.changeDistrictCode(code as DISTRICT_CODE);
    }
  }

  protected selectMobileMap(): void {
    const data: MobileMapSelectorData = {
      regionFeatures: this.regionFeatures,
      districtFeatures: this.districtFeatures,
      mapColorConfig: this.mapColorConfig,
      gregorianYear: this.gregorianYear,
    };
    const dialogConfig: DialogConfig = { lockBackdrop: true, lockScroll: true };
    this._dialogService
      .open(MobileMapSelectorComponent, data, dialogConfig)
      .afterClosed()
      .pipe(map((result) => result as MobileMapSelectorResult | undefined))
      .subscribe((result) => {
        if (!result) return;

        const { regionCode, districtCode } = result;
        this._refetchVoteData$.next([this.gregorianYear, regionCode, districtCode]);
      });
  }

  protected backToPreviousLevel(): void {
    if (this.districtCode !== DISTRICT_CODE.ALL) {
      this.changeDistrictCode(DISTRICT_CODE.ALL);
      return;
    }

    if (this.regionCode !== REGION_CODE.ALL) {
      this.changeRegionCode(REGION_CODE.ALL);
      return;
    }
  }
}
