import { AreaIdentifier } from './area-identifier.model';
import { AreaResult } from './area-result.model';
import { VotingStatistics } from './voting-statistics.model';

/** 區域統計數據 */
export class AreaCollection extends AreaIdentifier {
  /** 次區域總計數據 */
  SUB_AREA_RESULTS: AreaResult[];

  /** 總計數據 */
  TOTAL_STATISTICS: VotingStatistics;

  constructor(data?: any) {
    super(data);
    this.SUB_AREA_RESULTS = Array.isArray(data?.SUB_AREA_RESULTS)
      ? data.SUB_AREA_RESULTS.map((item: any) => new AreaResult(item))
      : [];
    this.TOTAL_STATISTICS = new VotingStatistics(data.TOTAL_STATISTICS);
  }
}
