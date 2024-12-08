import { GENDER } from '../enums/gender.enum';

/** 候選人個人資料 */
export class Candidate {
  /** 候選人姓名 */
  NAME: string;

  /** 性別 */
  GENDER: GENDER;

  /** 出生年月日（民國年） */
  BIRTH_DATE: string;

  constructor(data?: any) {
    this.NAME = data?.NAME || '';
    this.GENDER = data?.GENDER || GENDER.UNKNOWN;
    this.BIRTH_DATE = data?.BIRTH_DATE || '';
  }
}
