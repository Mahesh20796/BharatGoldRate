import { Injectable, inject, signal, effect } from '@angular/core';
import { StorageService } from './storage.service';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storage = inject(StorageService);
  private readonly THEME_KEY = 'app_theme';

  readonly currentTheme = signal<ThemeMode>(
    this.storage.getItem<ThemeMode>(this.THEME_KEY, 'dark')
  );

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
    });
  }

  toggleTheme(): void {
    const next = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
    this.storage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeMode): void {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('theme-dark');
      body.classList.remove('theme-light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('theme-light');
      body.classList.remove('theme-dark');
    }
  }
}
