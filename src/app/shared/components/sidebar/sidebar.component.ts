import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketRateService } from '../../../core/services/market-rate.service';
import { HistoryService } from '../../../core/services/history.service';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';
import { RateBadgeComponent } from '../rate-badge/rate-badge.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, InrCurrencyPipe, RateBadgeComponent],
  template: `
    <aside class="app-sidebar">
      <div class="sidebar-header">
        <div class="brand-badge">
          <span class="material-symbols-outlined gold-icon">diamond</span>
        </div>
        <div class="brand-info">
          <h2>Bharat Gold</h2>
          <span>Market & Calculator</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">MARKET OVERVIEW</div>
        
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined link-icon">dashboard</span>
          <span>Market Dashboard</span>
        </a>

        <a routerLink="/gold-rate" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined link-icon gold-accent">toll</span>
          <span>Gold Rate (24K / 22K / 18K)</span>
        </a>

        <a routerLink="/silver-rate" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined link-icon silver-accent">monetization_on</span>
          <span>Silver Rate (Kg / Gram)</span>
        </a>

        <div class="nav-section-title">TOOLS & CALCULATORS</div>

        <a routerLink="/calculator" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined link-icon">calculate</span>
          <span>Price & GST Calculator</span>
        </a>

        <a routerLink="/charts" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined link-icon">insights</span>
          <span>10-Year Historical Analysis</span>
        </a>

        <a routerLink="/history" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined link-icon">receipt_long</span>
          <span>Calculation Invoices</span>
          @if (historyService.historyList().length > 0) {
            <span class="nav-badge">{{ historyService.historyList().length }}</span>
          }
        </a>

        <div class="nav-section-title">CONFIGURATION</div>

        <a routerLink="/rate-settings" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined link-icon">price_change</span>
          <span>Rate & Labour Settings</span>
        </a>

        <a routerLink="/settings" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined link-icon">settings</span>
          <span>GST & App Settings</span>
        </a>
      </nav>

      <!-- Sidebar Mini Ticker Widget -->
      <div class="sidebar-footer-card">
        <div class="footer-card-header">
          <span class="live-pill">
            <app-rate-badge [isLive]="marketService.isLive()"></app-rate-badge>
          </span>
          <span class="unit">10g / 1Kg</span>
        </div>
        <div class="ticker-item">
          <span class="label">24K Gold (10g)</span>
          <span class="val">{{ (marketService.goldRates()['24K'] * 10) | inrCurrency }}</span>
        </div>
        <div class="ticker-item">
          <span class="label">22K Gold (10g)</span>
          <span class="val">{{ (marketService.goldRates()['22K'] * 10) | inrCurrency }}</span>
        </div>
        <div class="ticker-item">
          <span class="label">Silver (1 Kg)</span>
          <span class="val">{{ marketService.silverRatePerKg() | inrCurrency }}</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      position: sticky;
      top: 0;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      padding: 1.25rem 1rem;
      overflow-y: auto;

      @media (max-width: 767px) {
        display: none;
      }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-bottom: 1.25rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border-subtle);

      .brand-badge {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        background: var(--gold-gradient);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #1A1200;
        box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);

        .gold-icon {
          font-size: 26px;
        }
      }

      .brand-info {
        h2 {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
        }
        span {
          font-size: 0.75rem;
          color: var(--text-gold);
          font-weight: 600;
        }
      }
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;

      .nav-section-title {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        padding: 0.75rem 0.75rem 0.35rem;
        margin-top: 0.25rem;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.65rem 0.85rem;
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        font-weight: 600;
        font-size: 0.88rem;
        transition: all 0.2s ease;
        position: relative;

        .link-icon {
          font-size: 20px;
          color: var(--text-muted);
          transition: color 0.2s ease;
        }

        .gold-accent {
          color: var(--gold-500);
        }

        .silver-accent {
          color: var(--silver-400);
        }

        &:hover {
          background: var(--bg-surface-elevated);
          color: var(--text-primary);

          .link-icon {
            color: var(--text-gold);
          }
        }

        &.active {
          background: rgba(212, 175, 55, 0.12);
          color: var(--text-gold);
          font-weight: 700;

          .link-icon {
            color: var(--text-gold);
          }

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 20%;
            bottom: 20%;
            width: 4px;
            background: var(--gold-500);
            border-radius: 0 4px 4px 0;
          }
        }

        .nav-badge {
          margin-left: auto;
          background: var(--gold-500);
          color: #1A1200;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: var(--radius-full);
        }
      }
    }

    .sidebar-footer-card {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.85rem;
      margin-top: 1rem;

      .footer-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        .unit {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }
      }

      .ticker-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.25rem 0;
        font-size: 0.78rem;

        .label {
          color: var(--text-secondary);
        }
        .val {
          font-weight: 700;
          font-family: var(--font-heading);
          color: var(--text-primary);
        }
      }
    }
  `]
})
export class SidebarComponent {
  readonly marketService = inject(MarketRateService);
  readonly historyService = inject(HistoryService);
}
