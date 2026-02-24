import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login/login').then((m) => m.Login) },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then((m) => m.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'setup-account',
    loadComponent: () => import('./auth/setup-account/setup-account').then((m) => m.SetupAccount),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },

  {
    path: 'events/create',
    loadComponent: () =>
      import('./events/event-create/event-create').then((m) => m.EventCreate),
    canActivate: [authGuard, adminGuard],
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
  {
    path: 'admin/invitations',
    loadComponent: () =>
      import('./admin/invitation-list/invitation-list').then((m) => m.InvitationList),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./admin/user-list/user-list').then((m) => m.UserList),
    canActivate: [authGuard, superAdminGuard],
  },

  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
    pathMatch: 'full',
  },
];
