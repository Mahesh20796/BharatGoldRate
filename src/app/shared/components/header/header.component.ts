import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketRateService } from '../../../core/services/market-rate.service';
import { ThemeService } from '../../../core/services/theme.service';
import { HistoryService } from '../../../core/services/history.service';
import { RateBadgeComponent } from '../rate-badge/rate-badge.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RateBadgeComponent],
  template: `
    <header class="app-header">
      <div class="header-container">
        <!-- Brand & Title -->
        <div class="brand-section">
          <div class="logo-mark">
            <img src="favicon.svg" alt="Bharat Bullion" class="logo-coin-img" />
          </div>
          <div class="brand-text">
            <h1 class="brand-title">Bharat Bullion</h1>
            <div class="brand-meta">
              <span class="market-tag">MCX & IBJA Benchmark</span>
              <span class="dot-separator">•</span>
              <span class="current-time num-tabular">{{ formattedDateTime() }}</span>
            </div>
          </div>
        </div>

        <!-- Right Action Controls -->
        <div class="header-actions">
          <!-- Live / Manual Badge Toggle -->
          <div class="rate-status-wrapper" (click)="toggleRateSource()" title="Click to toggle Manual / Live rate simulation">
            <app-rate-badge [isLive]="marketService.isLive()"></app-rate-badge>
            <span class="updated-time num-tabular">Sync: {{ marketService.lastUpdated() }}</span>
          </div>

          <!-- History Action Button -->
          <a routerLink="/history" class="icon-btn" title="Calculation History">
            <span class="material-symbols-outlined">receipt_long</span>
            @if (historyService.historyList().length > 0) {
              <span class="history-count-badge">{{ historyService.historyList().length }}</span>
            }
          </a>

          <!-- GitHub Repository Link -->
          <a href="https://github.com/Mahesh20796/BharatGoldRate" target="_blank" rel="noopener noreferrer" class="icon-btn" title="View Source on GitHub">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>

          <!-- Theme Toggle -->
          <button class="icon-btn theme-toggle" (click)="themeService.toggleTheme()" [title]="'Switch to ' + (themeService.currentTheme() === 'dark' ? 'Light' : 'Dark') + ' Mode'">
            @if (themeService.currentTheme() === 'dark') {
              <span class="material-symbols-outlined">light_mode</span>
            } @else {
              <span class="material-symbols-outlined">dark_mode</span>
            }
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg-surface-glass);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0.65rem 1rem;
      transition: background-color 0.2s ease;
    }

    .header-container {
      max-width: 1180px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .logo-mark {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .logo-coin-img {
        width: 34px;
        height: 34px;
        object-fit: contain;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
      }
    }

    .brand-title {
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.15;
    }

    .brand-meta {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      color: var(--text-secondary);
      margin-top: 1px;
      flex-wrap: wrap;

      .market-tag {
        font-weight: 600;
        color: var(--text-gold);
      }

      .dot-separator {
        color: var(--text-muted);
      }

      .current-time {
        color: var(--text-secondary);
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .rate-status-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      cursor: pointer;
      padding: 3px 6px;
      border-radius: var(--radius-xs);
      transition: background 0.15s ease;

      &:hover {
        background: var(--bg-surface-elevated);
      }

      .updated-time {
        font-size: 0.68rem;
        color: var(--text-muted);
        font-weight: 500;
      }
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-xs);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.15s ease;

      &:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }

      .history-count-badge {
        position: absolute;
        top: -3px;
        right: -3px;
        background: var(--gold-accent);
        color: #0E121B;
        font-size: 0.62rem;
        font-weight: 800;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--bg-surface);
      }
    }

    @media (max-width: 768px) {
      .rate-status-wrapper {
        display: none;
      }
      .brand-meta .dot-separator,
      .brand-meta .current-time {
        display: none;
      }
      .brand-title {
        font-size: 0.95rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly marketService = inject(MarketRateService);
  readonly themeService = inject(ThemeService);
  readonly historyService = inject(HistoryService);

  readonly formattedDateTime = signal<string>('');
  private timerId: any;

  ngOnInit(): void {
    this.updateDateTime();
    this.timerId = setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  toggleRateSource(): void {
    this.marketService.setLiveMode(!this.marketService.isLive());
  }

  private updateDateTime(): void {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    this.formattedDateTime.set(formatted);
  }
}
