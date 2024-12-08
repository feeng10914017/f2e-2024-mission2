import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ZhTwMapComponent } from './components/zh-tw-map/zh-tw-map.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ZhTwMapComponent],
  template: `
    <app-zh-tw-map class="block h-screen" />
    <router-outlet />
  `,
  styles: [],
})
export class AppComponent {
  title = 'f2e-2024-mission2';
}
