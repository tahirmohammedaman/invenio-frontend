import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SupplyOrderResponse } from './supply-order';
import { DomElementSchemaRegistry } from '@angular/compiler';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplyOrderService {

  private baseUrl = `${BaseUrl.url}/supplyorders`;

  constructor(private http: HttpClient) { }

  getSupplyOrders(page?: number, perPage?: number, searchKey?: string) {
    let params = new HttpParams()
      .set('$expand', 'Supply($expand=Supplier, Product), Warehouse')
      .set('$count', 'true');

    if (page && perPage) {
      params = params.append('$skip', `${(page - 1) * perPage}`);
      params = params.append('$top', `${perPage}`);
    }

    if (searchKey?.trim())
      params = params.append('$filter', `contains(tolower(Supply/Product/Name), '${searchKey}') or contains(tolower(Supply/Supplier/Name), '${searchKey}') or contains(tolower(Warehouse/Name), '${searchKey}')`);

    return this.http.get<SupplyOrderResponse>(this.baseUrl, { params: params });
  }

  addSupplyOrder(formData: FormData) {
    return this.http.post(this.baseUrl, formData);
  }

  deleteSupplyOrder(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  markSupplyOrderAsDeliveredAndUpdateStock(id: string) {
    return this.http.post(`${this.baseUrl}/${id}/delivery`, {});
  }
}
