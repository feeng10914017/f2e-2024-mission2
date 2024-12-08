import { Candidate } from './candidate.model';

/** 正副總統候選人組合 */
export class CandidatePair {
  /** 候選人號次 */
  NUMBER: number | null;

  /** 推薦政黨 */
  PARTY: string;

  /** 總統候選人資料 */
  PRESIDENT: Candidate;

  /** 副總統候選人資料 */
  VICE_PRESIDENT: Candidate;

  /** 得票數 */
  VOTES: number | null;

  /** 是否當選 */
  IS_ELECTED: boolean | null;

  constructor(data?: any) {
    this.NUMBER = Number.isNaN(data?.NUMBER) ? null : data.NUMBER;
    this.PARTY = data?.PARTY || '';
    this.PRESIDENT = new Candidate(data?.PRESIDENT);
    this.VICE_PRESIDENT = new Candidate(data?.VICE_PRESIDENT);
    this.VOTES = Number.isNaN(data?.VOTES) ? null : data.VOTES;
    this.IS_ELECTED = typeof data?.IS_ELECTED === 'boolean' ? data.IS_ELECTED : null;
  }
}
