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

    const metalTitle = item.metal === 'gold' ? `⚜️ Gold (${item.purity})` : '🥈 Silver';

    let share = `═══════════════════════════\n`;
    share += `    💎 BHARAT GOLD & SILVER 💎\n`;
    share += `       ESTIMATE & INVOICE\n`;
    share += `═══════════════════════════\n\n`;
    share += `📅 Date: ${item.formattedDate}\n`;
    share += `👑 Item: ${item.productTitle}\n`;
    share += `✨ Metal: ${metalTitle}\n`;
    share += `⚖️ Weight: ${item.weightGrams.toFixed(3)} grams\n`;
    share += `📈 Base Rate: ${formattedCurrency(item.ratePerGram)} / gram\n\n`;
    share += `───────────────────────────\n`;
    share += `💰 Metal Value:    ${formattedCurrency(item.metalValue)}\n`;
    share += `🔨 Making Charge:  ${formattedCurrency(item.makingCharge)} (${item.labourType === 'percentage' ? item.labourInput + '%' : '₹' + item.labourInput + '/g'})\n`;
    share += `📑 Taxable Value:  ${formattedCurrency(item.taxableValue)}\n`;
    share += `🏛️ GST (${item.gstPercentage}%):       ${formattedCurrency(item.gstAmount)}\n`;
    share += `═══════════════════════════\n`;
    share += `🎯 FINAL PRICE:    ${formattedCurrency(item.finalPrice)}\n`;
    share += `═══════════════════════════\n\n`;
    share += `*Calculated via Bharat Gold & Silver Rate App*`;

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
