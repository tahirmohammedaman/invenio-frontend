import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { StockResponse } from './stock';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  
  private baseUrl = `${BaseUrl.url}/stocks`;

  constructor(private http: HttpClient) { }

  getStocks(page?: number, perPage?: number, searchKey?: string) {
    let params = new HttpParams()
      .set('$expand', 'Product($expand=Category),Warehouse')
      .set('$count', 'true');

    if (page && perPage) {
      params = params.append('$skip', `${(page - 1) * perPage}`);
      params = params.append('$top', `${perPage}`);
    }

    if(searchKey?.trim())
      params = params.append('$filter', `contains(tolower(Product/Name), '${searchKey}')`); // TODO: Test

    return this.http.get<StockResponse>(this.baseUrl, { params: params });
  }

  addStock(formData: FormData) {
    return this.http.post(this.baseUrl, formData);
  }

  editStock(id: string, formData: FormData) {
    return this.http.put(`${this.baseUrl}/${id}`, formData);
  }

  deleteStock(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
