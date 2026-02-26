import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 class="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
      <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
        {{ 'ERRORS.PAGE_NOT_FOUND' | transloco }}
      </p>
      <a
        routerLink="/dashboard"
        class="mt-6 inline-block px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
      >
        {{ 'ERRORS.GO_TO_DASHBOARD' | transloco }}
      </a>
    </div>
  `,
})
export class NotFound {}
