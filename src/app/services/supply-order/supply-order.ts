import { Supply } from "../supply/supply";
import { Warehouse } from "../warehouse/warehouse";

export interface SupplyOrder {
  SupplyOrderId: string;
  Supply: Supply;
  Warehouse: Warehouse;
  Quantity: number;
  Price: number;
  OrderDate: Date;
  DeliveryDate: Date;
  IsDelivered: boolean;
}

export interface SupplyOrderResponse {
  value: SupplyOrder[];
  "@odata.count": number;
}