import { Product } from "../product/product";
import { Supplier } from "../supplier/supplier";

export interface Supply {
  SupplyId: string;
  Product: Product;
  Supplier: Supplier;
  Price: number;
  SupplyLeadTime: number;
  MaximumOrderQuantity: number;
  MinimumOrderQuantity: number;
}

export interface SupplyResponse {
  value: Supply[];
  "@odata.count": number;
}
