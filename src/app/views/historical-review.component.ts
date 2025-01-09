import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, debounceTime, forkJoin, Observable, of, Subject, takeUntil } from 'rxjs';
import { DISTRICT_CODE } from '../core/enums/district-code.enum';
import { REGION_CODE } from '../core/enums/region-code.enum';
import { IDropdownOption } from '../core/interfaces/i-dropdown-option.interface';
import { AdminCollection } from '../core/models/admin-collection.model';
import { ElectionInfo } from '../core/models/election-info.model';
import { ApiService } from '../core/services/api.service';
import { CommonService } from '../core/services/common.service';
import { GeoFeature } from '../core/types/geo-feature.type';
import { BreadcrumbComponent } from '../shared/components/breadcrumb.component';
import { ToTopButtonComponent } from '../shared/components/to-top-button.component';
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

    <div class="grid grid-cols-1 xl:grid-cols-[500px,1fr]">
      <div class="relative bg-[#E4FAFF]">
        @if (regionFeatures.length !== 0 && districtFeatures.length !== 0) {
          <app-zh-tw-map
            class="top:auto static block h-[148px] xl:sticky xl:top-[65px] xl:h-[calc(100dvh-65px)]"
            [countyFeatures]="regionFeatures"
            [townshipFeatures]="districtFeatures"
            [regionCode]="regionCode"
            (regionCodeChange)="changeRegionCode($event)"
            [districtCode]="districtCode"
            (districtCodeChange)="changeDistrictCode($event)" />
        }
      </div>

      <div class="flex flex-col justify-between">
        <div class="grid auto-rows-min grid-cols-1 gap-6 px-4 py-8 xl:grid-cols-2 xl:px-12">
          <div class="grid gap-y-3 xl:col-span-2">
            <div class="flex items-center gap-x-3">
              @if (adminTitle !== adminCentralTitle) {
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200"
                  (click)="backToPreviousLevel()">
                  <img src="/images/icons/arrow_back.png" alt="arrow_back" class="pointer-events-none h-5 w-5" />
                </button>
              }
              <h2 class="text-2xl font-bold text-dark xl:text-3xl">{{ adminTitle }}</h2>
            </div>

            <div>
              @if (breadcrumbList.length > 1) {
                <app-breadcrumb class="mb-2 block" [breadcrumbList]="breadcrumbList" />
              }
            </div>

            <app-presidential-votes />
          </div>

          <app-historical-party-vote-counts />

          <app-historical-party-vote-rates />

          <app-voting-overview
            class="xl:col-span-2"
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

  protected gregorianYear = '';
  protected regionCode = REGION_CODE.ALL;
  protected districtCode = DISTRICT_CODE.ALL;

  protected adminTitle = this.adminCentralTitle;
  protected breadcrumbList: string[] = [];

  protected candidateNoOrder: number[] = [];
  protected electionInfo: ElectionInfo | undefined;
  protected historicalStatistics: AdminCollection[] = [];

  ngOnInit(): void {
    this._fetchMapGeoJson();

    this._refetchVoteData$
      .pipe(takeUntil(this._destroy), debounceTime(100))
      .subscribe(([gregorianYear, regionCode, districtCode]) => {
        this._fetchVotingData(gregorianYear, regionCode, districtCode);
      });

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

  private _fetchVotingData(gregorianYear: string, regionCode: REGION_CODE, districtCode: DISTRICT_CODE): void {
    const gregorianYears = this._commonService.getYearsSince1996();
    const fetchObservables: Observable<ElectionInfo>[] = gregorianYears
      .map((year) => {
        if (districtCode !== DISTRICT_CODE.ALL) {
          return this._apiService.fetchTownVotesJson(year, districtCode);
        } else if (regionCode !== REGION_CODE.ALL) {
          return this._apiService.fetchCountyVotesJson(year, regionCode);
        } else {
          return this._apiService.fetchCentralVotesJson(year);
        }
      })
      .map((obs) => obs.pipe(catchError(() => of(new ElectionInfo()))));

    forkJoin(fetchObservables).subscribe((list) => {
      // 設定下拉選單值
      this.gregorianYear = gregorianYear;
      this.regionCode = regionCode;
      this.districtCode = districtCode;

      // 設定當前行政區資訊
      const index = list.findIndex((item) => item.ELECTION_GREGORIAN_YEAR === gregorianYear);
      this.electionInfo = index !== -1 ? list[index] : new ElectionInfo();

      // 設定頁面標題
      const adminName = this.electionInfo.TOTAL_STATISTICS.ADMIN_NAME;
      this.adminTitle = regionCode === REGION_CODE.ALL ? this.adminCentralTitle : adminName;

      // 設定縣市下拉選單
      if (regionCode === REGION_CODE.ALL && districtCode === DISTRICT_CODE.ALL) {
        this.regionOptions = this.electionInfo.ADMIN_COLLECTION.map((admin) =>
          this._commonService.convertOption(admin.ADMIN_NAME, admin.ADMIN_CODE as REGION_CODE),
        ).sort((a, b) => a.value.localeCompare(b.value) * -1);
      }

      // 設定鄉鎮市下拉選單
      if (regionCode !== REGION_CODE.ALL && districtCode === DISTRICT_CODE.ALL) {
        this.districtOptions = this.electionInfo.ADMIN_COLLECTION.map((admin) =>
          this._commonService.convertOption(admin.ADMIN_NAME, admin.ADMIN_CODE as DISTRICT_CODE),
        ).sort((a, b) => a.value.localeCompare(b.value) * -1);
      }

      // 設定政黨排序
      this.candidateNoOrder = [...this.electionInfo.TOTAL_STATISTICS.CANDIDATES_VOTES]
        .sort((a, b) => (b.VOTE_COUNT || 0) - (a.VOTE_COUNT || 0))
        .map((item) => item.NO || 0);

      // 設定歷屆政黨資訊
      this.historicalStatistics = list.map((item) => item.TOTAL_STATISTICS);
    });
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
