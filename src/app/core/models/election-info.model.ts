import { AdminCollection } from './admin-collection.model';
import { CandidatePair } from './candidate-pair.model';

/** 選舉資訊 */
export class ElectionInfo {
  /** 選舉名稱 */
  ELECTION_TITLE: string;

  /** 選舉任期 */
  ELECTION_TERM: number | null;

  /** 選舉西元年 */
  ELECTION_GREGORIAN_YEAR: string;

  /** 候選人資訊 */
  CANDIDATES: CandidatePair[];

  /** 總統計數據 */
  TOTAL_STATISTICS: AdminCollection;

  /** 行政區域總計數據 */
  ADMIN_COLLECTION: AdminCollection[];

  constructor(data?: any) {
    this.ELECTION_TITLE = data?.ELECTION_TITLE || '';
    this.ELECTION_TERM = Number.isNaN(parseInt(data?.ELECTION_TERM)) ? null : data.ELECTION_TERM;
    this.ELECTION_GREGORIAN_YEAR = data?.ELECTION_GREGORIAN_YEAR || '';
    this.CANDIDATES = Array.isArray(data?.CANDIDATES)
      ? data.CANDIDATES.map((item: any) => new CandidatePair(item))
      : [];
    this.TOTAL_STATISTICS = new AdminCollection(data?.TOTAL_STATISTICS);
    this.ADMIN_COLLECTION = Array.isArray(data?.ADMIN_COLLECTION)
      ? data.ADMIN_COLLECTION.map((item: any) => new AdminCollection(item))
      : [];
  }
}
