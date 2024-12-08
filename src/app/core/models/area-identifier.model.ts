import { AREA_LEVEL } from '../enums/area-level.enum';

/** 區域識別碼 */
export class AreaIdentifier {
  /** 區域等級 */
  AREA_LEVEL: AREA_LEVEL;

  /** 區域名稱 */
  AREA_NAME: string;

  /** 區域代碼 */
  AREA_CODE: string;

  constructor(data?: any) {
    this.AREA_LEVEL = data?.AREA_LEVEL || AREA_LEVEL.UNKNOWN;
    this.AREA_NAME = data?.AREA_NAME || '';
    this.AREA_CODE = data?.AREA_CODE || '';
  }
}
