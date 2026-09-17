import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bottom-nav">
      <div class="nav-container">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="material-symbols-outlined nav-icon">dashboard</span>
          <span class="nav-label">Home</span>
        </a>

        <a routerLink="/gold-rate" routerLinkActive="active" class="nav-item">
          <span class="material-symbols-outlined nav-icon">toll</span>
          <span class="nav-label">Rates</span>
        </a>

        <a routerLink="/calculator" routerLinkActive="active" class="nav-item nav-item-special">
          <div class="calculator-fab">
            <span class="material-symbols-outlined">calculate</span>
          </div>
          <span class="nav-label">Calculate</span>
        </a>

        <a routerLink="/charts" routerLinkActive="active" class="nav-item">
          <span class="material-symbols-outlined nav-icon">show_chart</span>
          <span class="nav-label">10Y Chart</span>
        </a>

        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <span class="material-symbols-outlined nav-icon">settings</span>
          <span class="nav-label">Settings</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: var(--bg-surface-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid var(--border-subtle);
      padding: 0.35rem 0.5rem calc(0.35rem + env(safe-area-inset-bottom, 0px));
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);

      @media (min-width: 768px) {
        display: none;
      }
    }

    .nav-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
      max-width: 500px;
      margin: 0 auto;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.35rem 0.6rem;
      border-radius: var(--radius-md);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      flex: 1;

      .nav-icon {
        font-size: 22px;
        transition: transform 0.2s ease, color 0.2s ease;
      }

      &.active {
        color: var(--text-gold);

        .nav-icon {
          transform: translateY(-2px);
          color: var(--text-gold);
        }

        &::after {
          content: '';
          position: absolute;
          bottom: 0px;
          width: 16px;
          height: 3px;
          background: var(--gold-500);
          border-radius: var(--radius-full);
        }
      }
    }

    .nav-item-special {
      .calculator-fab {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: var(--gold-accent);
        color: #0E121B;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-md);
        margin-top: -14px;
        transition: transform 0.15s ease;

        span {
          font-size: 22px;
        }
      }

      &:hover .calculator-fab,
      &.active .calculator-fab {
        transform: translateY(-2px);
      }
    }
  `]
})
export class BottomNavComponent {}
