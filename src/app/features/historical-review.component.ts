import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, merge, Subject, takeUntil } from 'rxjs';
import { BreadcrumbComponent } from '../components/breadcrumb/breadcrumb.component';
import { HeaderComponent } from '../components/header/header.component';
import { ZhTwMapComponent } from '../components/zh-tw-map/zh-tw-map.component';
import { DISTRICT_CODE } from '../core/enums/district-code.enum';
import { REGION_CODE } from '../core/enums/region-code.enum';
import { IDropdownOption } from '../core/interfaces/i-dropdown-option.interface';
import { ApiService } from '../core/services/api.service';
import { DropdownService } from '../core/services/dropdown.service';
import { GeoFeature } from '../core/types/geo-feature.type';

@Component({
  selector: 'app-historical-review',
  imports: [HeaderComponent, ZhTwMapComponent, BreadcrumbComponent, AsyncPipe],
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

      <div class="grid grid-cols-2 gap-6 px-4 py-8 xl:px-12">
        <div class="col-span-2 grid gap-y-3">
          <h2 class="text-2xl font-bold text-dark xl:text-3xl">{{ title }}</h2>

          @if (breadcrumbList.length > 1) {
            <app-breadcrumb class="mb-5" [breadcrumbList]="breadcrumbList" />
          }
        </div>

        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, corrupti? Quia non a vel nostrum quos illum
        aut quaerat architecto necessitatibus, sed, porro perferendis incidunt, harum at suscipit dolor ratione.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quas ratione placeat perferendis eaque reprehenderit
        architecto, qui necessitatibus perspiciatis suscipit, distinctio sit voluptatibus praesentium et. Ad cum
        reprehenderit assumenda cumque esse.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae nihil illo fugit quidem libero, expedita
        accusantium labore neque sunt asperiores, praesentium illum qui nostrum voluptatibus consectetur repellat natus
        perferendis? Ut.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur architecto eum voluptas rerum? Eveniet
        rerum distinctio quos necessitatibus, nam, eum deleniti odit odio animi expedita sed, quod hic delectus totam.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vero dignissimos sint quisquam velit tempora nisi fuga
        aperiam ratione voluptatum libero in qui magnam unde officia ea, ipsam iure quod animi.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime earum dicta quae ut a perspiciatis tenetur
        asperiores distinctio consectetur, dolores reprehenderit cumque possimus maiores animi quis, voluptates, magnam
        saepe vero?
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Debitis non aperiam eveniet animi iste quia ipsa ab
        quae! Quis saepe non animi optio quaerat assumenda facere exercitationem quae, dolorum maiores?
        <br />
        <hr />
        <br />
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Consequuntur amet, nisi officiis maxime quo non enim
        voluptatum quas adipisci at id laboriosam, placeat optio necessitatibus a quaerat ducimus quis odit.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto minus soluta cumque eaque reiciendis modi eum
        molestiae atque harum! Illum veritatis voluptatum consectetur aut, nesciunt non vitae ut blanditiis mollitia.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, placeat delectus, veritatis exercitationem
        voluptate quo nostrum itaque dolore sequi odio quibusdam quidem officia aliquam! Distinctio similique eum
        voluptatum nulla porro?
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet, corporis! Assumenda dolor debitis vero rerum
        ad sint id vel repellat sapiente laboriosam voluptate corrupti saepe facilis deleniti, dignissimos, velit
        laborum.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum dolores quos optio nam. Nostrum debitis
        distinctio sapiente quod magnam molestiae ratione doloremque reiciendis hic repellat eligendi, sit, voluptatum
        illo explicabo?
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ea, atque provident nesciunt id, quaerat, eveniet
        harum incidunt sed mollitia dolor repellendus eos commodi vitae vel praesentium nemo sint iusto similique?
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, perspiciatis fugit dolorem ea inventore minima
        illo, ratione laudantium mollitia natus similique omnis iste, cumque eum eveniet error porro numquam cum.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia nemo fugit, veritatis reprehenderit sequi est
        at, reiciendis vero voluptatum rerum laudantium in, eos ratione quis voluptas doloribus ab. Mollitia, ipsum!
        <br />
        <hr />
        <br />
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab minima eum, aliquam mollitia unde provident
        eligendi et nostrum accusamus dignissimos voluptatibus repellendus? Totam ex blanditiis maiores adipisci magnam
        quod officia?
      </div>
    </div>
  `,
  styles: ``,
})
export class HistoricalReviewComponent implements OnInit, OnDestroy {
  private readonly _apiService = inject(ApiService);
  private readonly _dropdownService = inject(DropdownService);
  private readonly _destroy = new Subject<void>();
  private readonly dataSummaryTitle = '全臺縣市總統得票';

  protected title = this.dataSummaryTitle;

  protected readonly adYearOptions = this._dropdownService.getYearList();
  protected addYear = this.adYearOptions[0].value;

  protected regionOptions: IDropdownOption<REGION_CODE>[] = [];
  protected readonly regionCodeBehavior$ = new BehaviorSubject<REGION_CODE>(REGION_CODE.ALL);

  protected districtOptions: IDropdownOption<DISTRICT_CODE>[] = [];
  protected readonly districtCodeBehavior$ = new BehaviorSubject<DISTRICT_CODE>(DISTRICT_CODE.ALL);

  protected regionFeatures: GeoFeature[] = [];

  protected breadcrumbList: string[] = [];

  protected districtFeatures: GeoFeature[] = [];

  ngOnInit(): void {
    this._fetchMapGeoJson();
    this._registerRegionCodeChangeListener();
    this._registerDistrictCodeChangeListener();
    this._registerBreadcrumbRenderer();
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

  private _registerBreadcrumbRenderer(): void {
    merge(this.regionCodeBehavior$, this.districtCodeBehavior$)
      .pipe(takeUntil(this._destroy), distinctUntilChanged())
      .subscribe(() => {
        const regionFeature = this.regionFeatures.find(
          (feature) => feature.properties.COUNTYCODE === this.regionCodeBehavior$.getValue(),
        );
        const districtFeature = this.districtFeatures.find(
          (feature) => feature.properties.TOWNCODE === this.districtCodeBehavior$.getValue(),
        );
        this.breadcrumbList = [
          this.dataSummaryTitle,
          regionFeature?.properties?.COUNTYNAME || '',
          districtFeature?.properties?.TOWNNAME || '',
        ].filter((item) => !!item);
      });
  }
}
