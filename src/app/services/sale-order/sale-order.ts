import { Customer } from "../customer/customer";
import { Product } from "../product/product";
import { Warehouse } from "../warehouse/warehouse";

export interface SaleOrder {
  SaleOrderId: string;
  Product: Product;
  Warehouse: Warehouse;
  Customer: Customer;
  Quantity: number;
  Price: number;
  OrderDate: Date;
  DeliveryAddress: string;
}

export interface SaleOrderResponse {
  value: SaleOrder[];
  "@odata.count": number;
}