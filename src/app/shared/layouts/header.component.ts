import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { debounceTime, fromEvent, merge, Subject, takeUntil } from 'rxjs';
import { DISTRICT_CODE } from '../../core/enums/district-code.enum';
import { REGION_CODE } from '../../core/enums/region-code.enum';
import { IDropdownOption } from '../../core/interfaces/i-dropdown-option.interface';
import { ProgressBarComponent } from '../components/progress-bar.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, ProgressBarComponent],
  template: `
    <div class="sticky top-[-48px] z-50 shadow xl:top-0">
      <div class="border-b-[1px] border-solid border-gray-300 bg-white xl:px-6 xl:py-3">
        <div class="flex flex-col justify-center xl:flex-row xl:items-center xl:justify-between xl:gap-x-4">
          <div class="flex items-center justify-between px-4 py-2 xl:justify-start xl:gap-x-6 xl:p-0">
            <a [routerLink]="['/portal']">
              <h1>
                <img src="images/logo.png" alt="logo" class="h-[28px] xl:h-[40px]" />
              </h1>
            </a>

            <div class="flex items-center gap-x-3">
              <div class="hidden text-base font-bold text-dark xl:block">選擇年份</div>
              <div class="cmp-dropdown w-[118px]">
                <input
                  type="text"
                  readonly
                  placeholder="請選擇"
                  [value]="gregorianYearLabel"
                  (click)="$event.stopPropagation(); closeAllSelects(); isAdYearSelectOpen = true" />
                <div>
                  <img
                    src="images/icons/expand_more.png"
                    alt="expand_more"
                    [@iconOpenClose]="isAdYearSelectOpen ? 'open' : 'closed'" />
                </div>
                @if (isAdYearSelectOpen) {
                  <ul>
                    @for (option of gregorianYearOptions; track option.value) {
                      <li (click)="onYearChange(option.value)">
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
              <img src="images/icons/search.png" alt="search" class="ml-3 hidden xl:block" />

              <div class="cmp-dropdown w-1/2 xl:w-[194px]">
                <input
                  type="text"
                  readonly
                  placeholder="選擇縣市"
                  [value]="regionLabel"
                  (click)="$event.stopPropagation(); closeAllSelects(); isRegionSelectOpen = true" />
                <div>
                  <img
                    src="images/icons/expand_more.png"
                    alt="expand_more"
                    [@iconOpenClose]="isRegionSelectOpen ? 'open' : 'closed'" />
                </div>
                @if (isRegionSelectOpen) {
                  <ul>
                    @for (option of regionOptions; track option.value) {
                      <li (click)="onRegionChange(option.value)">{{ option.label }}</li>
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
                    src="images/icons/expand_more.png"
                    alt="expand_more"
                    [@iconOpenClose]="isDistrictSelectOpen ? 'open' : 'closed'" />
                </div>
                @if (isDistrictSelectOpen) {
                  <ul>
                    @for (option of districtOptions; track option.value) {
                      <li (click)="onDistrictChange(option.value)">{{ option.label }}</li>
                    }
                  </ul>
                }
              </div>
            </div>

            <div class="hidden grow items-center justify-end gap-x-4 xl:flex">
              <div class="text-base font-normal text-dark">分享</div>

              <a href="http://www.facebook.com">
                <img src="images/icons/facebook-icon.png" alt="facebook-icon" class="h-6" />
              </a>

              <a href="http://www.instagram.com">
                <img src="images/icons/instagram-icon.png" alt="instagram-icon" class="h-6" />
              </a>

              <a href="http://www.youtube.com">
                <img src="images/icons/youtube-icon.png" alt="youtube-icon" class="h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <app-progress-bar />
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
export class HeaderComponent implements OnChanges, OnInit, OnDestroy {
  private readonly _destroy = new Subject<void>();

  @Input({ required: true }) gregorianYearOptions!: IDropdownOption<string>[];
  @Input({ required: true }) gregorianYear!: string;
  @Output() gregorianYearChange = new EventEmitter<string>();
  protected gregorianYearLabel = '';
  protected isAdYearSelectOpen = false;

  @Input({ required: true }) regionOptions!: IDropdownOption<REGION_CODE>[];
  @Input({ required: true }) regionCode!: REGION_CODE;
  @Output() regionCodeChange = new EventEmitter<REGION_CODE>();
  protected regionLabel = '';
  protected isRegionSelectOpen = false;

  @Input({ required: true }) districtOptions!: IDropdownOption<DISTRICT_CODE>[];
  @Input({ required: true }) districtCode!: DISTRICT_CODE;
  @Output() districtCodeChange = new EventEmitter<DISTRICT_CODE>();
  protected districtLabel = '';
  protected isDistrictSelectOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    const { regionOptions, districtOptions } = changes;
    if (regionOptions && Array.isArray(regionOptions.currentValue)) {
      const allOption: IDropdownOption<REGION_CODE> = { label: '全部縣市', value: REGION_CODE.ALL };
      const hasAll = !!regionOptions.currentValue.find((opt) => opt.value === allOption.value);
      if (!hasAll) regionOptions.currentValue.unshift(allOption);
    }
    if (districtOptions && Array.isArray(districtOptions.currentValue)) {
      const allOption: IDropdownOption<DISTRICT_CODE> = { label: '全部鄉鎮市區', value: DISTRICT_CODE.ALL };
      const hasAll = !!districtOptions.currentValue.find((opt) => opt.value === allOption.value);
      if (!hasAll) districtOptions.currentValue.unshift(allOption);
    }

    const { gregorianYear, regionCode, districtCode } = changes;
    if (gregorianYear) {
      const targetOption = this.gregorianYearOptions.find((item) => item.value === gregorianYear.currentValue);
      if (targetOption) this.gregorianYearLabel = targetOption.label;
    }
    if (regionCode) {
      const targetOption = this.regionOptions.find((item) => item.value === regionCode.currentValue);
      if (targetOption) this.regionLabel = targetOption.label;
    }
    if (districtCode) {
      const targetOption = this.districtOptions.find((item) => item.value === districtCode.currentValue);
      if (targetOption) this.districtLabel = targetOption.label;
    }
  }

  ngOnInit(): void {
    merge(fromEvent(document, 'click'), fromEvent(document, 'scroll'))
      .pipe(takeUntil(this._destroy), debounceTime(0))
      .subscribe(() => this.closeAllSelects());
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

  protected onYearChange(adYear: string): void {
    this.isAdYearSelectOpen = !this.isAdYearSelectOpen;
    this.gregorianYearChange.emit(adYear);
  }

  protected onRegionChange(region: REGION_CODE): void {
    this.isRegionSelectOpen = !this.isRegionSelectOpen;
    this.regionCodeChange.emit(region);
  }

  protected onDistrictChange(district: DISTRICT_CODE): void {
    this.isDistrictSelectOpen = !this.isDistrictSelectOpen;
    this.districtCodeChange.emit(district);
  }
}
