import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { Warehouse, WarehouseResponse } from './warehouse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  private baseUrl = `${BaseUrl.url}/warehouses`;

  constructor(private http: HttpClient) { }

  getWarehouses(page?: number, perPage?: number, searchKey?: string) {
    let params = new HttpParams()
      .set('$count', 'true');

    if (page && perPage) {
      params = params.append('$skip', `${(page - 1) * perPage}`);
      params = params.append('$top', `${perPage}`);
    }

    if(searchKey?.trim())
      params = params.append('$filter', `contains(Name, '${searchKey}') or contains(Country, '${searchKey}') or contains(City, '${searchKey}')`);

    return this.http.get<WarehouseResponse>(this.baseUrl, { params: params });
  }

  addWarehouse(formData: FormData) : Observable<Warehouse> {
    return this.http.post<Warehouse>(this.baseUrl, formData);
  }

  editWarehouse(id: string, formData: FormData) : Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.baseUrl}/${id}`, formData);
  }

  deleteWarehouse(id: string) : Observable<Warehouse> {
    return this.http.delete<Warehouse>(`${this.baseUrl}/${id}`);
  }
}
