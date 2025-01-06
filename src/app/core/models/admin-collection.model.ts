import { ADMIN_LEVEL } from '../enums/admin-level.enum';
import { VotingStatistics } from './voting-statistics.model';

/** 區域統計數據 */
export class AdminCollection extends VotingStatistics {
  /** 行政區域等級 */
  ADMIN_LEVEL: ADMIN_LEVEL;

  /** 行政區域名稱 */
  ADMIN_NAME: string;

  /** 行政區域代碼 */
  ADMIN_CODE: string;

  constructor(data?: any) {
    super(data);
    this.ADMIN_LEVEL = data?.ADMIN_LEVEL || ADMIN_LEVEL.UNKNOWN;
    this.ADMIN_NAME = data?.ADMIN_NAME || '';
    this.ADMIN_CODE = data?.ADMIN_CODE || '';
  }
}
