import { Product } from "../product/product";
import { Warehouse } from "../warehouse/warehouse";

export interface Stock {
  StockId: string;
  Product: Product;
  Warehouse: Warehouse;
  StockQuantity: number;
  LowStockThreshold: number;
  QuantityPerUnit: number;
  Sku: string;
}

export interface StockResponse {
  value: Stock[];
  "@odata.count": number;
}
