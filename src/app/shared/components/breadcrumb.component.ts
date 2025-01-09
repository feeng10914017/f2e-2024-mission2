import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  imports: [],
  template: `
    <div class="flex gap-x-2 text-base leading-4 text-light">
      @for (item of breadcrumbList; track $index; let first = $first, last = $last) {
        @if (!first) {
          <span>/</span>
        }
        @if (!last) {
          <span>{{ item }}</span>
        } @else {
          <span class="text-primary">{{ item }}</span>
        }
      }
    </div>
  `,
  styles: `
    span {
      @apply cursor-default;
    }
  `,
})
export class BreadcrumbComponent {
  @Input({ required: true }) breadcrumbList!: string[];
}
