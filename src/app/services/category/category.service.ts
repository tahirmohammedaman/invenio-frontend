import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { Observable } from 'rxjs';
import { Category, CategoryResponse } from './category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private baseUrl = `${BaseUrl.url}/categories`;

  constructor(private http: HttpClient) { }

  getCategories(page?: number, perPage?: number, searchKey?: string): Observable<CategoryResponse> {
    let params = new HttpParams()
      .set('$expand', 'ParentCategory')
      .set('$count', 'true');

    if (page && perPage) {
      params = params.append('$skip', `${(page - 1) * perPage}`);
      params = params.append('$top', `${perPage}`);
    }

    if(searchKey?.trim())
      params = params.append('$filter', `contains(tolower(Name), '${searchKey}') or contains(tolower(ParentCategory/Name), '${searchKey}')`);

    return this.http.get<CategoryResponse>(this.baseUrl, { params: params });
  }

  addCategory(formData: FormData): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, formData);
  }

  editCategory(id: string, formData: FormData): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, formData);
  }

  deleteCategory(id: string): Observable<Category> {
    return this.http.delete<Category>(`${this.baseUrl}/${id}`);
  }
}
