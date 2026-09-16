import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HistoryService } from '../../core/services/history.service';
import { CalculationResult } from '../../core/models/calculator.model';
import { InvoiceCardComponent } from '../../shared/components/invoice-card/invoice-card.component';

@Component({
  selector: 'app-calculation-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InvoiceCardComponent
  ],
  template: `
    <div class="page-container history-page">
      <!-- Page Header -->
      <div class="page-header-row">
        <div>
          <h2 class="page-title">Calculation History & Invoices</h2>
          <p class="page-subtitle">Saved jewellery & bullion estimates stored locally in LocalStorage</p>
        </div>
        @if (historyService.historyList().length > 0) {
          <button class="btn-clear-all" (click)="confirmClearAll()">
            <span class="material-symbols-outlined">delete_sweep</span>
            <span>Clear All History</span>
          </button>
        }
      </div>

      <!-- Filters & Search Bar -->
      <div class="app-card filter-card">
        <div class="filter-controls-grid">
          <!-- Search input -->
          <div class="search-wrap">
            <span class="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              class="form-control search-input"
              [(ngModel)]="searchQuery"
              placeholder="Search by product, purity, date..."
            />
            @if (searchQuery()) {
              <button class="btn-clear-search" (click)="searchQuery.set('')">
                <span class="material-symbols-outlined">close</span>
              </button>
            }
          </div>

          <!-- Metal Filter Pills -->
          <div class="pill-selector">
            <button class="pill-btn" [class.active]="metalFilter() === 'all'" (click)="metalFilter.set('all')">
              All ({{ historyService.historyList().length }})
            </button>
            <button class="pill-btn" [class.active]="metalFilter() === 'gold'" (click)="metalFilter.set('gold')">
              Gold ({{ countGold() }})
            </button>
            <button class="pill-btn" [class.active-silver]="metalFilter() === 'silver'" (click)="metalFilter.set('silver')">
              Silver ({{ countSilver() }})
            </button>
          </div>
        </div>
      </div>

      <!-- History List / Grid -->
      @if (filteredList().length > 0) {
        <div class="history-grid">
          @for (item of filteredList(); track item.id) {
            <app-invoice-card
              [result]="item"
              [showSaveBtn]="false"
              [showDeleteBtn]="true"
              (onDelete)="deleteItem($event)"
            ></app-invoice-card>
          }
        </div>
      } @else {
        <!-- Empty State -->
        <div class="app-card empty-state-card">
          <div class="empty-content">
            <div class="empty-icon-wrap">
              <span class="material-symbols-outlined">receipt_long</span>
            </div>
            <h3>No Calculations Found</h3>
            <p>
              @if (historyService.historyList().length > 0) {
                No results match your search query "{{ searchQuery() }}".
              } @else {
                You haven't saved any calculations yet. Use the Gold or Silver Calculator to estimate prices and click <strong>Save Calculation</strong>.
              }
            </p>
            <div class="empty-actions">
              <a routerLink="/calculator" class="btn-primary">
                <span class="material-symbols-outlined">calculate</span>
                <span>Open Price Calculator</span>
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .history-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;

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

      .btn-clear-all {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--color-danger-bg);
        border: 1px solid var(--color-danger);
        color: var(--color-danger);
        padding: 6px 12px;
        border-radius: var(--radius-md);
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;

        span.material-symbols-outlined {
          font-size: 18px;
        }

        &:hover {
          background: var(--color-danger);
          color: #FFFFFF;
        }
      }
    }

    .filter-card {
      padding: 1rem;
    }

    .filter-controls-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.85rem;

      @media (min-width: 640px) {
        grid-template-columns: 1.5fr 1fr;
      }
    }

    .search-wrap {
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 1rem;
        color: var(--text-muted);
        font-size: 20px;
        pointer-events: none;
      }

      .search-input {
        padding-left: 2.5rem;
        padding-right: 2.5rem;
      }

      .btn-clear-search {
        position: absolute;
        right: 0.75rem;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;

        span {
          font-size: 18px;
        }

        &:hover {
          color: var(--text-primary);
        }
      }
    }

    .history-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (min-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .empty-state-card {
      padding: 3rem 1.5rem;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;

      .empty-content {
        max-width: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;

        .empty-icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.1);
          border: 1px dashed var(--border-highlight);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-gold);

          span {
            font-size: 36px;
          }
        }

        h3 {
          font-size: 1.3rem;
          color: var(--text-primary);
        }

        p {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .empty-actions {
          margin-top: 0.5rem;
        }
      }
    }
  `]
})
export class CalculationHistoryComponent {
  readonly historyService = inject(HistoryService);

  readonly searchQuery = signal<string>('');
  readonly metalFilter = signal<'all' | 'gold' | 'silver'>('all');

  readonly countGold = computed<number>(() =>
    this.historyService.historyList().filter(x => x.metal === 'gold').length
  );

  readonly countSilver = computed<number>(() =>
    this.historyService.historyList().filter(x => x.metal === 'silver').length
  );

  readonly filteredList = computed<CalculationResult[]>(() => {
    let list = this.historyService.historyList();

    const metal = this.metalFilter();
    if (metal !== 'all') {
      list = list.filter(item => item.metal === metal);
    }

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(item =>
        item.productTitle.toLowerCase().includes(q) ||
        (item.purity && item.purity.toLowerCase().includes(q)) ||
        item.formattedDate.toLowerCase().includes(q) ||
        item.finalPrice.toString().includes(q)
      );
    }

    return list;
  });

  deleteItem(id: string): void {
    this.historyService.deleteCalculation(id);
  }

  confirmClearAll(): void {
    if (confirm('Are you sure you want to clear all saved calculation history?')) {
      this.historyService.clearHistory();
    }
  }
}
