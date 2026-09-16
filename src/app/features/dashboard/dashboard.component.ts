import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketRateService } from '../../core/services/market-rate.service';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { RateBadgeComponent } from '../../shared/components/rate-badge/rate-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    InrCurrencyPipe,
    RateBadgeComponent
  ],
  template: `
    <div class="page-container dashboard-page">
      <!-- Market Hero Banner -->
      <section class="hero-banner">
        <div class="hero-content">
          <div class="hero-tag-row">
            <span class="location-tag">
              <span class="material-symbols-outlined location-icon">location_on</span>
              INDIA BULLION MARKET
            </span>
            <app-rate-badge [isLive]="marketService.isLive()"></app-rate-badge>
          </div>
          <h2 class="hero-title">Today's Gold & Silver Rates</h2>
          <p class="hero-subtitle">
            Benchmark precious metal rates in Indian Rupees (INR) with real-time conversion and tax calculation.
          </p>
        </div>

        <div class="quick-stats-pills">
          <div class="stat-pill">
            <span class="stat-label">24K Gold / 10g</span>
            <span class="stat-value gold-text">
              {{ (marketService.goldRates()['24K'] * 10) | inrCurrency }}
            </span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">22K Hallmark / 10g</span>
            <span class="stat-value gold-text">
              {{ (marketService.goldRates()['22K'] * 10) | inrCurrency }}
            </span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">Pure Silver / 1 Kg</span>
            <span class="stat-value silver-text">
              {{ marketService.silverRatePerKg() | inrCurrency }}
            </span>
          </div>
        </div>
      </section>

      <!-- Main Rates Section: Gold & Silver Cards Grid -->
      <section class="rates-grid-section">
        <!-- Section Header -->
        <div class="section-title-row">
          <div class="title-with-icon">
            <span class="material-symbols-outlined section-icon gold">workspace_premium</span>
            <h3>Gold Rates (Purity Wise)</h3>
          </div>
          <a routerLink="/gold-rate" class="view-all-link">
            <span>Rate Table</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>

        <!-- 3 Gold Purity Cards (24K, 22K, 18K) -->
        <div class="gold-cards-grid">
          @for (item of marketService.goldPurityList(); track item.purity) {
            <div class="app-card gold-card purity-card" [class.primary-purity]="item.purity === '22K'">
              @if (item.purity === '22K') {
                <div class="card-corner-badge">MOST POPULAR JEWELLERY</div>
              }
              <div class="card-header-row">
                <div class="purity-badge-wrap">
                  <span class="purity-chip">{{ item.purity }}</span>
                  <div>
                    <h4 class="purity-name">{{ item.name }}</h4>
                    <span class="fineness-text">{{ item.fineness }}</span>
                  </div>
                </div>
                <div class="trend-badge up">
                  <span class="material-symbols-outlined">trending_up</span>
                  <span>+{{ item.changePercent }}%</span>
                </div>
              </div>

              <!-- Price per Gram Large -->
              <div class="price-highlight-block">
                <span class="price-label">Price per 1 Gram</span>
                <div class="main-price">{{ item.perGram | inrCurrency }}</div>
              </div>

              <!-- Breakdown row: 10 Gram & 1 Kg -->
              <div class="price-sub-grid">
                <div class="sub-item">
                  <span class="sub-label">Per 10 Gram (1 Tola)</span>
                  <span class="sub-val">{{ item.per10g | inrCurrency }}</span>
                </div>
                <div class="sub-item">
                  <span class="sub-label">Per 1 Kilogram</span>
                  <span class="sub-val">{{ item.perKg | inrCurrency }}</span>
                </div>
              </div>

              <!-- Card Action Button -->
              <a [routerLink]="['/calculator']" [queryParams]="{ metal: 'gold', purity: item.purity }" class="btn-card-calc">
                <span class="material-symbols-outlined">calculate</span>
                <span>Calculate {{ item.purity }} Price</span>
              </a>
            </div>
          }
        </div>

        <!-- Silver Rates Card -->
        <div class="section-title-row silver-header">
          <div class="title-with-icon">
            <span class="material-symbols-outlined section-icon silver">monetization_on</span>
            <h3>Silver Market Rates</h3>
          </div>
          <a routerLink="/silver-rate" class="view-all-link">
            <span>Rate Table</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>

        <div class="app-card silver-card silver-overview-card">
          <div class="card-header-row">
            <div class="purity-badge-wrap">
              <span class="purity-chip silver-chip">999</span>
              <div>
                <h4 class="purity-name">Fine Silver 99.9% Pure</h4>
                <span class="fineness-text">Indian Bullion & Jewellers Association Standard</span>
              </div>
            </div>
            <div class="trend-badge up">
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
              <span class="metric-label">Per 1 Gram</span>
              <div class="metric-value">{{ marketService.silverBreakdown().perGram | inrCurrency }}</div>
            </div>
            <div class="silver-metric-box">
              <span class="metric-label">Per 10 Gram</span>
              <div class="metric-value">{{ marketService.silverBreakdown().per10g | inrCurrency }}</div>
            </div>
            <div class="silver-metric-box">
              <span class="metric-label">Per 100 Gram</span>
              <div class="metric-value">{{ marketService.silverBreakdown().per100g | inrCurrency }}</div>
            </div>
          </div>

          <a routerLink="/calculator" [queryParams]="{ metal: 'silver' }" class="btn-card-calc silver-calc-btn">
            <span class="material-symbols-outlined">calculate</span>
            <span>Calculate Silver Jewellery & Bullion Price</span>
          </a>
        </div>
      </section>

      <!-- Quick Action Shortcuts -->
      <section class="quick-actions-section">
        <h3 class="section-heading">Quick Actions & Tools</h3>
        <div class="action-tiles-grid">
          <a routerLink="/calculator" class="action-tile">
            <div class="tile-icon-wrap gold-tile">
              <span class="material-symbols-outlined">calculate</span>
            </div>
            <div class="tile-text">
              <h4>Gold Calculator</h4>
              <p>Making charges & GST breakdown</p>
            </div>
            <span class="material-symbols-outlined arrow">chevron_right</span>
          </a>

          <a routerLink="/calculator" [queryParams]="{ metal: 'silver' }" class="action-tile">
            <div class="tile-icon-wrap silver-tile">
              <span class="material-symbols-outlined">shopping_bag</span>
            </div>
            <div class="tile-text">
              <h4>Silver Calculator</h4>
              <p>Payal, Utensil & Coin estimate</p>
            </div>
            <span class="material-symbols-outlined arrow">chevron_right</span>
          </a>

          <a routerLink="/charts" class="action-tile">
            <div class="tile-icon-wrap chart-tile">
              <span class="material-symbols-outlined">analytics</span>
            </div>
            <div class="tile-text">
              <h4>10-Year Analysis</h4>
              <p>2017 to 2026 historical trends</p>
            </div>
            <span class="material-symbols-outlined arrow">chevron_right</span>
          </a>

          <a routerLink="/rate-settings" class="action-tile">
            <div class="tile-icon-wrap settings-tile">
              <span class="material-symbols-outlined">price_change</span>
            </div>
            <div class="tile-text">
              <h4>Update Rates</h4>
              <p>Manual rate & GST customization</p>
            </div>
            <span class="material-symbols-outlined arrow">chevron_right</span>
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

    /* Hero Banner */
    .hero-banner {
      background: var(--card-gradient-gold);
      border: 1px solid var(--border-highlight);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      box-shadow: var(--gold-glow);
      position: relative;
      overflow: hidden;

      .hero-tag-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.75rem;

        .location-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--text-gold);
          text-transform: uppercase;

          .location-icon {
            font-size: 16px;
          }
        }
      }

      .hero-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 0.4rem;
        line-height: 1.2;

        @media (min-width: 768px) {
          font-size: 2.1rem;
        }
      }

      .hero-subtitle {
        font-size: 0.88rem;
        color: var(--text-secondary);
        max-width: 650px;
        line-height: 1.45;
        margin-bottom: 1.25rem;
      }
    }

    .quick-stats-pills {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;

      .stat-pill {
        background: var(--bg-surface-glass);
        backdrop-filter: blur(10px);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.75rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 2px;

        .stat-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 1.15rem;
          font-weight: 800;
          font-family: var(--font-heading);

          &.gold-text {
            color: var(--text-gold);
          }
          &.silver-text {
            color: var(--silver-300);
          }
        }
      }
    }

    /* Section Titles */
    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      margin-top: 0.5rem;

      &.silver-header {
        margin-top: 1.75rem;
      }

      .title-with-icon {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .section-icon {
          font-size: 24px;
          &.gold { color: var(--gold-400); }
          &.silver { color: var(--silver-300); }
        }

        h3 {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
        }
      }

      .view-all-link {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-gold);
        transition: transform 0.2s ease;

        span.material-symbols-outlined {
          font-size: 16px;
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

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .purity-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: relative;

      &.primary-purity {
        border-color: var(--gold-400);
        box-shadow: 0 8px 32px rgba(212, 175, 55, 0.35);
      }

      .card-corner-badge {
        position: absolute;
        top: 0;
        right: 0;
        background: var(--gold-gradient);
        color: #1A1200;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        padding: 4px 10px;
        border-bottom-left-radius: var(--radius-md);
      }
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .purity-badge-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .purity-chip {
        background: var(--gold-gradient);
        color: #1A1200;
        font-weight: 900;
        font-size: 1rem;
        padding: 6px 10px;
        border-radius: var(--radius-sm);
        box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);

        &.silver-chip {
          background: var(--silver-gradient);
          color: #0F172A;
          box-shadow: 0 2px 8px rgba(148, 163, 184, 0.4);
        }
      }

      .purity-name {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.2;
      }

      .fineness-text {
        font-size: 0.72rem;
        color: var(--text-muted);
      }
    }

    .trend-badge {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-full);

      &.up {
        background: var(--color-success-bg);
        color: var(--color-success);
      }

      span.material-symbols-outlined {
        font-size: 14px;
      }
    }

    .price-highlight-block {
      background: var(--input-bg);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;

      .price-label {
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 600;
      }

      .main-price {
        font-size: 1.65rem;
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
      gap: 0.5rem;

      .sub-item {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        padding: 0.6rem;
        display: flex;
        flex-direction: column;

        .sub-label {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .sub-val {
          font-size: 0.88rem;
          font-weight: 700;
          font-family: var(--font-heading);
          color: var(--text-primary);
          margin-top: 2px;
        }
      }
    }

    .btn-card-calc {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      background: var(--bg-surface-elevated);
      color: var(--text-gold);
      border: 1px solid var(--border-highlight);
      padding: 0.75rem;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 0.85rem;
      transition: all 0.2s ease;
      cursor: pointer;

      span.material-symbols-outlined {
        font-size: 18px;
      }

      &:hover {
        background: var(--gold-gradient);
        color: #1A1200;
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);
      }

      &.silver-calc-btn {
        color: var(--text-silver);
        border-color: rgba(148, 163, 184, 0.3);
        margin-top: 1rem;

        &:hover {
          background: var(--silver-gradient);
          color: #0F172A;
          box-shadow: 0 4px 14px rgba(148, 163, 184, 0.3);
        }
      }
    }

    /* Silver Overview Card */
    .silver-overview-card {
      padding: 1.5rem;

      .silver-metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-top: 1rem;

        @media (min-width: 640px) {
          grid-template-columns: 2fr 1fr 1fr 1fr;
        }

        .silver-metric-box {
          background: var(--input-bg);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;

          .metric-label {
            font-size: 0.72rem;
            color: var(--text-muted);
            text-transform: uppercase;
            font-weight: 600;
          }

          .metric-value {
            font-size: 1.15rem;
            font-weight: 800;
            font-family: var(--font-heading);
            color: var(--text-silver);
            margin-top: 2px;
          }

          &.primary {
            border-color: rgba(148, 163, 184, 0.4);
            background: linear-gradient(145deg, rgba(148, 163, 184, 0.15), rgba(17, 22, 34, 0.6));

            .metric-value {
              font-size: 1.45rem;
              color: var(--text-primary);
            }
          }
        }
      }
    }

    /* Quick Action Tiles */
    .quick-actions-section {
      margin-top: 1rem;

      .section-heading {
        font-size: 1.2rem;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .action-tiles-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.85rem;

        @media (min-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width: 1024px) {
          grid-template-columns: repeat(4, 1fr);
        }
      }

      .action-tile {
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.85rem;
        transition: all 0.2s ease;
        text-decoration: none;

        .tile-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          span {
            font-size: 24px;
          }

          &.gold-tile {
            background: rgba(212, 175, 55, 0.15);
            color: var(--gold-400);
          }
          &.silver-tile {
            background: rgba(148, 163, 184, 0.15);
            color: var(--silver-300);
          }
          &.chart-tile {
            background: rgba(59, 130, 246, 0.15);
            color: #60A5FA;
          }
          &.settings-tile {
            background: rgba(168, 85, 247, 0.15);
            color: #C084FC;
          }
        }

        .tile-text {
          flex: 1;

          h4 {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-primary);
          }
          p {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 1px;
          }
        }

        .arrow {
          color: var(--text-muted);
          font-size: 20px;
          transition: transform 0.2s ease;
        }

        &:hover {
          background: var(--input-bg);
          border-color: var(--border-highlight);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);

          .arrow {
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
