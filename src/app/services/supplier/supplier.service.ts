import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { HttpClient, HttpParams } from '@angular/common/http';
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
      params = params.append('$filter',`contains(tolower(Name), '${searchKey}') or contains(tolower(Country), '${searchKey}') or contains(tolower(City), '${searchKey}')`);

    return this.http.get<SupplierResponse>(this.baseUrl, { params: params });
  }

  addSupplier(formData: FormData): Observable<string> {
    return this.http.post<string>(this.baseUrl, formData);
  }

  editSupplier(id: string, formData: FormData): Observable<string> {
    return this.http.patch<string>(`${this.baseUrl}/${id}`, formData);
  }

  deleteSupplier(id: string): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${id}`);
  }
}
