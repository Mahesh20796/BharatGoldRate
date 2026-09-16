import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarketRateService } from '../../core/services/market-rate.service';
import { GoldPurity, RateUnit, GoldRates } from '../../core/models/rate.model';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { RateBadgeComponent } from '../../shared/components/rate-badge/rate-badge.component';

@Component({
  selector: 'app-gold-rate',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    InrCurrencyPipe,
    RateBadgeComponent
  ],
  template: `
    <div class="page-container gold-rate-page">
      <!-- Top Title Header -->
      <div class="page-header-row">
        <div>
          <h2 class="page-title">Gold Rate Table & Converter</h2>
          <p class="page-subtitle">Purity-wise daily benchmark gold prices with multi-unit conversion</p>
        </div>
        <app-rate-badge [isLive]="marketService.isLive()"></app-rate-badge>
      </div>

      <!-- Quick Manual Rate Adjuster Card -->
      <div class="app-card gold-card rate-adjuster-card">
        <div class="adjuster-header">
          <div class="header-left">
            <span class="material-symbols-outlined icon">tune</span>
            <h4>Quick Gold Rate Adjuster</h4>
          </div>
          <span class="auto-calc-note">22K & 18K auto-derives from 24K base rate</span>
        </div>

        <div class="adjuster-form-grid">
          <!-- Unit Selector -->
          <div class="form-group">
            <label>Input Unit</label>
            <div class="pill-selector">
              <button class="pill-btn" [class.active]="selectedUnit() === 'gram'" (click)="setUnit('gram')">1 Gram</button>
              <button class="pill-btn" [class.active]="selectedUnit() === '10gram'" (click)="setUnit('10gram')">10 Gram (1 Tola)</button>
              <button class="pill-btn" [class.active]="selectedUnit() === 'kg'" (click)="setUnit('kg')">1 Kilogram</button>
            </div>
          </div>

          <!-- 24K Rate Input -->
          <div class="form-group">
            <label>
              <span>24K Base Rate ({{ unitLabel() }})</span>
              <span class="hint">Pure 99.9%</span>
            </label>
            <div class="input-with-symbol">
              <span class="symbol">₹</span>
              <input
                type="number"
                class="form-control"
                [ngModel]="display24kRate()"
                (ngModelChange)="on24kInputChange($event)"
                placeholder="Enter 24K rate"
                min="1"
              />
            </div>
          </div>
        </div>

        <!-- Derived rates summary pill banner -->
        <div class="derived-banner">
          <div class="derived-item">
            <span class="k-tag">24K Pure</span>
            <span class="k-val">{{ marketService.goldRates()['24K'] | inrCurrency }} / g</span>
          </div>
          <div class="derived-item">
            <span class="k-tag">22K Standard</span>
            <span class="k-val">{{ marketService.goldRates()['22K'] | inrCurrency }} / g</span>
          </div>
          <div class="derived-item">
            <span class="k-tag">18K Hallmark</span>
            <span class="k-val">{{ marketService.goldRates()['18K'] | inrCurrency }} / g</span>
          </div>
        </div>
      </div>

      <!-- Comprehensive Multi-Unit Weight Table -->
      <div class="app-card table-card">
        <div class="table-header">
          <div class="title-wrap">
            <span class="material-symbols-outlined table-icon">table_chart</span>
            <h3>Standard Weight Denominations</h3>
          </div>
          <span class="table-hint">Indian Jewellery Market Units</span>
        </div>

        <div class="table-responsive">
          <table class="rate-table">
            <thead>
              <tr>
                <th>Weight Unit</th>
                <th>24K (Pure 999)</th>
                <th>22K (Hallmark 916)</th>
                <th>18K (750 Gold)</th>
              </tr>
            </thead>
            <tbody>
              @for (row of weightRows(); track row.name) {
                <tr [class.highlight-row]="row.isKey">
                  <td class="unit-cell">
                    <span class="unit-name">{{ row.name }}</span>
                    <span class="unit-grams">{{ row.grams }} g</span>
                  </td>
                  <td class="rate-cell">{{ (marketService.goldRates()['24K'] * row.grams) | inrCurrency }}</td>
                  <td class="rate-cell highlight-cell">{{ (marketService.goldRates()['22K'] * row.grams) | inrCurrency }}</td>
                  <td class="rate-cell">{{ (marketService.goldRates()['18K'] * row.grams) | inrCurrency }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Purity Explainer & Formulas -->
      <div class="purity-guide-grid">
        <div class="app-card guide-box">
          <div class="guide-header">
            <span class="badge badge-gold">24K GOLD</span>
            <h4>99.9% Fine Gold (999)</h4>
          </div>
          <p>
            The purest form of gold with zero alloy mixture. Primarily used for investment bullion, gold bars, minted coins, and Ayurvedic preparations. Too soft for regular jewellery wear.
          </p>
          <div class="formula-chip">Formula: Base Rate ₹{{ marketService.goldRates()['24K'] | inrCurrency:false }}/g</div>
        </div>

        <div class="app-card guide-box">
          <div class="guide-header">
            <span class="badge badge-gold">22K GOLD</span>
            <h4>91.6% Hallmark (916)</h4>
          </div>
          <p>
            The traditional standard for Indian bridal and everyday jewellery. Mixed with 8.4% copper, silver, or zinc for supreme durability and lustrous shine. BIS Hallmark certified.
          </p>
          <div class="formula-chip">Formula: 24K Rate × (22 / 24) = 91.67%</div>
        </div>

        <div class="app-card guide-box">
          <div class="guide-header">
            <span class="badge badge-gold">18K GOLD</span>
            <h4>75.0% Hallmark (750)</h4>
          </div>
          <p>
            Contains 75% pure gold mixed with 25% other metals. Ideal for stone-studded, diamond and solitaire modern jewellery providing superior grip for delicate gem settings.
          </p>
          <div class="formula-chip">Formula: 24K Rate × (18 / 24) = 75.0%</div>
        </div>
      </div>

      <!-- Action Button to Calculator -->
      <div class="cta-row">
        <a routerLink="/calculator" class="btn-primary">
          <span class="material-symbols-outlined">calculate</span>
          <span>Open Gold Price & Making Charge Calculator</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .gold-rate-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;

      .page-title {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .page-subtitle {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-top: 2px;
      }
    }

    .rate-adjuster-card {
      .adjuster-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.25rem;

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-gold);

          h4 {
            font-size: 1.1rem;
            color: var(--text-primary);
          }
        }

        .auto-calc-note {
          font-size: 0.72rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
        }
      }
    }

    .adjuster-form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;

      @media (min-width: 640px) {
        grid-template-columns: 1.2fr 1fr;
      }
    }

    .input-with-symbol {
      position: relative;
      display: flex;
      align-items: center;

      .symbol {
        position: absolute;
        left: 1rem;
        font-weight: 700;
        color: var(--text-gold);
        font-size: 1.1rem;
      }

      input {
        padding-left: 2.2rem;
        font-weight: 700;
        font-size: 1.1rem;
        color: var(--text-primary);
        font-family: var(--font-heading);
      }
    }

    .derived-banner {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);

      .derived-item {
        background: var(--input-bg);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.6rem 0.85rem;
        display: flex;
        flex-direction: column;

        .k-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .k-val {
          font-size: 0.95rem;
          font-weight: 800;
          font-family: var(--font-heading);
          color: var(--text-gold);
          margin-top: 2px;
        }
      }
    }

    /* Table Card */
    .table-card {
      padding: 1.25rem;

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .title-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .table-icon {
            color: var(--text-gold);
          }

          h3 {
            font-size: 1.1rem;
            color: var(--text-primary);
          }
        }

        .table-hint {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
      }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .rate-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th {
        padding: 0.75rem 0.85rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        border-bottom: 1px solid var(--border-subtle);
        background: rgba(255, 255, 255, 0.02);
      }

      td {
        padding: 0.85rem;
        border-bottom: 1px solid var(--border-subtle);
        font-size: 0.9rem;
      }

      .unit-cell {
        display: flex;
        flex-direction: column;

        .unit-name {
          font-weight: 700;
          color: var(--text-primary);
        }
        .unit-grams {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
      }

      .rate-cell {
        font-family: var(--font-heading);
        font-weight: 700;
        color: var(--text-secondary);

        &.highlight-cell {
          color: var(--text-gold);
          font-weight: 800;
        }
      }

      tr.highlight-row {
        background: rgba(212, 175, 55, 0.06);

        td {
          border-color: rgba(212, 175, 55, 0.2);
        }
      }
    }

    /* Purity Guide Cards */
    .purity-guide-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;

      @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
      }

      .guide-box {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .guide-header {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          h4 {
            font-size: 1rem;
            color: var(--text-primary);
          }
        }

        p {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.45;
          flex: 1;
        }

        .formula-chip {
          background: var(--input-bg);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.4rem 0.6rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-gold);
          font-family: monospace;
        }
      }
    }

    .cta-row {
      margin-top: 0.5rem;
    }
  `]
})
export class GoldRateComponent {
  readonly marketService = inject(MarketRateService);

  readonly selectedUnit = signal<RateUnit>('10gram');

  readonly display24kRate = computed<number>(() => {
    const basePerGram = this.marketService.goldRates()['24K'];
    switch (this.selectedUnit()) {
      case 'gram':
        return Math.round(basePerGram * 100) / 100;
      case '10gram':
        return Math.round(basePerGram * 10 * 100) / 100;
      case 'kg':
        return Math.round(basePerGram * 1000 * 100) / 100;
      default:
        return basePerGram * 10;
    }
  });

  readonly unitLabel = computed<string>(() => {
    switch (this.selectedUnit()) {
      case 'gram': return 'per 1 Gram';
      case '10gram': return 'per 10 Gram (1 Tola)';
      case 'kg': return 'per 1 Kilogram';
      default: return 'per 10 Gram';
    }
  });

  readonly weightRows = signal([
    { name: '1 Gram (Base)', grams: 1, isKey: false },
    { name: '4 Grams (Half Pavan)', grams: 4, isKey: false },
    { name: '8 Grams (1 Pavan / Sovereign)', grams: 8, isKey: true },
    { name: '10 Grams (1 Tola / Benchmark)', grams: 10, isKey: true },
    { name: '20 Grams (2 Tolas)', grams: 20, isKey: false },
    { name: '50 Grams', grams: 50, isKey: false },
    { name: '100 Grams (10 Tolas)', grams: 100, isKey: true },
    { name: '500 Grams (Half Kg)', grams: 500, isKey: false },
    { name: '1000 Grams (1 Kilogram)', grams: 1000, isKey: true }
  ]);

  setUnit(unit: RateUnit): void {
    this.selectedUnit.set(unit);
  }

  on24kInputChange(val: number): void {
    if (!val || val <= 0) return;
    const perGram = this.marketService.convertGoldRateToGram(val, this.selectedUnit());
    this.marketService.deriveAndSetGoldFrom24k(perGram);
  }
}
