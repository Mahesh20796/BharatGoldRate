# 💎 Bharat Gold & Silver Rate & Calculator

A modern, responsive, mobile-first **Gold & Silver Rate and Calculator Application for the Indian Market** built with **Angular**, **TypeScript**, **Angular Material**, **Chart.js**, and **LocalStorage** persistence.

---

## 🌟 Key Features

* **👑 Market Dashboard**: Live/Manual benchmark prices for 24K, 22K (Hallmark 916), 18K Gold and 999 Fine Silver with 1g, 10g (Tola), and 1kg metrics.
* **⚜️ Gold Rate Module**: Multi-unit rate converter (Gram, 10 Gram / 1 Tola, 1 Kilogram), auto-derives 22K and 18K rates from 24K base rate, and provides standard Indian weight denomination tables (Sovereign/Pavan, Tola, Kg).
* **🥈 Silver Rate Module**: Rates for 1g, 10g, 100g, 1kg with comprehensive silver jewellery, coins, bars, and utensil weight guides.
* **🧮 Price & GST Calculator**: Step-by-step Gold and Silver calculation with weight presets, Percentage (%) and Per-Gram (₹/g) making charges, configurable GST %, and instant Price Summary Invoices.
* **📊 10-Year Historical Analysis (2017 – 2026)**: Interactive Chart.js line charts with Gold purity toggles, Silver unit toggles, 10-year total return metrics, cycle highs/lows, and milestone events table.
* **⚙️ Rate & GST Management**: Custom rate editor, auto-derive button, default labour charges, configurable GST percentages, and LocalStorage persistence.
* **🧾 Calculation History & Invoices**: Store estimate invoices locally, filter by metal, keyword search, share directly via WhatsApp, or copy formatted text invoices to the clipboard.
* **🌓 Deep Gold Luxe & Clean Light Themes**: Seamless toggle between luxury dark gold and high-contrast light themes.
* **🔌 API-Ready Architecture**: Service-driven structure (`MarketRateService`, `CalculatorService`, `StorageService`, `HistoryService`) ready for instant live WebSocket/REST market rate API integration.

---

## 📐 Mathematical Formulas

### Gold Calculation
$$\text{Gold Value} = \text{Weight (g)} \times \text{Rate per Gram}$$
$$\text{Making Charge (Percentage)} = \text{Gold Value} \times \frac{\text{Labour \%}}{100}$$
$$\text{Making Charge (Per Gram)} = \text{Weight (g)} \times \text{Labour per Gram}$$
$$\text{Taxable Value} = \text{Gold Value} + \text{Making Charge}$$
$$\text{GST Amount} = \text{Taxable Value} \times \frac{\text{GST \%}}{100}$$
$$\text{Final Price} = \text{Taxable Value} + \text{GST Amount}$$

### Silver Calculation
$$\text{Silver Value} = \text{Weight (g)} \times \text{Silver Rate per Gram}$$
$$\text{Taxable Value} = \text{Silver Value} + \text{Labour}$$
$$\text{GST Amount} = \text{Taxable Value} \times \frac{\text{GST \%}}{100}$$
$$\text{Final Price} = \text{Taxable Value} + \text{GST Amount}$$

---

## 🛠️ Technology Stack

* **Framework**: Angular 22 (Standalone Components, Signals, Reactive Forms, View Transitions)
* **Styling**: SCSS & Vanilla CSS Design System with responsive grid & flexbox
* **Icons & Typography**: Google Fonts (Outfit & Plus Jakarta Sans), Material Symbols
* **Data Visualization**: Chart.js / ng2-charts
* **Storage**: Browser LocalStorage
* **Testing**: Vitest & Angular Testing Utilities

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ or v22+)
* npm (v10+)

### Installation
```bash
# Clone repository
git clone https://github.com/Mahesh20796/BharatGoldRate.git

# Navigate into project directory
cd BharatGoldRate

# Install dependencies
npm install --legacy-peer-deps
```

### Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/` in your browser.

### Run Unit Tests
```bash
ng test --watch=false
```

### Production Build
```bash
ng build
```
Build artifacts will be stored in the `dist/` directory.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
