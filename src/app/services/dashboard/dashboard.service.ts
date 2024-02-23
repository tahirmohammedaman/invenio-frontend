import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';
import { Observable } from 'rxjs';
import { DashboardDto } from './dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = `${BaseUrl.url}/dashboard`;

  constructor(private http: HttpClient) { }

  getDashboardData() : Observable<DashboardDto> {
    return this.http.get<DashboardDto>(`${this.baseUrl}`);
  }
}
