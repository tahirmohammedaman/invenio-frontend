export interface Warehouse {
  WarehouseId: string;
  Name: string;
  Country: string;
  City: string;
  Address: string;
  PhoneNumber: string;
  Email: string;
  Latitude: number;
  Longitude: number;
}

export interface WarehouseResponse {
  value: Warehouse[];
  '@odata.count': number;
}
