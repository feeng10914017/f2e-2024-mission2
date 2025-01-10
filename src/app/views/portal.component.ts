import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonService } from '../core/services/common.service';

@Component({
  selector: 'app-portal',
  imports: [NgFor, RouterLink],
  template: `
    <div class="min-h-dvh pt-24">
      <div class="grid-flow-rows grid auto-rows-auto gap-y-6">
        <div class="flex flex-col items-center justify-center">
          <img class="mb-2 h-[85px]" src="images/portal-logo.png" />
          <img class="my-2 h-[32px] xl:my-[14px] xl:h-[58px]" src="images/portal-title.png" />
        </div>
        <div class="text-center text-2xl font-bold leading-9 text-primary">選擇查詢年份</div>
        <div class="flex items-center justify-center">
          <div class="grid grid-cols-2 gap-4 xl:grid-cols-5">
            <button
              *ngFor="let beginGregorianYear of gregorianYearList"
              type="button"
              [routerLink]="['/historical-review']"
              [queryParams]="{ beginGregorianYear }">
              {{ beginGregorianYear }}
            </button>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 w-full overflow-hidden">
        <div class="grid translate-y-[7%] grid-cols-4 gap-12 xl:grid-cols-6">
          <img class="w-full" [src]="'images/3d-president/' + presidentImgs[0] + '.png'" />
          <img class="w-full" [src]="'images/3d-president/' + presidentImgs[1] + '.png'" />
          <img class="w-full" [src]="'images/3d-president/' + presidentImgs[2] + '.png'" />
          <img class="w-full" [src]="'images/3d-president/' + presidentImgs[3] + '.png'" />
          <img class="hidden w-full xl:block" [src]="'images/3d-president/' + presidentImgs[4] + '.png'" />
          <img class="hidden w-full xl:block" [src]="'images/3d-president/' + presidentImgs[5] + '.png'" />
        </div>
      </div>
    </div>
  `,
  styles: `
    button {
      @apply h-[48px] w-[163px] rounded-full bg-gray-200 text-base font-bold hover:bg-primary hover:text-white xl:w-[172px];
    }
  `,
})
export class PortalComponent {
  private readonly _original3DImgs: string[];
  protected presidentImgs: string[];

  protected gregorianYearList: string[];

  constructor(private commonService: CommonService) {
    this._original3DImgs = [
      'man_in_steamy_room',
      'man-elf',
      'man-genie',
      'man-vampire',
      'person-mage',
      'troll',
      'woman-super-villain',
      'woman-zombie',
    ];
    this.presidentImgs = this._shuffle(this._original3DImgs);
    this.gregorianYearList = this.commonService.getYearsSince1996();
  }

  private _shuffle<T>(array: Array<T>): Array<T> {
    if (!Array.isArray(array)) return [];

    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
