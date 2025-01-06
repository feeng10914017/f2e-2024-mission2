/** 正副總統候選人組合 */
export class CandidatePair {
  /** 候選人號次 */
  NO: number | null;

  /** 推薦政黨 */
  PARTY: string;

  /** 總統候選人資料 */
  PRESIDENT: string;

  /** 副總統候選人資料 */
  VICE_PRESIDENT: string;

  constructor(data?: any) {
    this.NO = Number.isNaN(data?.NO) ? null : data.NO;
    this.PARTY = data?.PARTY || '';
    this.PRESIDENT = data?.PRESIDENT || '';
    this.VICE_PRESIDENT = data?.VICE_PRESIDENT || '';
  }
}
