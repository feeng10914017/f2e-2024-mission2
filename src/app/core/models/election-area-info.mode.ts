import { AreaCollection } from './area-collection.model';
import { ElectionIdentifier } from './election-identifier.model';

/** 選舉候選人資訊 */
export class ElectionAreaInfo extends ElectionIdentifier {
  /** 區域資料集合 */
  AREAS: AreaCollection;

  constructor(data?: any) {
    super(data);
    this.AREAS = new AreaCollection(data?.AREAS);
  }
}
