import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: ` <div class="min-h-dvh"><router-outlet /></div>`,
  styles: [],
})
export class AppComponent {}
