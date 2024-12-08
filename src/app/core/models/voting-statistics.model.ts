import { CandidateVote } from './candidate-vote.model';

/** 投票統計資料 */
export class VotingStatistics {
  /** 各候選人得票數 */
  CANDIDATES_VOTES: CandidateVote[];

  /** 有效票數 */
  VALID_VOTES: number | null;

  /** 無效票數 */
  INVALID_VOTES: number | null;

  /** 投票數 */
  TOTAL_VOTES: number | null;

  /** 已領未投票數 */
  UNRETURNED_BALLOTS: number | null;

  /** 發出票數 */
  TOTAL_ISSUED_BALLOTS: number | null;

  /** 用餘票數 */
  UNUSED_BALLOTS: number | null;

  /** 選舉人數 */
  ELIGIBLE_VOTERS: number | null;

  /** 投票率 */
  TURNOUT_RATE: number | null;

  constructor(data?: any) {
    this.CANDIDATES_VOTES = Array.isArray(data?.CANDIDATES_VOTES)
      ? data.CANDIDATES_VOTES.map((item: any) => new CandidateVote(item))
      : [];
    this.VALID_VOTES = Number.isNaN(data?.VALID_VOTES) ? null : data.VALID_VOTES;
    this.INVALID_VOTES = Number.isNaN(data?.INVALID_VOTES) ? null : data.INVALID_VOTES;
    this.TOTAL_VOTES = Number.isNaN(data?.TOTAL_VOTES) ? null : data.TOTAL_VOTES;
    this.UNRETURNED_BALLOTS = Number.isNaN(data?.UNRETURNED_BALLOTS) ? null : data.UNRETURNED_BALLOTS;
    this.TOTAL_ISSUED_BALLOTS = Number.isNaN(data?.TOTAL_ISSUED_BALLOTS) ? null : data.TOTAL_ISSUED_BALLOTS;
    this.UNUSED_BALLOTS = Number.isNaN(data?.UNUSED_BALLOTS) ? null : data.UNUSED_BALLOTS;
    this.ELIGIBLE_VOTERS = Number.isNaN(data?.ELIGIBLE_VOTERS) ? null : data.ELIGIBLE_VOTERS;
    this.TURNOUT_RATE = Number.isNaN(data?.TURNOUT_RATE) ? null : data.TURNOUT_RATE;
  }
}
