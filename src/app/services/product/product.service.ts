import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product, ProductResponse } from './product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = `${BaseUrl.url}/products`;

  constructor(private http: HttpClient) { }

  getProducts(page?: number, perPage?: number, searchKey?: string) {
    let params = new HttpParams()
      .set('$expand', 'Category')
      .set('$count', 'true');

    if (page && perPage) {
      params = params.append('$skip', `${(page - 1) * perPage}`);
      params = params.append('$top', `${perPage}`);
    }

    if(searchKey?.trim())
      params = params.append('$filter', `contains(tolower(Name), '${searchKey}')`); // TODO: Add more fields to search

    return this.http.get<ProductResponse>(this.baseUrl, { params: params });
  }

  addProduct(formData: FormData) : Observable<Product>{
    return this.http.post<Product>(this.baseUrl, formData);
  }

  editProduct(id: string, formData: FormData) : Observable<Product>{
    return this.http.put<Product>(`${this.baseUrl}/${id}`, formData);
  }

  deleteProduct(id: string) : Observable<Product>{
    return this.http.delete<Product>(`${this.baseUrl}/${id}`);
  }
}