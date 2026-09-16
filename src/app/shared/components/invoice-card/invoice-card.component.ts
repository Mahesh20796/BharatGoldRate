import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculationResult } from '../../../core/models/calculator.model';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';
import { WeightFormatPipe } from '../../pipes/weight-format.pipe';
import { HistoryService } from '../../../core/services/history.service';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-invoice-card',
  standalone: true,
  imports: [CommonModule, InrCurrencyPipe, WeightFormatPipe],
  template: `
    @if (result(); as item) {
      <div class="invoice-card" [class.is-gold]="item.metal === 'gold'" [class.is-silver]="item.metal === 'silver'">
        <!-- Receipt Top Jagged Design -->
        <div class="receipt-header">
          <div class="header-badge">
            <span class="material-symbols-outlined">{{ item.metal === 'gold' ? 'diamond' : 'monetization_on' }}</span>
            <span>PRICE SUMMARY INVOICE</span>
          </div>
          <h3 class="product-title">{{ item.productTitle }}</h3>
          <div class="receipt-meta">
            <span class="date">{{ item.formattedDate }}</span>
            <span class="dot">•</span>
            <span class="id-tag">#{{ item.id.substring(item.id.length - 6).toUpperCase() }}</span>
          </div>
        </div>

        <!-- Receipt Body Rows -->
        <div class="receipt-body">
          <div class="invoice-row">
            <span class="label">Metal & Purity</span>
            <span class="value">
              {{ item.metal === 'gold' ? 'Gold (' + item.purity + ')' : 'Pure Silver' }}
            </span>
          </div>

          <div class="invoice-row">
            <span class="label">Net Weight</span>
            <span class="value weight-val">{{ item.weightGrams | weightFormat }}</span>
          </div>

          <div class="invoice-row">
            <span class="label">Base Rate / Gram</span>
            <span class="value">{{ item.ratePerGram | inrCurrency }}</span>
          </div>

          <div class="invoice-row highlight">
            <span class="label">Metal Value</span>
            <span class="value">{{ item.metalValue | inrCurrency }}</span>
          </div>

          <div class="invoice-row">
            <span class="label">
              Making / Labour
              @if (item.labourType === 'percentage') {
                <small>({{ item.labourInput }}%)</small>
              } @else if (item.labourType === 'perGram') {
                <small>(₹{{ item.labourInput }}/g)</small>
              }
            </span>
            <span class="value">{{ item.makingCharge | inrCurrency }}</span>
          </div>

          <div class="invoice-row highlight">
            <span class="label">Taxable Value</span>
            <span class="value">{{ item.taxableValue | inrCurrency }}</span>
          </div>

          <div class="invoice-row">
            <span class="label">GST ({{ item.gstPercentage }}%)</span>
            <span class="value">{{ item.gstAmount | inrCurrency }}</span>
          </div>

          <!-- Total Final Price -->
          <div class="invoice-row total-row">
            <div class="total-label-wrap">
              <span class="label">FINAL PRICE</span>
              <span class="inclusive-text">(Incl. Making & GST)</span>
            </div>
            <span class="value total-val">{{ item.finalPrice | inrCurrency }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="receipt-actions">
          @if (showSaveBtn()) {
            <button class="btn-action btn-save" (click)="saveItem(item)" [disabled]="isSaved()">
              <span class="material-symbols-outlined">{{ isSaved() ? 'check_circle' : 'bookmark_add' }}</span>
              <span>{{ isSaved() ? 'Saved to History' : 'Save Calculation' }}</span>
            </button>
          }

          <div class="action-grid">
            <button class="btn-action btn-whatsapp" (click)="shareWhatsApp(item)" title="Share on WhatsApp">
              <span class="material-symbols-outlined">share</span>
              <span>WhatsApp</span>
            </button>

            <button class="btn-action btn-copy" (click)="copyText(item)" title="Copy Invoice to Clipboard">
              <span class="material-symbols-outlined">{{ copySuccess() ? 'done_all' : 'content_copy' }}</span>
              <span>{{ copySuccess() ? 'Copied!' : 'Copy' }}</span>
            </button>

            @if (showDeleteBtn()) {
              <button class="btn-action btn-delete" (click)="onDelete.emit(item.id)" title="Delete from History">
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
      background: var(--bg-surface-elevated);
      border: 2px dashed var(--border-highlight);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;

      &.is-silver {
        border-color: rgba(148, 163, 184, 0.4);
      }
    }

    .receipt-header {
      text-align: center;
      padding-bottom: 1rem;
      border-bottom: 1px dashed var(--border-subtle);
      margin-bottom: 1.25rem;

      .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: rgba(212, 175, 55, 0.12);
        color: var(--text-gold);
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        margin-bottom: 0.5rem;

        span {
          font-size: 16px;
        }
      }

      .product-title {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0.25rem 0;
      }

      .receipt-meta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .receipt-body {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .invoice-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.4rem 0;
      font-size: 0.92rem;
      color: var(--text-secondary);

      .label {
        font-weight: 500;
        small {
          color: var(--text-muted);
          margin-left: 4px;
        }
      }

      .value {
        font-weight: 700;
        font-family: var(--font-heading);
        color: var(--text-primary);
        font-size: 1rem;
      }

      &.highlight {
        border-top: 1px solid var(--border-subtle);
        margin-top: 0.35rem;
        padding-top: 0.65rem;
        color: var(--text-primary);
        font-weight: 600;
      }

      &.total-row {
        background: rgba(212, 175, 55, 0.08);
        border: 2px solid var(--border-highlight);
        border-radius: var(--radius-md);
        padding: 1rem;
        margin: 1rem 0;

        .total-label-wrap {
          display: flex;
          flex-direction: column;

          .label {
            font-size: 1.1rem;
            font-weight: 800;
            color: var(--text-gold);
            letter-spacing: 0.04em;
          }

          .inclusive-text {
            font-size: 0.7rem;
            color: var(--text-muted);
          }
        }

        .total-val {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--text-gold);
        }
      }
    }

    .receipt-actions {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      margin-top: 1.25rem;

      .btn-save {
        background: var(--gold-gradient);
        color: #1A1200;
        font-weight: 700;
        width: 100%;
        padding: 0.85rem;
        border-radius: var(--radius-md);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);
        font-family: var(--font-heading);
        font-size: 1rem;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
        }

        &:disabled {
          background: rgba(34, 197, 94, 0.2);
          color: var(--color-live);
          border: 1px solid rgba(34, 197, 94, 0.4);
          box-shadow: none;
          cursor: default;
        }
      }

      .action-grid {
        display: flex;
        gap: 0.5rem;

        .btn-action {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.7rem 0.5rem;
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;

          span.material-symbols-outlined {
            font-size: 18px;
          }

          &:hover {
            background: var(--input-bg);
            border-color: var(--border-highlight);
            color: var(--text-gold);
          }

          &.btn-whatsapp:hover {
            border-color: #25D366;
            color: #25D366;
          }

          &.btn-delete {
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

  saveItem(item: CalculationResult): void {
    this.historyService.addCalculation(item);
    this.isSaved.set(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#F3C343', '#D4AF37', '#B8860B', '#F8FAFC']
      });
    } catch {
      // Non-critical visual effect
    }
  }

  shareWhatsApp(item: CalculationResult): void {
    this.historyService.shareViaWhatsApp(item);
  }

  async copyText(item: CalculationResult): Promise<void> {
    const success = await this.historyService.copyToClipboard(item);
    if (success) {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2500);
    }
  }
}
