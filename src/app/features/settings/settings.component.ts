import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { ThemeService } from '../../core/services/theme.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
    <div class="page-container settings-page">
      <!-- Page Header -->
      <div class="page-header-row">
        <div>
          <h2 class="page-title">Settings & Tax Configuration</h2>
          <p class="page-subtitle">Configure GST tax rules, app themes, and preferences stored in LocalStorage</p>
        </div>
      </div>

      <div class="settings-layout">
        <!-- Main Configuration Form -->
        <form [formGroup]="gstForm" (ngSubmit)="saveGstSettings()" class="settings-form">
          <!-- GST Rates Configuration Section -->
          <div class="app-card section-card">
            <div class="section-card-header">
              <div class="header-left">
                <span class="material-symbols-outlined icon gold-icon">account_balance</span>
                <div>
                  <h3>Indian GST Rate Settings</h3>
                  <span class="sub">Do not hard-code tax rates; fully configurable</span>
                </div>
              </div>
            </div>

            <div class="gst-tax-note">
              <span class="material-symbols-outlined note-icon">info</span>
              <p>
                Tax rates are configurable and should be verified against current applicable Indian tax rules.
                Standard GST on gold/silver jewellery and bullion is 3.0% in India.
              </p>
            </div>

            <div class="fields-grid">
              <div class="form-group">
                <label>Gold Base GST (%)</label>
                <div class="input-with-symbol">
                  <span class="symbol">%</span>
                  <input type="number" step="0.1" class="form-control" formControlName="goldGst" min="0" max="100" />
                </div>
              </div>

              <div class="form-group">
                <label>Silver Base GST (%)</label>
                <div class="input-with-symbol">
                  <span class="symbol">%</span>
                  <input type="number" step="0.1" class="form-control" formControlName="silverGst" min="0" max="100" />
                </div>
              </div>

              <div class="form-group">
                <label>Gold Jewellery GST (%)</label>
                <div class="input-with-symbol">
                  <span class="symbol">%</span>
                  <input type="number" step="0.1" class="form-control" formControlName="jewelleryGst" min="0" max="100" />
                </div>
              </div>

              <div class="form-group">
                <label>Gold Bar / Bullion GST (%)</label>
                <div class="input-with-symbol">
                  <span class="symbol">%</span>
                  <input type="number" step="0.1" class="form-control" formControlName="goldBarGst" min="0" max="100" />
                </div>
              </div>

              <div class="form-group">
                <label>Silver Jewellery GST (%)</label>
                <div class="input-with-symbol">
                  <span class="symbol">%</span>
                  <input type="number" step="0.1" class="form-control" formControlName="silverJewelleryGst" min="0" max="100" />
                </div>
              </div>

              <div class="form-group">
                <label>Silver Bar GST (%)</label>
                <div class="input-with-symbol">
                  <span class="symbol">%</span>
                  <input type="number" step="0.1" class="form-control" formControlName="silverBarGst" min="0" max="100" />
                </div>
              </div>
            </div>

            <div class="btn-row-inside">
              <button type="submit" class="btn-primary">
                <span class="material-symbols-outlined">save</span>
                <span>Save GST Percentages</span>
              </button>
            </div>

            @if (saveSuccessMessage()) {
              <div class="save-toast">
                <span class="material-symbols-outlined">check_circle</span>
                <span>{{ saveSuccessMessage() }}</span>
              </div>
            }
          </div>

          <!-- Theme & Appearance -->
          <div class="app-card section-card">
            <div class="section-card-header">
              <div class="header-left">
                <span class="material-symbols-outlined icon">palette</span>
                <div>
                  <h3>Theme & Visual Style</h3>
                  <span class="sub">Switch between Dark Luxe and Clean Light visual modes</span>
                </div>
              </div>
            </div>

            <div class="theme-options-grid">
              <div
                class="theme-card-option"
                [class.active]="themeService.currentTheme() === 'dark'"
                (click)="themeService.setTheme('dark')"
              >
                <div class="theme-preview dark-preview">
                  <div class="preview-header"></div>
                  <div class="preview-card gold-border"></div>
                </div>
                <div class="theme-label-wrap">
                  <span class="theme-title">Deep Gold Luxe (Dark)</span>
                  <span class="theme-desc">Recommended for jewel-rich contrast</span>
                </div>
              </div>

              <div
                class="theme-card-option"
                [class.active]="themeService.currentTheme() === 'light'"
                (click)="themeService.setTheme('light')"
              >
                <div class="theme-preview light-preview">
                  <div class="preview-header"></div>
                  <div class="preview-card"></div>
                </div>
                <div class="theme-label-wrap">
                  <span class="theme-title">Clean Metallic (Light)</span>
                  <span class="theme-desc">High clarity for daytime usage</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Data & Privacy Management -->
          <div class="app-card section-card">
            <div class="section-card-header">
              <div class="header-left">
                <span class="material-symbols-outlined icon">security</span>
                <div>
                  <h3>Privacy & Local Data</h3>
                  <span class="sub">100% Client-side and offline safe</span>
                </div>
              </div>
            </div>

            <p class="data-privacy-desc">
              This application operates completely offline in your browser. No passwords, user credentials, or calculation figures are collected or transmitted to external servers. All data is securely retained in your device's browser LocalStorage.
            </p>

            <div class="storage-action-row">
              <button type="button" class="btn-secondary btn-danger-border" (click)="resetApp()">
                <span class="material-symbols-outlined">restart_alt</span>
                <span>Reset All App Cache & Defaults</span>
              </button>
            </div>
          </div>
        </form>

        <!-- Official Disclaimer Card (Section 33) -->
        <div class="app-card disclaimer-card">
          <div class="disclaimer-header">
            <span class="material-symbols-outlined warning-icon">gavel</span>
            <h3>Important Market Disclaimer</h3>
          </div>
          <div class="disclaimer-text">
            <p>
              Market prices shown in this application are for informational and calculation purposes. Actual jewellery prices may vary depending on the seller, purity, making charges, wastage, taxes and other applicable charges.
            </p>
            <p>
              Tax rates and market prices should be verified from current official or authorised sources before making a purchase.
            </p>
          </div>
          <div class="app-info-footer">
            <div class="info-row">
              <span>Application Version:</span>
              <strong>v1.0.0 (Indian Market Edition)</strong>
            </div>
            <div class="info-row">
              <span>Data Source Mode:</span>
              <strong>LocalStorage & API-Ready Architecture</strong>
            </div>
            <div class="info-row">
              <span>Standard Hallmarking:</span>
              <strong>BIS Hallmark 916 / 750 / 999</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header-row {
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

    .settings-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;

      @media (min-width: 960px) {
        grid-template-columns: 1.5fr 1fr;
        align-items: start;
      }
    }

    .settings-form {
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
      }
    }

    .gst-tax-note {
      display: flex;
      gap: 0.65rem;
      background: rgba(212, 175, 55, 0.08);
      border: 1px solid var(--border-highlight);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;

      .note-icon {
        color: var(--text-gold);
        font-size: 20px;
        flex-shrink: 0;
      }

      p {
        font-size: 0.8rem;
        color: var(--text-secondary);
        line-height: 1.45;
      }
    }

    .fields-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;

      @media (min-width: 600px) {
        grid-template-columns: 1fr 1fr;
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
        font-size: 1rem;
      }

      input {
        padding-left: 2rem;
        font-weight: 700;
        color: var(--text-primary);
        font-family: var(--font-heading);
      }
    }

    .btn-row-inside {
      margin-top: 1.25rem;
    }

    .save-toast {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid var(--color-success);
      color: var(--color-success);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      margin-top: 1rem;
    }

    /* Theme Options */
    .theme-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      .theme-card-option {
        background: var(--input-bg);
        border: 2px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        &:hover {
          border-color: var(--border-highlight);
        }

        &.active {
          border-color: var(--gold-500);
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
        }

        .theme-preview {
          height: 70px;
          border-radius: var(--radius-md);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;

          &.dark-preview {
            background: #0B0E14;
            .preview-header { height: 12px; background: #182030; border-radius: 4px; }
            .preview-card { flex: 1; background: #121824; border-radius: 4px; border: 1px solid #D4AF37; }
          }

          &.light-preview {
            background: #F4F6FA;
            .preview-header { height: 12px; background: #FFFFFF; border-radius: 4px; }
            .preview-card { flex: 1; background: #FFFFFF; border-radius: 4px; border: 1px solid #CBD5E1; }
          }
        }

        .theme-label-wrap {
          .theme-title {
            font-size: 0.88rem;
            font-weight: 700;
            color: var(--text-primary);
            display: block;
          }
          .theme-desc {
            font-size: 0.7rem;
            color: var(--text-muted);
          }
        }
      }
    }

    .data-privacy-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 1.25rem;
    }

    .btn-danger-border {
      color: var(--color-danger);
      border-color: var(--color-danger);

      &:hover {
        background: var(--color-danger-bg);
      }
    }

    /* Disclaimer Card */
    .disclaimer-card {
      background: var(--card-gradient-neutral);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 1.5rem;

      .disclaimer-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: var(--color-manual);

        h3 {
          font-size: 1.15rem;
          color: var(--text-primary);
        }
      }

      .disclaimer-text {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        font-size: 0.84rem;
        color: var(--text-secondary);
        line-height: 1.55;
        border-bottom: 1px solid var(--border-subtle);
        padding-bottom: 1.25rem;
        margin-bottom: 1.25rem;
      }

      .app-info-footer {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--text-muted);

          strong {
            color: var(--text-primary);
          }
        }
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly settingsService = inject(SettingsService);
  readonly themeService = inject(ThemeService);
  readonly storageService = inject(StorageService);

  readonly saveSuccessMessage = signal<string | null>(null);

  gstForm!: FormGroup;

  ngOnInit(): void {
    const gst = this.settingsService.gstSettings();
    this.gstForm = this.fb.group({
      goldGst: [gst.goldGst, [Validators.required, Validators.min(0), Validators.max(100)]],
      silverGst: [gst.silverGst, [Validators.required, Validators.min(0), Validators.max(100)]],
      jewelleryGst: [gst.jewelleryGst, [Validators.required, Validators.min(0), Validators.max(100)]],
      goldBarGst: [gst.goldBarGst, [Validators.required, Validators.min(0), Validators.max(100)]],
      silverJewelleryGst: [gst.silverJewelleryGst, [Validators.required, Validators.min(0), Validators.max(100)]],
      silverBarGst: [gst.silverBarGst, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  saveGstSettings(): void {
    if (this.gstForm.invalid) return;

    const val = this.gstForm.value;
    this.settingsService.updateGstSettings({
      goldGst: parseFloat(val.goldGst),
      silverGst: parseFloat(val.silverGst),
      jewelleryGst: parseFloat(val.jewelleryGst),
      goldBarGst: parseFloat(val.goldBarGst),
      silverJewelleryGst: parseFloat(val.silverJewelleryGst),
      silverBarGst: parseFloat(val.silverBarGst)
    });

    this.saveSuccessMessage.set('GST rules updated and saved in LocalStorage!');
    setTimeout(() => this.saveSuccessMessage.set(null), 3500);
  }

  resetApp(): void {
    if (confirm('Are you sure you want to reset all app settings, custom rates, and caches?')) {
      this.storageService.clear();
      window.location.reload();
    }
  }
}
