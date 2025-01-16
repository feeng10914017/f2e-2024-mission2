import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-progress-bar',
  imports: [AsyncPipe],
  template: `<div class="relative">
    @if (isLoading$ | async) {
      <div class="absolute z-10 h-2 w-full bg-gray-300">
        <div class="h-full bg-primary transition-all" [style.width.%]="totalProgress$ | async"></div>
      </div>
    }
  </div> `,
  styles: ``,
})
export class ProgressBarComponent {
  private loadingService = inject(LoadingService);
  protected isLoading$ = this.loadingService.isLoading$;
  protected totalProgress$ = this.loadingService.totalProgress$;
}
