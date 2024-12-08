import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

export const historyReviewGuard: CanActivateFn = (route, state) => {
  const isSelectedYear = true;
  return isSelectedYear ? true : createUrlTreeFromSnapshot(route, ['/portal']);
};
