import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rate-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="isLive() ? 'badge-live' : 'badge-manual'">
      @if (isLive()) {
        <span class="pulse-dot"></span>
        <span>LIVE RATE</span>
      } @else {
        <span class="material-symbols-outlined" style="font-size: 14px;">edit_note</span>
        <span>MANUAL RATE</span>
      }
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class RateBadgeComponent {
  isLive = input<boolean>(false);
}
