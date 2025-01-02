import { Component } from '@angular/core';

@Component({
  selector: 'app-presidential-votes',
  imports: [],
  template: `
    <div class="rounded-xl bg-gray-200 px-4 pb-4 pt-6">
      <h5 class="mb-4 text-xl font-bold text-dark">總統得票數</h5>
      <div class="grid gap-4 xl:grid-flow-col">
        <div class="rounded-xl bg-white px-6 py-4">123</div>

        <div class="rounded-xl bg-white px-6 py-4">123</div>
      </div>
    </div>
  `,
  styles: ``,
})
export class PresidentialVotesComponent {}
