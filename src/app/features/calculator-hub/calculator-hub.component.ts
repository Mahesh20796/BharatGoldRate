import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GoldCalculatorComponent } from '../gold-calculator/gold-calculator.component';
import { SilverCalculatorComponent } from '../silver-calculator/silver-calculator.component';
import { MetalType } from '../../core/models/calculator.model';

@Component({
  selector: 'app-calculator-hub',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    GoldCalculatorComponent,
    SilverCalculatorComponent
  ],
  template: `
    <div class="page-container calculator-hub-page">
      <!-- Top Navigation Tabs -->
      <div class="calculator-tab-bar">
        <button
          class="calc-tab-btn gold-tab"
          [class.active]="activeTab() === 'gold'"
          (click)="setTab('gold')"
        >
          <span class="material-symbols-outlined tab-icon">diamond</span>
          <div class="tab-label-wrap">
            <span class="tab-title">Gold Calculator</span>
            <span class="tab-sub">24K / 22K / 18K Jewellery</span>
          </div>
        </button>

        <button
          class="calc-tab-btn silver-tab"
          [class.active]="activeTab() === 'silver'"
          (click)="setTab('silver')"
        >
          <span class="material-symbols-outlined tab-icon">monetization_on</span>
          <div class="tab-label-wrap">
            <span class="tab-title">Silver Calculator</span>
            <span class="tab-sub">Payal, Coins & Bullion</span>
          </div>
        </button>
      </div>

      <!-- Active Calculator Container -->
      <div class="calc-content-area">
        @if (activeTab() === 'gold') {
          <app-gold-calculator></app-gold-calculator>
        } @else {
          <app-silver-calculator></app-silver-calculator>
        }
      </div>
    </div>
  `,
  styles: [`
    .calculator-hub-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .calculator-tab-bar {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      background: var(--bg-surface-elevated);
      padding: 6px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
    }

    .calc-tab-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      background: transparent;
      cursor: pointer;
      text-align: left;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      .tab-icon {
        font-size: 24px;
        color: var(--text-muted);
        transition: color 0.2s ease, transform 0.2s ease;
      }

      .tab-label-wrap {
        display: flex;
        flex-direction: column;

        .tab-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-secondary);
        }

        .tab-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
      }

      &.gold-tab.active {
        background: var(--card-gradient-gold);
        border-color: var(--border-highlight);
        box-shadow: 0 4px 16px rgba(212, 175, 55, 0.25);

        .tab-icon {
          color: var(--gold-400);
          transform: scale(1.1);
        }

        .tab-title {
          color: var(--text-primary);
        }
      }

      &.silver-tab.active {
        background: var(--card-gradient-silver);
        border-color: rgba(148, 163, 184, 0.4);
        box-shadow: 0 4px 16px rgba(148, 163, 184, 0.25);

        .tab-icon {
          color: var(--silver-300);
          transform: scale(1.1);
        }

        .tab-title {
          color: var(--text-primary);
        }
      }
    }
  `]
})
export class CalculatorHubComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly activeTab = signal<MetalType>('gold');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['metal'] === 'silver') {
        this.activeTab.set('silver');
      } else if (params['metal'] === 'gold') {
        this.activeTab.set('gold');
      }
    });
  }

  setTab(tab: MetalType): void {
    this.activeTab.set(tab);
  }
}
