import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SupplyResponse } from './supply';
import { BaseUrl } from '../base-url';

@Injectable({
  providedIn: 'root'
})
export class SupplyService {

  private baseUrl = `${BaseUrl.url}/supplies`;

  constructor(private http: HttpClient) { }

  getSuppliesForProduct(productId: string, page?: number, perPage?: number) {
    let params = new HttpParams()
      .set('$expand', 'Supplier')
      .set('$count', 'true')
      .set('$filter', `Product/ProductId eq ${productId}`);

    if (page && perPage) {
      params = params.append('$skip', `${(page - 1) * perPage}`);
      params = params.append('$top', `${perPage}`);
    }

    // if(searchKey?.trim())
    //   params = params.append('$filter', `contains(tolower(Product/Name), '${searchKey}') or contains(tolower(Supplier/Name), '${searchKey}')`); // TODO: Add more fields to search

    return this.http.get<SupplyResponse>(this.baseUrl, { params: params });
  }

  addSupply(formData: FormData) {
    return this.http.post(this.baseUrl, formData);
  }

  editSupply(id: string, formData: FormData) {
    return this.http.patch(`${this.baseUrl}/${id}`, formData);
  }

  deleteSupply(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
