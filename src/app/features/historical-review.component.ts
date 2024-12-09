import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-historical-review',
  imports: [HeaderComponent],
  template: ` <app-header /> `,
  styles: ``,
  host: { class: 'flex flex-col min-h-dvh bg-sky-200' },
})
export class HistoricalReviewComponent {}
