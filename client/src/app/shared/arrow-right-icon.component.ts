import { Component } from '@angular/core';

@Component({
  selector: 'app-arrow-right-icon',
  template: `
    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  `,
  styles: `:host { display: inline-flex; align-items: center; }`,
})
export class ArrowRightIconComponent {}
