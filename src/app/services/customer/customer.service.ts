import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { Observable } from 'rxjs';
import { CustomerResponse } from './customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private baseUrl = `${BaseUrl.url}/customers`;

  constructor(private http: HttpClient) { }

  getCustomers(page?: number, perPage?: number, searchKey?: string) : Observable<CustomerResponse> {
    let params = new HttpParams()
      .set('$count', 'true');

    if (page && perPage) {
      params = params.append('$skip', `${(page - 1) * perPage}`);
      params = params.append('$top', `${perPage}`);
    }

    if (searchKey?.trim())
      params = params.append('$filter', `contains(tolower(Name), '${searchKey}') or contains(tolower(Country), '${searchKey}') or contains(tolower(City), '${searchKey}')`);

    return this.http.get<CustomerResponse>(`${this.baseUrl}`, { params: params });
  }

  addCustomer(formData: FormData) {
    return this.http.post(`${this.baseUrl}`, formData);
  }

  editCustomer(id: string, formData: FormData) {
    return this.http.put(`${this.baseUrl}/${id}`, formData);
  }

  deleteCustomer(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
