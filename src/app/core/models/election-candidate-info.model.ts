import { CandidatePair } from './candidate-pair.model';
import { ElectionIdentifier } from './election-identifier.model';

/** 選舉候選人資訊 */
export class ElectionCandidateInfo extends ElectionIdentifier {
  /** 候選人資訊 */
  CANDIDATES: CandidatePair[];

  constructor(data?: any) {
    super(data);
    this.CANDIDATES = Array.isArray(data?.CANDIDATES)
      ? data.CANDIDATES.map((item: any) => new CandidatePair(item))
      : [];
  }
}
