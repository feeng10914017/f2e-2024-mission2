import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DISTRICT_CODE } from '../enums/district-code.enum';
import { REGION_CODE } from '../enums/region-code.enum';

@Injectable({
  providedIn: 'root',
})
export class HistoryManagerService {
  adYear$ = new BehaviorSubject<string | null>(null);

  region$ = new BehaviorSubject<REGION_CODE | null>(null);

  district$ = new BehaviorSubject<DISTRICT_CODE | null>(null);

  constructor() {}
}
