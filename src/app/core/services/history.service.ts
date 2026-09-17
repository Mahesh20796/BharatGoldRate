import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { CalculationResult } from '../models/calculator.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly storage = inject(StorageService);
  private readonly STORAGE_KEY = 'calculator_history';

  readonly historyList = signal<CalculationResult[]>(
    this.storage.getItem<CalculationResult[]>(this.STORAGE_KEY, [])
  );

  addCalculation(item: CalculationResult): void {
    const current = this.historyList();
    // Prepend new item and keep max 100 items
    const updated = [item, ...current.filter(x => x.id !== item.id)].slice(0, 100);
    this.historyList.set(updated);
    this.storage.setItem(this.STORAGE_KEY, updated);
  }

  deleteCalculation(id: string): void {
    const updated = this.historyList().filter(x => x.id !== id);
    this.historyList.set(updated);
    this.storage.setItem(this.STORAGE_KEY, updated);
  }

  clearHistory(): void {
    this.historyList.set([]);
    this.storage.setItem(this.STORAGE_KEY, []);
  }

  formatShareText(item: CalculationResult): string {
    const formattedCurrency = (num: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num);

    const metalTitle = item.metal === 'gold' ? `Gold (${item.purity})` : 'Fine Silver (999)';
    const makingDetail = item.labourType === 'none'
      ? 'Nil (₹0)'
      : (item.labourType === 'percentage' ? `${item.labourInput}%` : `₹${item.labourInput}/g`);

    let gstDetail = `GST (${item.gstPercentage}%): ${formattedCurrency(item.gstAmount)}`;
    if (item.gstPercentage === 0) {
      gstDetail = `GST (0% / Exempt): ₹0.00`;
    } else if (item.gstPercentage === 3.0) {
      gstDetail = `GST (3.0% - CGST 1.5% + SGST 1.5%): ${formattedCurrency(item.gstAmount)}`;
    }

    let share = `----------------------------------------\n`;
    share += `      BHARAT GOLD & SILVER RATES\n`;
    share += `       PRICE ESTIMATION MEMO\n`;
    share += `----------------------------------------\n`;
    share += `Date:          ${item.formattedDate}\n`;
    share += `Ref No:        #${item.id.substring(item.id.length - 6).toUpperCase()}\n`;
    share += `Item:          ${item.productTitle}\n`;
    share += `Metal Purity:  ${metalTitle}\n`;
    share += `Net Weight:    ${item.weightGrams.toFixed(3)} g\n`;
    share += `Benchmark:     ${formattedCurrency(item.ratePerGram)} / g\n`;
    share += `----------------------------------------\n`;
    share += `Metal Value:   ${formattedCurrency(item.metalValue)}\n`;
    share += `Making Charge: ${formattedCurrency(item.makingCharge)} (${makingDetail})\n`;
    share += `Taxable Total: ${formattedCurrency(item.taxableValue)}\n`;
    share += `${gstDetail}\n`;
    share += `========================================\n`;
    share += `NET PAYABLE:   ${formattedCurrency(item.finalPrice)}\n`;
    share += `========================================\n`;
    share += `Generated via Bharat Gold & Silver Rates`;

    return share;
  }

  shareViaWhatsApp(item: CalculationResult): void {
    const text = encodeURIComponent(this.formatShareText(item));
    const url = `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
  }

  async copyToClipboard(item: CalculationResult): Promise<boolean> {
    const text = this.formatShareText(item);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      }
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
      return false;
    }
  }
}
