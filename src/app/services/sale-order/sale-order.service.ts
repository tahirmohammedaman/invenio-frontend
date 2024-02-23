import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SaleOrderResponse } from './sale-order';

@Injectable({
  providedIn: 'root'
})
export class SaleOrderService {

  private baseUrl = `${BaseUrl.url}/saleorders`;

  constructor(private http: HttpClient) { }

  getSaleOrders(page?: number, perPage?: number, searchKey?: string) {
    let params = new HttpParams()
      .set('$expand', 'Customer, Warehouse, Product($expand=Category)')
      .set('$count', 'true');

    if (page && perPage) {
      params = params.append('$skip', `${(page - 1) * perPage}`);
      params = params.append('$top', `${perPage}`);
    }

    if (searchKey?.trim())
      params = params.append('$filter', `contains(tolower(Product/Name), '${searchKey}') or contains(tolower(Warehouse/Name), '${searchKey}') or contains(tolower(Product/Category/Name), '${searchKey}') or contains(tolower(Customer/Name), '${searchKey}')`);
    return this.http.get<SaleOrderResponse>(this.baseUrl, { params: params });
  }

  addSaleOrder(formData: FormData) {
    return this.http.post(this.baseUrl, formData);
  }

  deleteSaleOrder(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
