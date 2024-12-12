import { Injectable } from '@angular/core';
import { IDropdownOption } from '../interfaces/i-dropdown-option.interface';

@Injectable({
  providedIn: 'root',
})
export class DropdownService {
  constructor() {}

  getYearList(): IDropdownOption<string>[] {
    const adYearArr = ['1996', '2000', '2004', '2008', '2012', '2016', '2020', '2024'];
    return adYearArr.map((item) => ({ label: item, value: item }));
  }
}
