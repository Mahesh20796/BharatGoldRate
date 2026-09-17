import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketRateService } from '../../core/services/market-rate.service';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { RateBadgeComponent } from '../../shared/components/rate-badge/rate-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InrCurrencyPipe,
    RateBadgeComponent
  ],
  template: `
    <div class="page-container dashboard-page">
      <!-- Market Terminal Banner -->
      <section class="market-hero-card app-card gold-card">
        <div class="hero-top-row">
          <div class="terminal-badge">
            <span class="material-symbols-outlined icon">candlestick_chart</span>
            <span>INDIA BULLION BENCHMARK</span>
          </div>
          <app-rate-badge [isLive]="marketService.isLive()"></app-rate-badge>
        </div>

        <div class="hero-content">
          <h2 class="hero-title">Live Gold & Silver Rates</h2>
          <p class="hero-subtitle">
            Official benchmark bullion prices in Indian Rupees (INR) for 24K pure, 22K hallmark jewellery, and 999 fine silver.
          </p>
        </div>

        <div class="terminal-stats-grid">
          <div class="stat-cell">
            <span class="cell-label">24K Pure Gold / 10g</span>
            <span class="cell-value gold-text">
              {{ (marketService.goldRates()['24K'] * 10) | inrCurrency }}
            </span>
            <span class="cell-sub">Base ₹{{ marketService.goldRates()['24K'] | inrCurrency:false }}/g</span>
          </div>

          <div class="stat-cell">
            <span class="cell-label">22K Hallmark / 10g</span>
            <span class="cell-value gold-text">
              {{ (marketService.goldRates()['22K'] * 10) | inrCurrency }}
            </span>
            <span class="cell-sub">1 Pavan (8g) = {{ (marketService.goldRates()['22K'] * 8) | inrCurrency }}</span>
          </div>

          <div class="stat-cell">
            <span class="cell-label">Fine Silver / 1 Kg</span>
            <span class="cell-value silver-text">
              {{ marketService.silverRatePerKg() | inrCurrency }}
            </span>
            <span class="cell-sub">100g = {{ marketService.silverBreakdown().per100g | inrCurrency }}</span>
          </div>

          <div class="stat-cell">
            <span class="cell-label">Gold / Silver Ratio</span>
            <span class="cell-value ratio-text">
              {{ (marketService.goldRates()['24K'] / marketService.silverBreakdown().perGram).toFixed(1) }}x
            </span>
            <span class="cell-sub">1g Gold = {{ (marketService.goldRates()['24K'] / marketService.silverBreakdown().perGram).toFixed(1) }}g Silver</span>
          </div>
        </div>
      </section>

      <!-- Main Rates Section: Gold & Silver Breakdown -->
      <section class="rates-grid-section">
        <div class="section-title-row">
          <div class="title-with-icon">
            <span class="material-symbols-outlined section-icon gold">toll</span>
            <h3>Gold Rates by Purity</h3>
          </div>
          <a routerLink="/gold-rate" class="view-all-link">
            <span>Denomination Table</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>

        <!-- 3 Gold Purity Cards (24K, 22K, 18K) -->
        <div class="gold-cards-grid">
          @for (item of marketService.goldPurityList(); track item.purity) {
            <div class="app-card purity-card" [class.gold-card]="item.purity === '24K' || item.purity === '22K'">
              <div class="card-header-row">
                <div class="purity-title-wrap">
                  <span class="purity-tag" [class.purity-22k]="item.purity === '22K'">{{ item.purity }}</span>
                  <div>
                    <h4 class="purity-name">{{ item.name }}</h4>
                    <span class="fineness-text">{{ item.fineness }}</span>
                  </div>
                </div>
                <div class="trend-indicator up">
                  <span class="material-symbols-outlined">trending_up</span>
                  <span>+{{ item.changePercent }}%</span>
                </div>
              </div>

              <!-- Primary Price per 1 Gram -->
              <div class="price-hero-box">
                <span class="price-label">Price per 1 Gram</span>
                <div class="main-price">{{ item.perGram | inrCurrency }}</div>
              </div>

              <!-- Multi-unit breakdown -->
              <div class="price-sub-grid">
                <div class="sub-item">
                  <span class="sub-label">8g (1 Pavan)</span>
                  <span class="sub-val">{{ (item.perGram * 8) | inrCurrency }}</span>
                </div>
                <div class="sub-item">
                  <span class="sub-label">10g (1 Tola)</span>
                  <span class="sub-val">{{ item.per10g | inrCurrency }}</span>
                </div>
                <div class="sub-item">
                  <span class="sub-label">100g</span>
                  <span class="sub-val">{{ (item.perGram * 100) | inrCurrency }}</span>
                </div>
                <div class="sub-item">
                  <span class="sub-label">1 Kilogram</span>
                  <span class="sub-val">{{ item.perKg | inrCurrency }}</span>
                </div>
              </div>

              <!-- Action Link -->
              <a [routerLink]="['/calculator']" [queryParams]="{ metal: 'gold', purity: item.purity }" class="btn-card-calc">
                <span class="material-symbols-outlined">calculate</span>
                <span>Estimate {{ item.purity }} Price</span>
              </a>
            </div>
          }
        </div>

        <!-- Silver Benchmark Card -->
        <div class="section-title-row silver-header">
          <div class="title-with-icon">
            <span class="material-symbols-outlined section-icon silver">monetization_on</span>
            <h3>Silver Market Rates</h3>
          </div>
          <a routerLink="/silver-rate" class="view-all-link">
            <span>Denomination Table</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>

        <div class="app-card silver-card silver-overview-card">
          <div class="card-header-row">
            <div class="purity-title-wrap">
              <span class="purity-tag silver-tag">999</span>
              <div>
                <h4 class="purity-name">Fine Silver 99.9% Pure</h4>
                <span class="fineness-text">Indian Bullion & Jewellers Standard (IBJA)</span>
              </div>
            </div>
            <div class="trend-indicator up">
              <span class="material-symbols-outlined">trending_up</span>
              <span>+{{ marketService.silverBreakdown().changePercent }}%</span>
            </div>
          </div>

          <div class="silver-metrics-grid">
            <div class="silver-metric-box primary">
              <span class="metric-label">Per 1 Kilogram (1000g)</span>
              <div class="metric-value">{{ marketService.silverBreakdown().perKg | inrCurrency }}</div>
            </div>
            <div class="silver-metric-box">
              <span class="metric-label">Per 100 Gram</span>
              <div class="metric-value">{{ marketService.silverBreakdown().per100g | inrCurrency }}</div>
            </div>
            <div class="silver-metric-box">
              <span class="metric-label">Per 10 Gram</span>
              <div class="metric-value">{{ marketService.silverBreakdown().per10g | inrCurrency }}</div>
            </div>
            <div class="silver-metric-box">
              <span class="metric-label">Per 1 Gram</span>
              <div class="metric-value">{{ marketService.silverBreakdown().perGram | inrCurrency }}</div>
            </div>
          </div>

          <a routerLink="/calculator" [queryParams]="{ metal: 'silver' }" class="btn-card-calc silver-calc-btn">
            <span class="material-symbols-outlined">calculate</span>
            <span>Calculate Silver Jewellery & Bullion Price</span>
          </a>
        </div>
      </section>

      <!-- Quick Action Utilities -->
      <section class="quick-tools-section">
        <h3 class="section-heading">Calculators & Market Tools</h3>
        <div class="tools-grid">
          <a routerLink="/calculator" class="tool-tile">
            <div class="tool-icon gold-icon">
              <span class="material-symbols-outlined">calculate</span>
            </div>
            <div class="tool-info">
              <h4>Gold Calculator</h4>
              <p>Making charges & GST breakdown</p>
            </div>
            <span class="material-symbols-outlined tool-arrow">chevron_right</span>
          </a>

          <a routerLink="/calculator" [queryParams]="{ metal: 'silver' }" class="tool-tile">
            <div class="tool-icon silver-icon">
              <span class="material-symbols-outlined">shopping_bag</span>
            </div>
            <div class="tool-info">
              <h4>Silver Calculator</h4>
              <p>Payal, Utensil & Coin estimate</p>
            </div>
            <span class="material-symbols-outlined tool-arrow">chevron_right</span>
          </a>

          <a routerLink="/charts" class="tool-tile">
            <div class="tool-icon chart-icon">
              <span class="material-symbols-outlined">show_chart</span>
            </div>
            <div class="tool-info">
              <h4>10-Year Analysis</h4>
              <p>2017 to 2026 historical trends</p>
            </div>
            <span class="material-symbols-outlined tool-arrow">chevron_right</span>
          </a>

          <a routerLink="/rate-settings" class="tool-tile">
            <div class="tool-icon settings-icon">
              <span class="material-symbols-outlined">price_change</span>
            </div>
            <div class="tool-info">
              <h4>Update Rates</h4>
              <p>Manual rate & labour customizer</p>
            </div>
            <span class="material-symbols-outlined tool-arrow">chevron_right</span>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Market Hero Card */
    .market-hero-card {
      padding: 1.35rem;

      .hero-top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.85rem;

        .terminal-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--text-gold);
          text-transform: uppercase;

          .icon {
            font-size: 16px;
          }
        }
      }

      .hero-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 0.35rem;

        @media (min-width: 768px) {
          font-size: 1.85rem;
        }
      }

      .hero-subtitle {
        font-size: 0.85rem;
        color: var(--text-secondary);
        max-width: 680px;
        line-height: 1.45;
        margin-bottom: 1.25rem;
      }
    }

    .terminal-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 0.65rem;

      @media (max-width: 767px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;

        .stat-cell {
          padding: 0.65rem 0.75rem;

          .cell-value {
            font-size: 1.02rem;
          }
        }
      }

      .stat-cell {
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        padding: 0.75rem 0.95rem;
        display: flex;
        flex-direction: column;
        gap: 2px;

        .cell-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .cell-value {
          font-size: 1.15rem;
          font-weight: 800;
          font-family: var(--font-heading);

          &.gold-text { color: var(--text-gold); }
          &.silver-text { color: var(--text-silver); }
          &.ratio-text { color: #38BDF8; }
        }

        .cell-sub {
          font-size: 0.68rem;
          color: var(--text-muted);
        }
      }
    }

    /* Section Header */
    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
      margin-top: 0.5rem;

      &.silver-header {
        margin-top: 1.75rem;
      }

      .title-with-icon {
        display: flex;
        align-items: center;
        gap: 0.45rem;

        .section-icon {
          font-size: 22px;
          &.gold { color: var(--text-gold); }
          &.silver { color: var(--silver-300); }
        }

        h3 {
          font-size: 1.15rem;
          color: var(--text-primary);
        }
      }

      .view-all-link {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-gold);
        transition: transform 0.15s ease;

        span.material-symbols-outlined {
          font-size: 15px;
        }

        &:hover {
          transform: translateX(3px);
        }
      }
    }

    /* Gold Cards Grid */
    .gold-cards-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1080px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .purity-card {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .purity-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.65rem;

      .purity-tag {
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-gold);
        color: var(--text-gold);
        font-weight: 800;
        font-size: 0.95rem;
        padding: 4px 8px;
        border-radius: var(--radius-xs);

        &.purity-22k {
          background: rgba(229, 184, 66, 0.15);
        }

        &.silver-tag {
          border-color: var(--border-silver);
          color: var(--text-silver);
        }
      }

      .purity-name {
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.2;
      }

      .fineness-text {
        font-size: 0.7rem;
        color: var(--text-muted);
      }
    }

    .trend-indicator {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: var(--radius-xs);

      &.up {
        background: var(--color-success-bg);
        color: var(--color-live);
      }

      span.material-symbols-outlined {
        font-size: 14px;
      }
    }

    .price-hero-box {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.75rem 0.95rem;

      .price-label {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 600;
      }

      .main-price {
        font-size: 1.55rem;
        font-weight: 800;
        font-family: var(--font-heading);
        color: var(--text-gold);
        line-height: 1.15;
        margin-top: 2px;
      }
    }

    .price-sub-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem;

      .sub-item {
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xs);
        padding: 0.5rem 0.65rem;
        display: flex;
        flex-direction: column;

        .sub-label {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .sub-val {
          font-size: 0.85rem;
          font-weight: 700;
          font-family: var(--font-heading);
          color: var(--text-primary);
          margin-top: 1px;
        }
      }
    }

    .btn-card-calc {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      background: var(--bg-surface-elevated);
      color: var(--text-gold);
      border: 1px solid var(--border-gold);
      padding: 0.65rem;
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 0.82rem;
      transition: all 0.15s ease;
      cursor: pointer;

      span.material-symbols-outlined {
        font-size: 16px;
      }

      &:hover {
        background: var(--gold-accent);
        color: #0E121B;
      }

      &.silver-calc-btn {
        color: var(--text-silver);
        border-color: var(--border-silver);
        margin-top: 0.85rem;

        &:hover {
          background: #CBD5E1;
          color: #0F172A;
        }
      }
    }

    /* Silver Overview Card */
    .silver-overview-card {
      padding: 1.35rem;

      .silver-metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.65rem;
        margin-top: 0.85rem;

        @media (max-width: 767px) {
          .silver-metric-box.primary {
            grid-column: 1 / -1;
          }
        }

        @media (min-width: 768px) {
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
        }

        .silver-metric-box {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;

          .metric-label {
            font-size: 0.68rem;
            color: var(--text-muted);
            text-transform: uppercase;
            font-weight: 600;
          }

          .metric-value {
            font-size: 1.05rem;
            font-weight: 800;
            font-family: var(--font-heading);
            color: var(--text-silver);
            margin-top: 2px;
          }

          &.primary {
            border-color: var(--border-silver);
            .metric-value {
              font-size: 1.35rem;
              color: var(--text-primary);
            }
          }
        }
      }
    }

    /* Quick Tools */
    .quick-tools-section {
      margin-top: 0.75rem;

      .section-heading {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 0.85rem;
      }

      .tools-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;

        @media (min-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width: 1024px) {
          grid-template-columns: repeat(4, 1fr);
        }
      }

      .tool-tile {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        padding: 0.95rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transition: all 0.15s ease;
        text-decoration: none;

        .tool-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-xs);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          span {
            font-size: 20px;
          }

          &.gold-icon {
            background: rgba(229, 184, 66, 0.12);
            color: var(--text-gold);
          }
          &.silver-icon {
            background: rgba(148, 163, 184, 0.12);
            color: var(--silver-300);
          }
          &.chart-icon {
            background: rgba(56, 189, 248, 0.12);
            color: #38BDF8;
          }
          &.settings-icon {
            background: rgba(168, 85, 247, 0.12);
            color: #C084FC;
          }
        }

        .tool-info {
          flex: 1;

          h4 {
            font-size: 0.88rem;
            font-weight: 700;
            color: var(--text-primary);
          }
          p {
            font-size: 0.72rem;
            color: var(--text-muted);
            margin-top: 1px;
          }
        }

        .tool-arrow {
          color: var(--text-muted);
          font-size: 18px;
          transition: transform 0.15s ease;
        }

        &:hover {
          border-color: var(--border-strong);
          background: var(--bg-surface-elevated);

          .tool-arrow {
            color: var(--text-gold);
            transform: translateX(3px);
          }
        }
      }
    }
  `]
})
export class DashboardComponent {
  readonly marketService = inject(MarketRateService);
}
