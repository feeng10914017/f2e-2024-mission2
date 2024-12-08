import { AreaIdentifier } from './area-identifier.model';
import { VotingStatistics } from './voting-statistics.model';

/** 區域投票結果 */
export class AreaResult extends AreaIdentifier {
  /** 投票統計 */
  STATISTICS: VotingStatistics;

  constructor(data?: any) {
    super(data);
    this.STATISTICS = new VotingStatistics(data.STATISTICS);
  }
}
