import { Customer } from "../customer/customer";
import { Product } from "../product/product";
import { Stock } from "../stock/stock";
import { Supplier } from "../supplier/supplier";
import { SupplyOrder } from "../supply-order/supply-order";

export interface DashboardDto {
  InventoryValue: number;
  TotalProducts: number;
  TotalCustomers: number;
  TotalSuppliers: number;

  SupplyTimeline: [{
    Status: string;
    DateTime: Date;
    SupplyOrder: SupplyOrder;
  }];

  TotalSales: number;
  TotalSalesThisMonth: number;
  TotalSalesThisMonthIncrease: number;

  LowStocks: Stock[];

  TopProducts: [{
    Product: Product;
    TotalSalesAmount: number;
  }];

  TopCustomers: [{
    Customer: Customer;
    TotalSalesAmount: number;
  }];

  TopSuppliers: [{
    Supplier: Supplier;
    TotalSuppliesAmount: number;
  }];

  RecentSupplyOrders: SupplyOrder[];
}