import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from './supplier';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private baseUrl = `${BaseUrl.url}/suppliers`

  constructor(private http: HttpClient) { }

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.baseUrl);
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
