export interface Supplier {
  SupplierId: string;
  Name: string;
  Country: string;
  City: string;
  Email: string;
  PrimaryPhoneNumber: string;
  SecondaryPhoneNumber: string;
  ManagerName: string;
  LogoPath: string;
}

export interface SupplierResponse {
  value: Supplier[];
  "@odata.count": number;
}