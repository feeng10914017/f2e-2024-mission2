export class LocationInfo {
  /** 縣市代碼 */
  COUNTYCODE: string;

  /** 縣市英文名稱 */
  COUNTYENG: string;

  /** 縣市ID */
  COUNTYID: string;

  /** 縣市名稱 */
  COUNTYNAME: string;

  /** 備註 */
  NOTE: string;

  /** 鄉鎮代碼 */
  TOWNCODE: string;

  /** 鄉鎮ID */
  TOWNID: string;

  /** 鄉鎮名稱 */
  TOWNNAME: string;

  /** 村里代碼 */
  VILLCODE: string;

  /** 村里英文名稱 */
  VILLENG: string;

  /** 村里名稱 */
  VILLNAME: string;

  constructor(data: any) {
    this.COUNTYCODE = data.COUNTYCODE || '';
    this.COUNTYENG = data.COUNTYENG || '';
    this.COUNTYID = data.COUNTYID || '';
    this.COUNTYNAME = data.COUNTYNAME || '';
    this.NOTE = data.NOTE || '';
    this.TOWNCODE = data.TOWNCODE || '';
    this.TOWNID = data.TOWNID || '';
    this.TOWNNAME = data.TOWNNAME || '';
    this.VILLCODE = data.VILLCODE || '';
    this.VILLENG = data.VILLENG || '';
    this.VILLNAME = data.VILLNAME || '';
  }
}
