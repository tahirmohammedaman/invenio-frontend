# Invenio — Inventory Management Console

**Frontend client** for **Invenio**, an inventory and warehouse management system. Manage products, stock across multiple warehouses, suppliers, customers, and orders — and close out incoming deliveries by scanning a code with your phone instead of hunting through a table.

🔗 Backend API: [invenio-backend](https://github.com/tahirmohammedaman/invenio-backend)

## Features

- **Dashboard** — at-a-glance KPIs and charts (ApexCharts) summarizing stock, orders, and sales activity.
- **Product & category management** — CRUD with image uploads and pricing/order-quantity rules.
- **Multi-warehouse stock** — track quantity, SKU, and low-stock thresholds per warehouse.
- **Supply orders (restocking)** — create and track orders against suppliers, with lead-time-driven delivery estimates.
- **Sale orders** — manage customer orders against live stock.
- **Suppliers & customers** — full directory management.
- **User management** — role-aware access (Admin vs. standard users) backed by JWT.
- **Search, pagination & export** — every list view is server-driven via OData query params, with one-click Excel export (`xlsx` + `file-saver`).
- **Internationalization** — multi-language UI via `ngx-translate`.

## Hardware-friendly delivery confirmation

Confirming that a supply order has physically arrived is normally a desk job — this app turns it into a one-tap phone action:

- **QR / barcode scanning** — the Supply Orders page embeds a live camera scanner (`@zxing/ngx-scanner`) right in the browser. A warehouse worker scans a QR code or barcode on the incoming shipment, and the app immediately calls the delivery-confirmation endpoint for that order — no searching a table, no manual clicks. Stock levels update automatically the moment the scan succeeds.
- **RFID from a microcontroller** — because the underlying API call is a plain authenticated POST keyed by order ID, the same delivery flow extends naturally to a **dock-mounted RFID reader on a microcontroller** (ESP32/Arduino-class hardware), letting a tagged pallet trigger the exact same stock update with zero human interaction at the door. *(Hardware integration lives on the [invenio-backend](https://github.com/tahirmohammedaman/invenio-backend) side, which exposes the endpoint this scan hits.)*

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Angular 16 |
| UI | Angular Material + ng-bootstrap + Bootstrap 5 (Metronic-based admin layout) |
| Charts | ApexCharts (`ng-apexcharts`) |
| Scanning | `@zxing/ngx-scanner` / `@zxing/browser` — camera-based QR/barcode scanning |
| State/data | RxJS, Angular services calling an OData-flavored REST API |
| Auth | JWT (`jwt-decode`), route guards |
| i18n | `@ngx-translate` |
| Export | `xlsx` + `file-saver` |

## Getting started

```bash
yarn install
ng serve
```

Navigate to `http://localhost:4200`. Configure the API base URL for `invenio-backend` in the environment files under `src/environments/`.

```bash
ng build    # production build to dist/
ng test     # unit tests via Karma
```

## Pages

Dashboard · Products · Categories · Stock · Suppliers · Customers · Sale Orders · **Supply Orders (with QR scanner)** · Warehouses · Users
