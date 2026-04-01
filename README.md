# Receiving Leadership App Suite

This bundle includes 3 mobile-friendly GitHub Pages apps:

1. **manager-app** - Receiving Manager dashboard, staffing plan, daily reports, KPI tracking, exports, and saved history.
2. **lead-speed-app** - Lead app focused on dock flow, truck completion, pallets/hour, and shift execution.
3. **lead-accuracy-app** - Lead app focused on PO accuracy, shortages, damages, mislabels, and coaching notes.

## How to use on GitHub

For each app:
1. Create a new GitHub repository.
2. Upload the files inside that app's folder.
3. Make sure `index.html` stays in the root of the repo.
4. In GitHub, go to **Settings > Pages**.
5. Set source to **Deploy from a branch**.
6. Choose **main** branch and **/(root)**.
7. Save.

## Data storage

Each app saves data locally in the browser using `localStorage`.
- Good for quick use on your phone.
- Export JSON regularly if you want backup copies.
- On iPhone/Safari, use the same browser/device to keep the saved data available.

## What each app exports

- CSV summary for spreadsheet use
- JSON backup to restore later
- Printable report pages

## Suggested setup

- Use **manager-app** for you
- Give **lead-speed-app** to the lead responsible for pace / dock flow
- Give **lead-accuracy-app** to the lead responsible for quality / verification

