import { Category } from "../category/category";

export interface Product {
  ProductId: string;
  Name: string;
  ShortDescription: string;
  Description: string;
  Category: Category;
  Price: number;
  ImagePaths: string[];
  MinimumOrderQuantity: number;
  MaximumOrderQuantity: number;
}

export interface ProductResponse {
  value: Product[];
  "@odata.count": number;
}