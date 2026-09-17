import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculationResult } from '../../../core/models/calculator.model';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';
import { WeightFormatPipe } from '../../pipes/weight-format.pipe';
import { HistoryService } from '../../../core/services/history.service';

@Component({
  selector: 'app-invoice-card',
  standalone: true,
  imports: [CommonModule, InrCurrencyPipe, WeightFormatPipe],
  template: `
    @if (result(); as item) {
      <div class="invoice-card" [class.is-gold]="item.metal === 'gold'" [class.is-silver]="item.metal === 'silver'">
        <!-- Formal Memo Header -->
        <div class="memo-header">
          <div class="memo-badge-row">
            <span class="memo-badge">
              <span class="material-symbols-outlined">{{ item.metal === 'gold' ? 'toll' : 'monetization_on' }}</span>
              <span>PRICE ESTIMATION MEMO</span>
            </span>
            <span class="memo-hsn">HSN {{ getHsnCode(item) }}</span>
          </div>
          <h3 class="product-title">{{ item.productTitle }}</h3>
          <div class="memo-meta">
            <span class="meta-date">{{ item.formattedDate }}</span>
            <span class="dot">•</span>
            <span class="memo-ref">REF #{{ item.id.substring(item.id.length - 6).toUpperCase() }}</span>
          </div>
        </div>

        <!-- Memo Specification Rows -->
        <div class="memo-body">
          <div class="memo-row">
            <span class="row-label">Metal & Purity</span>
            <span class="row-val">
              {{ item.metal === 'gold' ? 'Gold (' + item.purity + ')' : 'Pure Silver (999)' }}
            </span>
          </div>

          <div class="memo-row">
            <span class="row-label">Net Weight</span>
            <span class="row-val weight-text">{{ item.weightGrams | weightFormat }}</span>
          </div>

          <div class="memo-row">
            <span class="row-label">Benchmark Rate</span>
            <span class="row-val">{{ item.ratePerGram | inrCurrency }} / g</span>
          </div>

          <div class="memo-row highlight-sub">
            <span class="row-label">Raw Metal Value</span>
            <span class="row-val">{{ item.metalValue | inrCurrency }}</span>
          </div>

          <div class="memo-row">
            <span class="row-label">
              Making / Labour Charges
              @if (item.labourType === 'percentage') {
                <span class="row-hint">({{ item.labourInput }}%)</span>
              } @else if (item.labourType === 'perGram') {
                <span class="row-hint">(₹{{ item.labourInput }}/g)</span>
              } @else {
                <span class="row-hint">(None)</span>
              }
            </span>
            <span class="row-val">{{ item.makingCharge | inrCurrency }}</span>
          </div>

          <div class="memo-row highlight-sub">
            <span class="row-label">Taxable Value</span>
            <span class="row-val">{{ item.taxableValue | inrCurrency }}</span>
          </div>

          <!-- GST Breakdown row -->
          <div class="memo-row gst-row">
            @if (item.gstPercentage === 0) {
              <span class="row-label">GST (0% / Exempt)</span>
              <span class="row-val zero-gst">₹0.00</span>
            } @else if (item.gstPercentage === 3.0) {
              <div class="gst-label-wrap">
                <span class="row-label">GST 3.0%</span>
                <span class="gst-split">CGST 1.5% + SGST 1.5%</span>
              </div>
              <span class="row-val">{{ item.gstAmount | inrCurrency }}</span>
            } @else {
              <span class="row-label">GST ({{ item.gstPercentage }}% Manual)</span>
              <span class="row-val">{{ item.gstAmount | inrCurrency }}</span>
            }
          </div>

          <!-- Total Net Payable -->
          <div class="total-payable-block">
            <div class="payable-label-col">
              <span class="payable-title">NET PAYABLE</span>
              <span class="payable-sub">
                {{ item.gstPercentage === 0 ? '(Without GST)' : '(Inclusive of GST & Making)' }}
              </span>
            </div>
            <div class="payable-amount">{{ item.finalPrice | inrCurrency }}</div>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="memo-actions">
          @if (showSaveBtn()) {
            <button class="btn-primary memo-save-btn" (click)="saveItem(item)" [disabled]="isSaved()">
              <span class="material-symbols-outlined">{{ isSaved() ? 'check_circle' : 'bookmark_add' }}</span>
              <span>{{ isSaved() ? 'Saved in History' : 'Save Calculation' }}</span>
            </button>
          }

          <div class="action-btn-row">
            <button class="btn-secondary share-btn" (click)="shareWhatsApp(item)" title="Share Estimate on WhatsApp">
              <span class="material-symbols-outlined">share</span>
              <span>WhatsApp</span>
            </button>

            <button class="btn-secondary copy-btn" (click)="copyText(item)" title="Copy Invoice Quotation">
              <span class="material-symbols-outlined">{{ copySuccess() ? 'done_all' : 'content_copy' }}</span>
              <span>{{ copySuccess() ? 'Copied' : 'Copy' }}</span>
            </button>

            @if (showDeleteBtn()) {
              <button class="btn-secondary delete-btn" (click)="onDelete.emit(item.id)" title="Delete Item">
                <span class="material-symbols-outlined">delete</span>
                <span>Delete</span>
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .invoice-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-gold);
      border-radius: var(--radius-md);
      padding: 1.35rem;
      box-shadow: var(--shadow-md);
      position: relative;
      transition: border-color 0.15s ease;

      &.is-silver {
        border-color: var(--border-silver);
      }
    }

    .memo-header {
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 1rem;

      .memo-badge-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.35rem;

        .memo-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--text-gold);
          text-transform: uppercase;
          letter-spacing: 0.06em;

          span.material-symbols-outlined {
            font-size: 16px;
          }
        }

        .memo-hsn {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-subtle);
        }
      }

      .product-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0.2rem 0;
      }

      .memo-meta {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.72rem;
        color: var(--text-muted);

        .memo-ref {
          font-family: monospace;
          font-weight: 600;
        }
      }
    }

    .memo-body {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .memo-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.45rem 0;
      font-size: 0.88rem;
      color: var(--text-secondary);

      .row-label {
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;

        .row-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      }

      .row-val {
        font-weight: 700;
        color: var(--text-primary);
        font-family: var(--font-heading);
      }

      .weight-text {
        color: var(--text-gold);
      }

      &.highlight-sub {
        border-top: 1px solid var(--border-subtle);
        margin-top: 0.25rem;
        padding-top: 0.55rem;
        color: var(--text-primary);
        font-weight: 600;
      }

      &.gst-row {
        .gst-label-wrap {
          display: flex;
          flex-direction: column;

          .gst-split {
            font-size: 0.68rem;
            color: var(--text-muted);
          }
        }

        .zero-gst {
          color: var(--color-success);
        }
      }
    }

    .total-payable-block {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-gold);
      border-radius: var(--radius-sm);
      padding: 0.9rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0.85rem 0 0.25rem;

      .payable-label-col {
        display: flex;
        flex-direction: column;

        .payable-title {
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: var(--text-gold);
          font-family: var(--font-heading);
        }

        .payable-sub {
          font-size: 0.68rem;
          color: var(--text-muted);
        }
      }

      .payable-amount {
        font-size: 1.45rem;
        font-weight: 800;
        font-family: var(--font-heading);
        color: var(--text-gold);
      }
    }

    .memo-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;

      .memo-save-btn {
        min-height: 42px;
      }

      .action-btn-row {
        display: flex;
        gap: 0.4rem;

        .btn-secondary {
          flex: 1;
          min-height: 38px;
          padding: 0.5rem 0.6rem;
          font-size: 0.8rem;

          span.material-symbols-outlined {
            font-size: 16px;
          }

          &.share-btn:hover {
            color: #25D366;
            border-color: rgba(37, 211, 102, 0.4);
          }

          &.delete-btn {
            color: var(--color-danger);
            &:hover {
              background: var(--color-danger-bg);
              border-color: var(--color-danger);
            }
          }
        }
      }
    }
  `]
})
export class InvoiceCardComponent {
  result = input<CalculationResult | null>(null);
  showSaveBtn = input<boolean>(true);
  showDeleteBtn = input<boolean>(false);
  onDelete = output<string>();

  private readonly historyService = inject(HistoryService);

  readonly isSaved = signal<boolean>(false);
  readonly copySuccess = signal<boolean>(false);

  getHsnCode(item: CalculationResult): string {
    if (item.metal === 'gold') {
      return item.productTitle.toLowerCase().includes('bar') || item.productTitle.toLowerCase().includes('coin')
        ? '7108'
        : '7113';
    } else {
      return item.productTitle.toLowerCase().includes('bar') || item.productTitle.toLowerCase().includes('coin')
        ? '7106'
        : '7113';
    }
  }

  saveItem(item: CalculationResult): void {
    this.historyService.addCalculation(item);
    this.isSaved.set(true);
  }

  shareWhatsApp(item: CalculationResult): void {
    this.historyService.shareViaWhatsApp(item);
  }

  async copyText(item: CalculationResult): Promise<void> {
    const success = await this.historyService.copyToClipboard(item);
    if (success) {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2200);
    }
  }
}
