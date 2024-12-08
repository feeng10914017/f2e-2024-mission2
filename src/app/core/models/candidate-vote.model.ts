/** 候選人得票數據 */
export class CandidateVote {
  /** 候選人號次 */
  NUMBER: number | null;

  /** 得票數 */
  VOTES: number | null;

  constructor(data?: any) {
    this.NUMBER = Number.isNaN(data?.NUMBER) ? null : data.NUMBER;
    this.VOTES = Number.isNaN(data?.VOTES) ? null : data.VOTES;
  }
}
