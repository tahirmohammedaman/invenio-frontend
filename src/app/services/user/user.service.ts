import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { Observable } from 'rxjs';
import { UserResponse } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = `${BaseUrl.url}`;

  constructor(private http: HttpClient) { }

  getUsers(role?: string, page?: number, perPage?: number, searchKey?: string): Observable<UserResponse> {

    let params = new HttpParams()
      .set('$count', 'true');

    if (page && perPage) {
      params = params.append('$skip', `${(page - 1) * perPage}`);
      params = params.append('$top', `${perPage}`);
    }

    if (searchKey?.trim() && role?.trim())
      params = params.append('$filter', `(contains(tolower(FirstName), '${searchKey}') or contains(tolower(LastName), '${searchKey}') or contains(tolower(Email), '${searchKey}')) and Role eq invenio.Models.Role'${role}'`);

    else if (role?.trim())
      params = params.append('$filter', `Role eq invenio.Models.Role'${role}'`);

    return this.http.get<UserResponse>(this.baseUrl + '/users', { params: params });
  }

  registerUser(formData: FormData): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/register', formData);
  }
}