import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarketRateService } from '../../core/services/market-rate.service';
import { SettingsService } from '../../core/services/settings.service';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { RateBadgeComponent } from '../../shared/components/rate-badge/rate-badge.component';

@Component({
  selector: 'app-rate-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InrCurrencyPipe,
    RateBadgeComponent
  ],
  template: `
    <div class="page-container rate-settings-page">
      <!-- Page Header -->
      <div class="page-header-row">
        <div>
          <h2 class="page-title">Rate & Labour Management</h2>
          <p class="page-subtitle">Configure manual base market rates and default making charges saved in LocalStorage</p>
        </div>
        <app-rate-badge [isLive]="marketService.isLive()"></app-rate-badge>
      </div>

      <!-- Settings Form -->
      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()" class="settings-form-container">
        <!-- Gold Rates Section -->
        <div class="app-card gold-card section-card">
          <div class="section-card-header">
            <div class="header-left">
              <span class="material-symbols-outlined icon">diamond</span>
              <div>
                <h3>Gold Benchmark Rates</h3>
                <span class="sub">Rates entered per 10 Grams (1 Tola)</span>
              </div>
            </div>
            <button type="button" class="btn-auto-derive" (click)="autoDeriveFrom24k()" title="Derive 22K (91.6%) and 18K (75%) from 24K rate">
              <span class="material-symbols-outlined">auto_fix_high</span>
              <span>Auto-Derive from 24K</span>
            </button>
          </div>

          <div class="fields-grid">
            <div class="form-group">
              <label>
                <span>24K Pure Gold Rate (per 10g)</span>
                <span class="hint">1g = {{ (settingsForm.get('gold24kPer10g')?.value / 10) | inrCurrency }}</span>
              </label>
              <div class="input-with-symbol">
                <span class="symbol">₹</span>
                <input type="number" class="form-control" formControlName="gold24kPer10g" min="1" />
              </div>
            </div>

            <div class="form-group">
              <label>
                <span>22K Standard Gold Rate (per 10g)</span>
                <span class="hint">1g = {{ (settingsForm.get('gold22kPer10g')?.value / 10) | inrCurrency }}</span>
              </label>
              <div class="input-with-symbol">
                <span class="symbol">₹</span>
                <input type="number" class="form-control" formControlName="gold22kPer10g" min="1" />
              </div>
            </div>

            <div class="form-group">
              <label>
                <span>18K Diamond Gold Rate (per 10g)</span>
                <span class="hint">1g = {{ (settingsForm.get('gold18kPer10g')?.value / 10) | inrCurrency }}</span>
              </label>
              <div class="input-with-symbol">
                <span class="symbol">₹</span>
                <input type="number" class="form-control" formControlName="gold18kPer10g" min="1" />
              </div>
            </div>
          </div>
        </div>

        <!-- Silver Rates Section -->
        <div class="app-card silver-card section-card">
          <div class="section-card-header">
            <div class="header-left">
              <span class="material-symbols-outlined icon silver-icon">monetization_on</span>
              <div>
                <h3>Silver Benchmark Rates</h3>
                <span class="sub">Standard 999 Fine Silver</span>
              </div>
            </div>
          </div>

          <div class="fields-grid">
            <div class="form-group">
              <label>
                <span>Silver Rate (per 1 Kilogram)</span>
                <span class="hint">1g = {{ (settingsForm.get('silverRatePerKg')?.value / 1000) | inrCurrency }}</span>
              </label>
              <div class="input-with-symbol">
                <span class="symbol">₹</span>
                <input type="number" class="form-control" formControlName="silverRatePerKg" min="1" />
              </div>
            </div>

            <div class="form-group">
              <label>
                <span>Calculated Silver Rate per 100g</span>
              </label>
              <div class="read-only-box">
                {{ (settingsForm.get('silverRatePerKg')?.value / 10) | inrCurrency }}
              </div>
            </div>
          </div>
        </div>

        <!-- Labour / Making Charges Defaults -->
        <div class="app-card section-card">
          <div class="section-card-header">
            <div class="header-left">
              <span class="material-symbols-outlined icon">construction</span>
              <div>
                <h3>Default Labour & Making Charges</h3>
                <span class="sub">Pre-filled default making values for calculators</span>
              </div>
            </div>
          </div>

          <div class="fields-grid">
            <div class="form-group">
              <label>Gold Default Making Charge (%)</label>
              <div class="input-with-symbol">
                <span class="symbol">%</span>
                <input type="number" class="form-control" formControlName="goldLabourPercent" min="0" max="100" />
              </div>
            </div>

            <div class="form-group">
              <label>Gold Default Labour per Gram (₹/g)</label>
              <div class="input-with-symbol">
                <span class="symbol">₹</span>
                <input type="number" class="form-control" formControlName="goldLabourGram" min="0" />
              </div>
            </div>

            <div class="form-group">
              <label>Silver Default Making Charge (%)</label>
              <div class="input-with-symbol">
                <span class="symbol">%</span>
                <input type="number" class="form-control" formControlName="silverLabourPercent" min="0" max="100" />
              </div>
            </div>

            <div class="form-group">
              <label>Silver Default Labour per Gram (₹/g)</label>
              <div class="input-with-symbol">
                <span class="symbol">₹</span>
                <input type="number" class="form-control" formControlName="silverLabourGram" min="0" />
              </div>
            </div>
          </div>
        </div>

        <!-- Submit & Actions Bar -->
        <div class="form-submit-row">
          <button type="submit" class="btn-primary btn-save">
            <span class="material-symbols-outlined">save</span>
            <span>Save Rate & Labour Settings</span>
          </button>

          <button type="button" class="btn-secondary" (click)="resetToDefaults()">
            <span class="material-symbols-outlined">restart_alt</span>
            <span>Reset All Defaults</span>
          </button>
        </div>

        @if (saveSuccessMessage()) {
          <div class="save-toast">
            <span class="material-symbols-outlined">check_circle</span>
            <span>{{ saveSuccessMessage() }}</span>
          </div>
        }
      </form>
    </div>
  `,
  styles: [`
    .rate-settings-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;

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
    }

    .settings-form-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section-card {
      padding: 1.5rem;

      .section-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid var(--border-subtle);

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .icon {
            color: var(--text-gold);
            font-size: 26px;
            &.silver-icon { color: var(--silver-300); }
          }

          h3 {
            font-size: 1.15rem;
            color: var(--text-primary);
          }

          .sub {
            font-size: 0.72rem;
            color: var(--text-muted);
          }
        }

        .btn-auto-derive {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid var(--border-highlight);
          color: var(--text-gold);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;

          span.material-symbols-outlined {
            font-size: 16px;
          }

          &:hover {
            background: var(--gold-gradient);
            color: #1A1200;
          }
        }
      }
    }

    .fields-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;

      @media (min-width: 640px) {
        grid-template-columns: 1fr 1fr;
      }
      @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .input-with-symbol {
      position: relative;
      display: flex;
      align-items: center;

      .symbol {
        position: absolute;
        left: 1rem;
        font-weight: 700;
        color: var(--text-gold);
        font-size: 1.1rem;
      }

      input {
        padding-left: 2.2rem;
        font-weight: 700;
        font-size: 1.05rem;
        color: var(--text-primary);
        font-family: var(--font-heading);
      }
    }

    .read-only-box {
      background: var(--input-bg);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      font-weight: 700;
      font-family: var(--font-heading);
      color: var(--text-primary);
      font-size: 1.05rem;
    }

    .form-submit-row {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      @media (min-width: 640px) {
        flex-direction: row;
      }

      .btn-save {
        flex: 2;
      }
      .btn-secondary {
        flex: 1;
      }
    }

    .save-toast {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid var(--color-success);
      color: var(--color-success);
      border-radius: var(--radius-md);
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RateSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly marketService = inject(MarketRateService);
  readonly settingsService = inject(SettingsService);

  readonly saveSuccessMessage = signal<string | null>(null);

  settingsForm!: FormGroup;

  ngOnInit(): void {
    const gold = this.marketService.goldRates();
    const silver = this.marketService.silverRatePerKg();
    const labour = this.settingsService.labourSettings();

    this.settingsForm = this.fb.group({
      gold24kPer10g: [gold['24K'] * 10, [Validators.required, Validators.min(1)]],
      gold22kPer10g: [gold['22K'] * 10, [Validators.required, Validators.min(1)]],
      gold18kPer10g: [gold['18K'] * 10, [Validators.required, Validators.min(1)]],
      silverRatePerKg: [silver, [Validators.required, Validators.min(1)]],
      goldLabourPercent: [labour.goldLabourPercent, [Validators.required, Validators.min(0)]],
      goldLabourGram: [labour.goldLabourGram, [Validators.required, Validators.min(0)]],
      silverLabourPercent: [labour.silverLabourPercent, [Validators.required, Validators.min(0)]],
      silverLabourGram: [labour.silverLabourGram, [Validators.required, Validators.min(0)]]
    });
  }

  autoDeriveFrom24k(): void {
    const gold24k10g = parseFloat(this.settingsForm.get('gold24kPer10g')?.value);
    if (!gold24k10g || gold24k10g <= 0) return;

    const gold22k10g = Math.round((gold24k10g * 22) / 24 * 100) / 100;
    const gold18k10g = Math.round((gold24k10g * 18) / 24 * 100) / 100;

    this.settingsForm.patchValue({
      gold22kPer10g: gold22k10g,
      gold18kPer10g: gold18k10g
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) return;

    const val = this.settingsForm.value;

    this.marketService.updateGoldRates({
      '24K': parseFloat(val.gold24kPer10g) / 10,
      '22K': parseFloat(val.gold22kPer10g) / 10,
      '18K': parseFloat(val.gold18kPer10g) / 10
    });

    this.marketService.updateSilverRate(parseFloat(val.silverRatePerKg));

    this.settingsService.updateLabourSettings({
      goldLabourPercent: parseFloat(val.goldLabourPercent),
      goldLabourGram: parseFloat(val.goldLabourGram),
      silverLabourPercent: parseFloat(val.silverLabourPercent),
      silverLabourGram: parseFloat(val.silverLabourGram)
    });

    this.saveSuccessMessage.set('Rates & Labour settings successfully updated in LocalStorage!');
    setTimeout(() => this.saveSuccessMessage.set(null), 3500);
  }

  resetToDefaults(): void {
    this.settingsService.resetAllSettings();
    this.marketService.updateGoldRates({
      '24K': 14800,
      '22K': 13566.67,
      '18K': 11100
    });
    this.marketService.updateSilverRate(230000);

    this.settingsForm.patchValue({
      gold24kPer10g: 148000,
      gold22kPer10g: 135666.7,
      gold18kPer10g: 111000,
      silverRatePerKg: 230000,
      goldLabourPercent: 10,
      goldLabourGram: 350,
      silverLabourPercent: 8,
      silverLabourGram: 50
    });

    this.saveSuccessMessage.set('Reset to Indian market standard benchmark defaults!');
    setTimeout(() => this.saveSuccessMessage.set(null), 3500);
  }
}
