import { Component } from '@angular/core';

@Component({
  selector: 'app-arrow-left-icon',
  template: `
    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  `,
  styles: `:host { display: inline-flex; align-items: center; }`,
})
export class ArrowLeftIconComponent {}
