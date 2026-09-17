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
          <span class="material-symbols-outlined tab-icon">toll</span>
          <div class="tab-label-wrap">
            <span class="tab-title">Gold Price Estimator</span>
            <span class="tab-sub">24K / 22K / 18K Jewellery & Bullion</span>
          </div>
        </button>

        <button
          class="calc-tab-btn silver-tab"
          [class.active]="activeTab() === 'silver'"
          (click)="setTab('silver')"
        >
          <span class="material-symbols-outlined tab-icon">monetization_on</span>
          <div class="tab-label-wrap">
            <span class="tab-title">Silver Price Estimator</span>
            <span class="tab-sub">Payal, Utensils, Coins & Bars</span>
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
      gap: 1.25rem;
    }

    .calculator-tab-bar {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      background: var(--bg-surface);
      padding: 4px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }

    .calc-tab-btn {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.75rem 0.95rem;
      border-radius: var(--radius-xs);
      border: 1px solid transparent;
      background: transparent;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;

      .tab-icon {
        font-size: 22px;
        color: var(--text-muted);
        transition: color 0.15s ease;
      }

      .tab-label-wrap {
        display: flex;
        flex-direction: column;

        .tab-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .tab-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
      }

      &.gold-tab.active {
        background: var(--bg-surface-elevated);
        border-color: var(--border-gold);

        .tab-icon {
          color: var(--text-gold);
        }

        .tab-title {
          color: var(--text-gold);
        }
      }

      &.silver-tab.active {
        background: var(--bg-surface-elevated);
        border-color: var(--border-silver);

        .tab-icon {
          color: var(--text-silver);
        }

        .tab-title {
          color: var(--text-silver);
        }
      }

      @media (max-width: 600px) {
        padding: 0.6rem 0.65rem;
        gap: 0.45rem;

        .tab-icon {
          font-size: 20px;
        }

        .tab-label-wrap {
          .tab-title {
            font-size: 0.8rem;
          }
          .tab-sub {
            display: none;
          }
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
