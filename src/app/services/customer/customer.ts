export interface Customer {
  CustomerId: string;
  Name: string;
  LogoPath: string;
  Country: string;
  City: string;
  DeliveryAddress: string;
  Email: string;
  PrimaryPhoneNumber: string;
  SecondaryPhoneNumber: string;
}

export interface CustomerResponse {
  value: Customer[];
  "@odata.count": number;
}