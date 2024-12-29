import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, fromEvent, map, merge, Subject, takeUntil } from 'rxjs';
import { DISTRICT_CODE } from '../../core/enums/district-code.enum';
import { REGION_CODE } from '../../core/enums/region-code.enum';
import { IDropdownOption } from '../../core/interfaces/i-dropdown-option.interface';
import { DropdownService } from '../../core/services/dropdown.service';
import { HistoryManagerService } from '../../core/services/history-manager.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sticky top-[-48px] z-50 shadow xl:top-0">
      <div class="border-b-[1px] border-solid border-gray-300 bg-white xl:px-6 xl:py-3">
        <div class="flex flex-col justify-center xl:flex-row xl:items-center xl:justify-between xl:gap-x-4">
          <div class="flex items-center justify-between px-4 py-2 xl:justify-start xl:gap-x-6 xl:p-0">
            <a [routerLink]="['/portal']">
              <h1>
                <img src="/images/logo.png" alt="logo" class="h-[28px] xl:h-[40px]" />
              </h1>
            </a>

            <div class="flex items-center gap-x-3">
              <div class="hidden text-base font-bold text-dark xl:block">選擇年份</div>
              <div class="cmp-dropdown w-[118px]">
                <input
                  type="text"
                  readonly
                  placeholder="請選擇"
                  [value]="adYearLabel"
                  (click)="$event.stopPropagation(); closeAllSelects(); isAdYearSelectOpen = true" />
                <div>
                  <img
                    src="/images/icons/expand_more.png"
                    alt="expand_more"
                    [@iconOpenClose]="isAdYearSelectOpen ? 'open' : 'closed'" />
                </div>
                @if (isAdYearSelectOpen) {
                  <ul>
                    @for (option of adYearOptions; track option.value) {
                      <li (click)="onYearChange(option.label, option.value)">
                        {{ option.label }}
                      </li>
                    }
                  </ul>
                }
              </div>
            </div>
          </div>

          <div class="px-4 py-2 xl:static xl:flex xl:grow xl:items-center xl:justify-between xl:p-0">
            <div class="flex items-center rounded-full bg-gray-200">
              <img src="/images/icons/search.png" alt="search" class="ml-3 hidden xl:block" />

              <div class="cmp-dropdown w-1/2 xl:w-[194px]">
                <input
                  type="text"
                  readonly
                  placeholder="選擇縣市"
                  [value]="regionLabel"
                  (click)="$event.stopPropagation(); closeAllSelects(); isRegionSelectOpen = true" />
                <div>
                  <img
                    src="/images/icons/expand_more.png"
                    alt="expand_more"
                    [@iconOpenClose]="isRegionSelectOpen ? 'open' : 'closed'" />
                </div>
                @if (isRegionSelectOpen) {
                  <ul>
                    @for (option of regionOptions; track option.value) {
                      <li (click)="onRegionChange(option.label, option.value)">{{ option.label }}</li>
                    }
                  </ul>
                }
              </div>

              <div class="h-4 border-s border-solid border-gray-400"></div>

              <div class="cmp-dropdown w-1/2 xl:w-[194px]">
                <input
                  type="text"
                  readonly
                  placeholder="選擇區域"
                  [value]="districtLabel"
                  (click)="$event.stopPropagation(); closeAllSelects(); isDistrictSelectOpen = true" />
                <div>
                  <img
                    src="/images/icons/expand_more.png"
                    alt="expand_more"
                    [@iconOpenClose]="isDistrictSelectOpen ? 'open' : 'closed'" />
                </div>
                @if (isDistrictSelectOpen) {
                  <ul>
                    @for (option of districtOptions; track option.value) {
                      <li (click)="onDistrictChange(option.label, option.value)">{{ option.label }}</li>
                    }
                  </ul>
                }
              </div>
            </div>

            <div class="hidden grow items-center justify-end gap-x-4 xl:flex">
              <div class="text-base font-normal text-dark">分享</div>

              <a href="http://www.facebook.com">
                <img src="/images/icons/facebook-icon.png" alt="facebook-icon" class="h-6" />
              </a>

              <a href="http://www.instagram.com">
                <img src="/images/icons/instagram-icon.png" alt="instagram-icon" class="h-6" />
              </a>

              <a href="http://www.youtube.com">
                <img src="/images/icons/youtube-icon.png" alt="youtube-icon" class="h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
  animations: [
    trigger('iconOpenClose', [
      state('open', style({ transform: 'rotate(180deg)' })),
      state('closed', style({ transform: 'rotate(0deg)' })),
      transition('open => closed', [animate('0.15s')]),
      transition('closed => open', [animate('0.15s')]),
    ]),
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly _destroy = new Subject<void>();

  protected adYearLabel = '';
  protected isAdYearSelectOpen = false;
  protected adYearOptions: IDropdownOption<string>[] = [];

  protected readonly REGION_CODE = REGION_CODE;
  protected regionLabel = '';
  protected isRegionSelectOpen = false;
  protected regionOptions: IDropdownOption<REGION_CODE>[] = [];

  protected DISTRICT_CODE = DISTRICT_CODE;
  protected districtLabel = '';
  protected isDistrictSelectOpen = false;
  protected districtOptions: IDropdownOption<DISTRICT_CODE>[] = [];

  constructor(
    private dropdownService: DropdownService,
    private historyManagerService: HistoryManagerService,
  ) {
    this.adYearOptions = this.dropdownService.getYearList();
    this.regionOptions = [{ label: '全部縣市', value: REGION_CODE.ALL }];
    this.districtOptions = [{ label: '全部鄉鎮市區', value: DISTRICT_CODE.ALL }];
  }

  ngOnInit(): void {
    merge(fromEvent(document, 'click'), fromEvent(document, 'scroll'))
      .pipe(takeUntil(this._destroy), debounceTime(0))
      .subscribe(() => this.closeAllSelects());

    this.historyManagerService.adYear$
      .pipe(
        takeUntil(this._destroy),
        distinctUntilChanged(),
        map((v) => this.adYearOptions.find((item) => item.value === v)),
        map((opt) => opt?.label || ''),
      )
      .subscribe((label) => (this.adYearLabel = label));

    this.historyManagerService.region$
      .pipe(
        takeUntil(this._destroy),
        distinctUntilChanged(),
        map((v) => this.regionOptions.find((item) => item.value === v)),
        map((opt) => opt?.label || ''),
      )
      .subscribe((label) => (this.regionLabel = label));

    this.historyManagerService.district$
      .pipe(
        takeUntil(this._destroy),
        distinctUntilChanged(),
        map((v) => this.districtOptions.find((item) => item.value === v)),
        map((opt) => opt?.label || ''),
      )
      .subscribe((label) => (this.districtLabel = label));
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  protected closeAllSelects(): void {
    this.isAdYearSelectOpen = false;
    this.isRegionSelectOpen = false;
    this.isDistrictSelectOpen = false;
  }

  protected onYearChange(label: string, adYear: string): void {
    this.adYearLabel = label;
    this.isAdYearSelectOpen = !this.isAdYearSelectOpen;
    this.historyManagerService.adYear$.next(adYear);
  }

  protected onRegionChange(label: string, region: REGION_CODE): void {
    this.regionLabel = label;
    this.isRegionSelectOpen = !this.isRegionSelectOpen;
    this.historyManagerService.region$.next(region);
  }

  protected onDistrictChange(label: string, district: DISTRICT_CODE): void {
    this.districtLabel = label;
    this.isDistrictSelectOpen = !this.isDistrictSelectOpen;
    this.historyManagerService.district$.next(district);
  }
}
