import { Routes } from '@angular/router';
import { historyReviewGuard } from './core/guards/history-review.guard';

export const routes: Routes = [
  {
    path: 'portal',
    loadComponent: () => import('./views/portal.component').then((x) => x.PortalComponent),
  },
  {
    path: 'historical-review',
    canActivate: [historyReviewGuard],
    loadComponent: () => import('./views/historical-review.component').then((x) => x.HistoricalReviewComponent),
  },
  {
    path: '**',
    redirectTo: 'portal',
    pathMatch: 'full',
  },
];
