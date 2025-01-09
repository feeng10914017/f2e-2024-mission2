/** 候選人得票數據 */
export class CandidateVote {
  /** 候選人號次 */
  NO: number | null;

  /** 得票數 */
  VOTE_COUNT: number | null;

  constructor(data?: any) {
    this.NO = Number.isNaN(parseInt(data?.NO)) ? null : data.NO;
    this.VOTE_COUNT = Number.isNaN(parseInt(data?.VOTE_COUNT)) ? null : data.VOTE_COUNT;
  }
}
