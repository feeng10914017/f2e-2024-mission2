import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `版權所有©2023 台灣歷年總統 都幾?`,
  styles: `
    :host {
      @apply flex items-center justify-center bg-gray-200 py-4 text-sm text-dark;
    }
  `,
})
export class FooterComponent {}
