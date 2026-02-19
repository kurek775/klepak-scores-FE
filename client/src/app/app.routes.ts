import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login/login').then((m) => m.Login) },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then((m) => m.Register),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },

  {
    path: 'events/import',
    loadComponent: () =>
      import('./events/event-import/event-import').then((m) => m.EventImport),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'events/:eventId/score/:activityId',
    loadComponent: () =>
      import('./scoring/scoring-view/scoring-view').then((m) => m.ScoringView),
    canActivate: [authGuard],
  },
  {
    path: 'events/:id/leaderboard',
    loadComponent: () =>
      import('./events/leaderboard/leaderboard').then((m) => m.Leaderboard),
    canActivate: [authGuard],
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./events/event-detail/event-detail').then((m) => m.EventDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin/events/:id/diploma',
    loadComponent: () =>
      import('./admin/diploma-editor/diploma-editor').then((m) => m.DiplomaEditor),
    canActivate: [authGuard, adminGuard],
  },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
