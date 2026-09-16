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
          <div class="logo-icon">
            <span class="material-symbols-outlined gold-icon">diamond</span>
          </div>
          <div class="brand-text">
            <h1 class="brand-title">Gold & Silver Market</h1>
            <div class="brand-meta">
              <span class="market-tag">Indian Market</span>
              <span class="dot-separator">•</span>
              <span class="current-time">{{ formattedDateTime() }}</span>
            </div>
          </div>
        </div>

        <!-- Right Action Controls -->
        <div class="header-actions">
          <!-- Live / Manual Badge Toggle -->
          <div class="rate-status-wrapper" (click)="toggleRateSource()" title="Click to toggle Manual / Live rate simulation">
            <app-rate-badge [isLive]="marketService.isLive()"></app-rate-badge>
            <span class="updated-time">Updated: {{ marketService.lastUpdated() }}</span>
          </div>

          <!-- History Action Button -->
          <a routerLink="/history" class="icon-btn" title="Calculation History">
            <span class="material-symbols-outlined">receipt_long</span>
            @if (historyService.historyList().length > 0) {
              <span class="history-count-badge">{{ historyService.historyList().length }}</span>
            }
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
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0.75rem 1rem;
      transition: background-color 0.3s ease;
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      background: var(--card-gradient-gold);
      border: 1px solid var(--border-highlight);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);

      .gold-icon {
        color: var(--gold-400);
        font-size: 26px;
      }
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.2;
    }

    .brand-meta {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 2px;
      flex-wrap: wrap;

      .market-tag {
        font-weight: 700;
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
      gap: 0.6rem;
    }

    .rate-status-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: background 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .updated-time {
        font-size: 0.68rem;
        color: var(--text-muted);
        font-weight: 500;
      }
    }

    .icon-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;

      &:hover {
        background: var(--input-bg);
        border-color: var(--border-highlight);
        color: var(--text-gold);
        transform: translateY(-1px);
      }

      .history-count-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: var(--gold-500);
        color: #1A1200;
        font-size: 0.65rem;
        font-weight: 800;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--bg-surface);
      }
    }

    @media (max-width: 600px) {
      .rate-status-wrapper .updated-time {
        display: none;
      }
      .brand-title {
        font-size: 1rem;
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    this.formattedDateTime.set(formatted);
  }
}
