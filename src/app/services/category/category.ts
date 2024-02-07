export interface Category {
  CategoryId: string;
  Name: string;
  Description: string;
  ImagePath: string;
  ParentCategory?: Category;
}

export interface CategoryResponse {
  value: Category[];
  "@odata.count": number;
}