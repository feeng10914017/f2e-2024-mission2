/** 選舉識別碼 */
export class ElectionIdentifier {
  /** 選舉任期 */
  ELECTION_TERM: number | null;

  /** 選舉名稱 */
  ELECTION_NAME: string;

  /** 選舉西元年 */
  ELECTION_AD_YEAR: string;

  /** 選舉民國年 */
  ELECTION_ROC_YEAR: string;

  constructor(data?: any) {
    this.ELECTION_TERM = Number.isNaN(data?.ELECTION_TERM) ? null : data.ELECTION_TERM;
    this.ELECTION_NAME = data?.ELECTION_NAME || '';
    this.ELECTION_AD_YEAR = data?.ELECTION_AD_YEAR || '';
    this.ELECTION_ROC_YEAR = data?.ELECTION_ROC_YEAR || '';
  }
}
