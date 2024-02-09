import { Category } from "../category/category";

export interface Product {
  ProductId: string;
  Name: string;
  ShortDescription: string;
  Description: string;
  Category: Category;
  Price: number;
  Image1Path: string;
  Image2Path: string;
  Image3Path: string;
  Image4Path: string;
  MinimumOrderQuantity: number;
  MaximumOrderQuantity: number;
}

export interface ProductResponse {
  value: Product[];
  "@odata.count": number;
}