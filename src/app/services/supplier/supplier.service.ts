import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier, SupplierResponse } from './supplier';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private baseUrl = `${BaseUrl.url}/suppliers`

  constructor(private http: HttpClient) { }

  getSuppliers(page?: number, perPage?: number, searchKey?: string): Observable<SupplierResponse> {
    let params = new HttpParams()
      .set('$count', 'true');
    
    if (page && perPage) {
      params = params.append('$skip', `${(page - 1) * perPage}`);
      params = params.append('$top', `${perPage}`);
    }

    if (searchKey?.trim())
      params = params.append('$search', searchKey);

    return this.http.get<SupplierResponse>(this.baseUrl, { params: params });
  }

  addSupplier(formData: FormData): Observable<Supplier> {
    return this.http.post<Supplier>(this.baseUrl, formData);
  }

  editSupplier(id: string, formData: FormData): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.baseUrl}/${id}`, formData);
  }

  deleteSupplier(id: string): Observable<Supplier> {
    return this.http.delete<Supplier>(`${this.baseUrl}/${id}`);
  }
}
