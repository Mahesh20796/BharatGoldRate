import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard | Bharat Gold & Silver Rate'
  },
  {
    path: 'gold-rate',
    loadComponent: () =>
      import('./features/gold-rate/gold-rate.component').then(m => m.GoldRateComponent),
    title: 'Gold Rates & Unit Table | Bharat Gold'
  },
  {
    path: 'silver-rate',
    loadComponent: () =>
      import('./features/silver-rate/silver-rate.component').then(m => m.SilverRateComponent),
    title: 'Silver Rates & Denominations | Bharat Gold'
  },
  {
    path: 'calculator',
    loadComponent: () =>
      import('./features/calculator-hub/calculator-hub.component').then(m => m.CalculatorHubComponent),
    title: 'Gold & Silver Price Calculator | Bharat Gold'
  },
  {
    path: 'charts',
    loadComponent: () =>
      import('./features/charts-hub/charts-hub.component').then(m => m.ChartsHubComponent),
    title: '10-Year Historical Price Analysis (2017-2026) | Bharat Gold'
  },
  {
    path: 'rate-settings',
    loadComponent: () =>
      import('./features/rate-settings/rate-settings.component').then(m => m.RateSettingsComponent),
    title: 'Rate & Labour Settings | Bharat Gold'
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./features/calculation-history/calculation-history.component').then(m => m.CalculationHistoryComponent),
    title: 'Calculation Invoices & History | Bharat Gold'
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
    title: 'GST & App Settings | Bharat Gold'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
