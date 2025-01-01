import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, merge, Subject, takeUntil } from 'rxjs';
import { BreadcrumbComponent } from '../components/breadcrumb/breadcrumb.component';
import { FooterComponent } from '../components/footer/footer.component';
import { HeaderComponent } from '../components/header/header.component';
import { PartyVotesBarChartComponent } from '../components/party-votes-bar-chart/party-votes-bar-chart.component';
import { PartyVotesLineChartComponent } from '../components/party-votes-line-chart/party-votes-line-chart.component';
import { PresidentialVotesComponent } from '../components/presidential-votes/presidential-votes.component';
import { VotingOverviewComponent } from '../components/voting-overview/voting-overview.component';
import { ZhTwMapComponent } from '../components/zh-tw-map/zh-tw-map.component';
import { DISTRICT_CODE } from '../core/enums/district-code.enum';
import { REGION_CODE } from '../core/enums/region-code.enum';
import { IDropdownOption } from '../core/interfaces/i-dropdown-option.interface';
import { ApiService } from '../core/services/api.service';
import { DropdownService } from '../core/services/dropdown.service';
import { GeoFeature } from '../core/types/geo-feature.type';

@Component({
  selector: 'app-historical-review',
  imports: [
    AsyncPipe,
    HeaderComponent,
    ZhTwMapComponent,
    BreadcrumbComponent,
    PresidentialVotesComponent,
    PartyVotesBarChartComponent,
    PartyVotesLineChartComponent,
    VotingOverviewComponent,
    FooterComponent,
  ],
  template: `
    <app-header
      [adYearOptions]="adYearOptions"
      [regionOptions]="regionOptions"
      [districtOptions]="districtOptions"
      [(addYear)]="addYear"
      [regionCode]="(regionCodeBehavior$ | async) || regionCodeBehavior$.getValue()"
      (regionCodeChange)="regionCodeBehavior$.next($event)"
      [districtCode]="(districtCodeBehavior$ | async) || districtCodeBehavior$.getValue()"
      (districtCodeChange)="districtCodeBehavior$.next($event)" />

    <div class="grid grid-cols-1 xl:grid-cols-[500px,1fr]">
      <div class="relative bg-[#E4FAFF]">
        @if (regionFeatures.length !== 0 && districtFeatures.length !== 0) {
          <app-zh-tw-map
            class="top:auto static block h-[148px] xl:sticky xl:top-[65px] xl:h-[calc(100dvh-65px)]"
            [countyFeatures]="regionFeatures"
            [townshipFeatures]="districtFeatures"
            [regionCode]="(regionCodeBehavior$ | async) || regionCodeBehavior$.getValue()"
            (regionCodeChange)="regionCodeBehavior$.next($event)"
            [districtCode]="(districtCodeBehavior$ | async) || districtCodeBehavior$.getValue()"
            (districtCodeChange)="districtCodeBehavior$.next($event)" />
        }
      </div>

      <div class="flex flex-col justify-between">
        <div class="grid auto-rows-min grid-cols-2 gap-6 px-4 py-8 xl:px-12">
          <div class="col-span-2 grid gap-y-3">
            <div class="flex items-center gap-x-3">
              @if (title !== dataSummaryTitle) {
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200"
                  (click)="backToPreviousLevel()">
                  <img src="/images/icons/arrow_back.png" alt="arrow_back" class="pointer-events-none h-5 w-5" />
                </button>
              }
              <h2 class="text-2xl font-bold text-dark xl:text-3xl">{{ title }}</h2>
            </div>

            <div>
              @if (breadcrumbList.length > 1) {
                <app-breadcrumb class="mb-2 block" [breadcrumbList]="breadcrumbList" />
              }
            </div>

            <app-presidential-votes />
          </div>

          <app-party-votes-bar-chart />

          <app-party-votes-line-chart />

          <app-voting-overview class="col-span-2" />
        </div>
        <app-footer />
      </div>
    </div>
  `,
  styles: ``,
})
export class HistoricalReviewComponent implements OnInit, OnDestroy {
  private readonly _apiService = inject(ApiService);
  private readonly _dropdownService = inject(DropdownService);
  private readonly _destroy = new Subject<void>();

  protected readonly dataSummaryTitle = '全臺縣市總統得票';
  protected title = this.dataSummaryTitle;

  protected readonly adYearOptions = this._dropdownService.getYearList();
  protected addYear = this.adYearOptions[0].value;

  protected regionOptions: IDropdownOption<REGION_CODE>[] = [];
  protected readonly regionCodeBehavior$ = new BehaviorSubject<REGION_CODE>(REGION_CODE.ALL);

  protected districtOptions: IDropdownOption<DISTRICT_CODE>[] = [];
  protected readonly districtCodeBehavior$ = new BehaviorSubject<DISTRICT_CODE>(DISTRICT_CODE.ALL);

  protected breadcrumbList: string[] = [];

  protected regionFeatures: GeoFeature[] = [];
  protected districtFeatures: GeoFeature[] = [];

  ngOnInit(): void {
    this._fetchMapGeoJson();
    this._registerRegionCodeChangeListener();
    this._registerDistrictCodeChangeListener();
    this._registerTitleAndBreadcrumbRenderer();
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  private _fetchMapGeoJson(): void {
    this._apiService.fetchCountyGeoJson().subscribe((data) => {
      this.regionOptions = data
        .map((item) => ({
          label: item.properties.COUNTYNAME,
          value: item.properties.COUNTYCODE as REGION_CODE,
        }))
        .sort((a, b) => a.value.localeCompare(b.value) * -1);
      this.regionFeatures = data;
    });
    this._apiService.fetchTownshipGeoJson().subscribe((data) => (this.districtFeatures = data));
  }

  private _registerRegionCodeChangeListener(): void {
    this.regionCodeBehavior$.pipe(takeUntil(this._destroy), distinctUntilChanged()).subscribe((regionCode) => {
      this.districtOptions = this.districtFeatures
        .filter((feature) => feature.properties.COUNTYCODE === regionCode)
        .map((feature) => ({
          label: feature.properties.TOWNNAME,
          value: feature.properties.TOWNCODE as DISTRICT_CODE,
        }));
      this.districtCodeBehavior$.next(DISTRICT_CODE.ALL);
    });
  }

  private _registerDistrictCodeChangeListener(): void {
    this.districtCodeBehavior$.pipe(takeUntil(this._destroy), distinctUntilChanged()).subscribe((districtCode) => {});
  }

  private _registerTitleAndBreadcrumbRenderer(): void {
    merge(this.regionCodeBehavior$, this.districtCodeBehavior$)
      .pipe(takeUntil(this._destroy))
      .subscribe(() => {
        const regionName =
          this.regionFeatures.find((feature) => feature.properties.COUNTYCODE === this.regionCodeBehavior$.getValue())
            ?.properties?.COUNTYNAME || '';
        const districtName =
          this.districtFeatures.find((feature) => feature.properties.TOWNCODE === this.districtCodeBehavior$.getValue())
            ?.properties?.TOWNNAME || '';
        this.title = districtName || regionName || this.dataSummaryTitle;
        this.breadcrumbList = [this.dataSummaryTitle, regionName, districtName].filter((item) => !!item);
      });
  }

  protected backToPreviousLevel(): void {
    if (this.districtCodeBehavior$.getValue() !== DISTRICT_CODE.ALL) {
      this.districtCodeBehavior$.next(DISTRICT_CODE.ALL);
      return;
    }

    if (this.regionCodeBehavior$.getValue() !== REGION_CODE.ALL) {
      this.regionCodeBehavior$.next(REGION_CODE.ALL);
      return;
    }
  }
}
