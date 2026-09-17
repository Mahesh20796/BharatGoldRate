import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
            <span class="chip-label">10 Gram (1 Tola)</span>
            <span class="chip-val">{{ marketService.silverBreakdown().per10g | inrCurrency }}</span>
          </div>
          <div class="metric-chip">
            <span class="chip-label">100 Gram</span>
            <span class="chip-val">{{ marketService.silverBreakdown().per100g | inrCurrency }}</span>
          </div>
          <div class="metric-chip primary-chip">
            <span class="chip-label">1 Kilogram (Benchmark)</span>
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
          <span class="table-hint">Indian Bullion & Utensil Benchmarks</span>
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
                    <a [routerLink]="['/calculator']" [queryParams]="{ metal: 'silver', weight: row.grams }" class="table-calc-link" title="Calculate Silver Price">
                      <span class="material-symbols-outlined">calculate</span>
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Silver Products & Uses (Clean list, no emojis) -->
      <div class="app-card info-card">
        <div class="info-header">
          <span class="material-symbols-outlined info-icon">category</span>
          <h3>Standard Silver Articles & Classifications</h3>
        </div>
        <div class="products-grid">
          <div class="product-tag-item">
            <strong>Silver Jewellery:</strong> Anklets (Payal), Chains, Bracelets, Finger Rings, Bangles
          </div>
          <div class="product-tag-item">
            <strong>Bullion Coins:</strong> 10g, 20g, 50g, 100g Fine 999 Minted Bullion Coins
          </div>
          <div class="product-tag-item">
            <strong>Cast Bars & Ladis:</strong> 250g, 500g, 1kg, 5kg Refinery Cast Bars
          </div>
          <div class="product-tag-item">
            <strong>Pooja Silverware:</strong> Traditional Thali, Diya, Kalash, Panchapatra, Tumblers
          </div>
          <div class="product-tag-item">
            <strong>Divine Articles:</strong> Fine Cast Murtis, Idols & Temple Dedication Silver
          </div>
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
      gap: 1.25rem;
    }

    .page-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;

      .page-title {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .page-subtitle {
        font-size: 0.82rem;
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
        margin-bottom: 1rem;

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: var(--text-silver);

          h4 {
            font-size: 1.05rem;
            color: var(--text-primary);
          }
        }

        .auto-calc-note {
          font-size: 0.7rem;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          padding: 2px 7px;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-subtle);
        }
      }
    }

    .adjuster-form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.85rem;

      @media (min-width: 640px) {
        grid-template-columns: 1.2fr 1fr;
      }

      @media (max-width: 768px) {
        .pill-selector {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 3px;

          .pill-btn {
            font-size: 0.74rem;
            padding: 0.5rem 0.35rem;
          }
        }
      }
    }

    .input-with-symbol {
      position: relative;
      display: flex;
      align-items: center;

      .symbol {
        position: absolute;
        left: 0.85rem;
        font-weight: 700;
        color: var(--text-secondary);
        font-size: 1rem;
      }

      input {
        padding-left: 2rem;
        font-weight: 700;
        font-size: 1.05rem;
        color: var(--text-primary);
        font-family: var(--font-heading);
      }
    }

    .silver-metrics-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 0.65rem;
      margin-top: 0.85rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--border-subtle);

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.45rem;

        .metric-chip.primary-chip {
          grid-column: 1 / -1;
        }
      }

      .metric-chip {
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        padding: 0.55rem 0.75rem;
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
          border-color: var(--border-silver);
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
        margin-bottom: 0.85rem;

        @media (max-width: 768px) {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.35rem;
        }

        .title-wrap {
          display: flex;
          align-items: center;
          gap: 0.45rem;

          .table-icon {
            color: var(--text-silver);
          }

          h3 {
            font-size: 1.05rem;
            color: var(--text-primary);
          }
        }

        .table-hint {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
      }
    }

    .table-responsive {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      width: 100%;
    }

    .rate-table {
      width: 100%;
      min-width: 480px;
      border-collapse: collapse;
      text-align: left;

      th {
        padding: 0.65rem 0.8rem;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        border-bottom: 1px solid var(--border-subtle);
        background: var(--bg-surface-elevated);
      }

      td {
        padding: 0.75rem 0.8rem;
        border-bottom: 1px solid var(--border-subtle);
        font-size: 0.88rem;
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
          color: var(--text-silver);
          font-weight: 800;
        }
      }

      .table-calc-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: var(--radius-xs);
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-subtle);
        color: var(--text-silver);
        transition: all 0.15s ease;

        span {
          font-size: 16px;
        }

        &:hover {
          background: #CBD5E1;
          color: #0F172A;
        }
      }

      tr.highlight-row {
        background: rgba(148, 163, 184, 0.04);
      }
    }

    /* Products Grid */
    .info-card {
      .info-header {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        margin-bottom: 0.85rem;
        color: var(--text-silver);

        h3 {
          font-size: 1.05rem;
          color: var(--text-primary);
        }
      }

      .products-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.5rem;

        @media (min-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }

        .product-tag-item {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          padding: 0.65rem 0.85rem;
          font-size: 0.8rem;
          color: var(--text-secondary);

          strong {
            color: var(--text-primary);
          }
        }
      }
    }

    .cta-row {
      margin-top: 0.25rem;
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
    { name: '1 Gram (Base Unit)', grams: 1, isKey: false },
    { name: '10 Grams (1 Tola)', grams: 10, isKey: true },
    { name: '25 Grams', grams: 25, isKey: false },
    { name: '31.1035 Grams (1 Troy Ounce)', grams: 31.1035, isKey: false },
    { name: '50 Grams (Bullion Coin)', grams: 50, isKey: false },
    { name: '100 Grams (10 Tolas Benchmark)', grams: 100, isKey: true },
    { name: '250 Grams (Quarter Kg Bar)', grams: 250, isKey: false },
    { name: '500 Grams (Half Kg Bar / Thali)', grams: 500, isKey: false },
    { name: '1000 Grams (1 Kilogram Master Benchmark)', grams: 1000, isKey: true },
    { name: '5000 Grams (5 Kilograms Refinery Ingot)', grams: 5000, isKey: false }
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
