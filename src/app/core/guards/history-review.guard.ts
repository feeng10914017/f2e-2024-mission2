import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';
import { CommonService } from '../services/common.service';

export const historyReviewGuard: CanActivateFn = (route, state) => {
  const commonService = inject(CommonService);
  const { beginGregorianYear } = route.queryParams;
  const isValid = commonService.getYearsSince1996().includes(beginGregorianYear);
  return isValid || createUrlTreeFromSnapshot(route, ['/portal']);
};
