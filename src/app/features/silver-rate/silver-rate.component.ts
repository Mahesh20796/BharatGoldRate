import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarketRateService } from '../../core/services/market-rate.service';
import { RateUnit } from '../../core/models/rate.model';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { RateBadgeComponent } from '../../shared/components/rate-badge/rate-badge.component';

@Component({
  selector: 'app-silver-rate',
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
    <div class="page-container silver-rate-page">
      <!-- Top Title Header -->
      <div class="page-header-row">
        <div>
          <h2 class="page-title">Silver Rate Table & Converter</h2>
          <p class="page-subtitle">Pure silver bullion & jewellery prices across Indian market weight units</p>
        </div>
        <app-rate-badge [isLive]="marketService.isLive()"></app-rate-badge>
      </div>

      <!-- Silver Rate Input & Adjuster -->
      <div class="app-card silver-card rate-adjuster-card">
        <div class="adjuster-header">
          <div class="header-left">
            <span class="material-symbols-outlined icon">tune</span>
            <h4>Quick Silver Rate Adjuster</h4>
          </div>
          <span class="auto-calc-note">Unit rates auto-calculate</span>
        </div>

        <div class="adjuster-form-grid">
          <!-- Unit Selector -->
          <div class="form-group">
            <label>Select Input Unit</label>
            <div class="pill-selector">
              <button class="pill-btn" [class.active-silver]="selectedUnit() === 'kg'" (click)="setUnit('kg')">1 Kilogram (Kg)</button>
              <button class="pill-btn" [class.active-silver]="selectedUnit() === '100gram'" (click)="setUnit('100gram')">100 Gram</button>
              <button class="pill-btn" [class.active-silver]="selectedUnit() === '10gram'" (click)="setUnit('10gram')">10 Gram</button>
              <button class="pill-btn" [class.active-silver]="selectedUnit() === 'gram'" (click)="setUnit('gram')">1 Gram</button>
            </div>
          </div>

          <!-- Silver Rate Input -->
          <div class="form-group">
            <label>
              <span>Silver Base Rate ({{ unitLabel() }})</span>
              <span class="hint">999 Fine Silver</span>
            </label>
            <div class="input-with-symbol">
              <span class="symbol">₹</span>
              <input
                type="number"
                class="form-control"
                [ngModel]="displaySilverRate()"
                (ngModelChange)="onSilverInputChange($event)"
                placeholder="Enter silver rate"
                min="1"
              />
            </div>
          </div>
        </div>

        <!-- Metric Summary Badges -->
        <div class="silver-metrics-bar">
          <div class="metric-chip">
            <span class="chip-label">1 Gram</span>
            <span class="chip-val">{{ marketService.silverBreakdown().perGram | inrCurrency }}</span>
          </div>
          <div class="metric-chip">
            <span class="chip-label">10 Gram</span>
            <span class="chip-val">{{ marketService.silverBreakdown().per10g | inrCurrency }}</span>
          </div>
          <div class="metric-chip">
            <span class="chip-label">100 Gram</span>
            <span class="chip-val">{{ marketService.silverBreakdown().per100g | inrCurrency }}</span>
          </div>
          <div class="metric-chip primary-chip">
            <span class="chip-label">1 Kilogram</span>
            <span class="chip-val">{{ marketService.silverBreakdown().perKg | inrCurrency }}</span>
          </div>
        </div>
      </div>

      <!-- Denominations Table -->
      <div class="app-card table-card">
        <div class="table-header">
          <div class="title-wrap">
            <span class="material-symbols-outlined table-icon">table_chart</span>
            <h3>Standard Silver Weight Denominations</h3>
          </div>
          <span class="table-hint">Indian Market Benchmarks</span>
        </div>

        <div class="table-responsive">
          <table class="rate-table">
            <thead>
              <tr>
                <th>Denomination / Unit</th>
                <th>Weight (Grams)</th>
                <th>Pure Silver Price (INR)</th>
                <th>Quick Calc</th>
              </tr>
            </thead>
            <tbody>
              @for (row of silverRows(); track row.name) {
                <tr [class.highlight-row]="row.isKey">
                  <td class="unit-cell">
                    <span class="unit-name">{{ row.name }}</span>
                  </td>
                  <td class="weight-cell">{{ row.grams }} g</td>
                  <td class="rate-cell" [class.highlight-val]="row.isKey">
                    {{ (marketService.silverBreakdown().perGram * row.grams) | inrCurrency }}
                  </td>
                  <td>
                    <a [routerLink]="['/calculator']" [queryParams]="{ metal: 'silver', weight: row.grams }" class="table-calc-link">
                      <span class="material-symbols-outlined">calculate</span>
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Silver Products & Uses -->
      <div class="app-card info-card">
        <div class="info-header">
          <span class="material-symbols-outlined info-icon">category</span>
          <h3>Popular Silver Products in India</h3>
        </div>
        <div class="products-grid">
          <div class="product-tag-item">✨ Silver Jewellery (Anklets / Payal, Chains, Rings, Bangles)</div>
          <div class="product-tag-item">🪙 Silver Bullion Coins (10g, 50g, 100g Laxmi-Ganesh coins)</div>
          <div class="product-tag-item">🧱 Silver Cast Bars & Ladis (250g, 500g, 1kg, 5kg)</div>
          <div class="product-tag-item">🍽️ Pooja Utensils & Silverware (Thali, Diya, Kalash, Glass)</div>
          <div class="product-tag-item">🛕 Pure Silver Murtis & Divine Idols</div>
        </div>
      </div>

      <!-- CTA -->
      <div class="cta-row">
        <a routerLink="/calculator" [queryParams]="{ metal: 'silver' }" class="btn-primary btn-silver">
          <span class="material-symbols-outlined">calculate</span>
          <span>Open Silver Making Charge & GST Calculator</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .silver-rate-page {
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
          color: var(--text-silver);

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
        color: var(--text-secondary);
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

    .silver-metrics-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);

      .metric-chip {
        background: var(--input-bg);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.6rem 0.85rem;
        display: flex;
        flex-direction: column;

        .chip-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .chip-val {
          font-size: 0.95rem;
          font-weight: 800;
          font-family: var(--font-heading);
          color: var(--text-silver);
          margin-top: 2px;
        }

        &.primary-chip {
          border-color: rgba(148, 163, 184, 0.4);
          background: rgba(148, 163, 184, 0.1);
          .chip-val {
            color: var(--text-primary);
          }
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
            color: var(--silver-300);
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

      .unit-name {
        font-weight: 700;
        color: var(--text-primary);
      }

      .weight-cell {
        color: var(--text-muted);
        font-weight: 600;
      }

      .rate-cell {
        font-family: var(--font-heading);
        font-weight: 700;
        color: var(--text-secondary);

        &.highlight-val {
          color: var(--silver-200);
          font-weight: 800;
        }
      }

      .table-calc-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        background: var(--input-bg);
        border: 1px solid var(--border-subtle);
        color: var(--silver-300);
        transition: all 0.2s ease;

        span {
          font-size: 18px;
        }

        &:hover {
          background: var(--silver-gradient);
          color: #0F172A;
        }
      }

      tr.highlight-row {
        background: rgba(148, 163, 184, 0.06);

        td {
          border-color: rgba(148, 163, 184, 0.2);
        }
      }
    }

    /* Products Grid */
    .info-card {
      .info-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: var(--silver-300);

        h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
        }
      }

      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 0.6rem;

        .product-tag-item {
          background: var(--input-bg);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.65rem 0.85rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
      }
    }

    .cta-row {
      margin-top: 0.5rem;
    }
  `]
})
export class SilverRateComponent {
  readonly marketService = inject(MarketRateService);

  readonly selectedUnit = signal<RateUnit>('kg');

  readonly displaySilverRate = computed<number>(() => {
    const kgRate = this.marketService.silverRatePerKg();
    switch (this.selectedUnit()) {
      case 'kg':
        return kgRate;
      case '100gram':
        return kgRate / 10;
      case '10gram':
        return kgRate / 100;
      case 'gram':
        return kgRate / 1000;
      default:
        return kgRate;
    }
  });

  readonly unitLabel = computed<string>(() => {
    switch (this.selectedUnit()) {
      case 'kg': return 'per 1 Kilogram';
      case '100gram': return 'per 100 Gram';
      case '10gram': return 'per 10 Gram';
      case 'gram': return 'per 1 Gram';
      default: return 'per 1 Kilogram';
    }
  });

  readonly silverRows = signal([
    { name: '1 Gram (Base)', grams: 1, isKey: false },
    { name: '10 Grams (1 Tola)', grams: 10, isKey: true },
    { name: '50 Grams (Silver Bar/Coin)', grams: 50, isKey: false },
    { name: '100 Grams (10 Tolas / Coin)', grams: 100, isKey: true },
    { name: '250 Grams (Quarter Kg Bar)', grams: 250, isKey: false },
    { name: '500 Grams (Half Kg Bar/Thali)', grams: 500, isKey: false },
    { name: '1000 Grams (1 Kilogram Benchmark)', grams: 1000, isKey: true },
    { name: '5000 Grams (5 Kilograms Master Bar)', grams: 5000, isKey: false }
  ]);

  setUnit(unit: RateUnit): void {
    this.selectedUnit.set(unit);
  }

  onSilverInputChange(val: number): void {
    if (!val || val <= 0) return;
    const kgRate = this.marketService.convertSilverRateToKg(val, this.selectedUnit());
    this.marketService.updateSilverRate(kgRate);
  }
}
