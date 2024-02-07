import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseUrl } from '../base-url';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private baseUrl = `${BaseUrl.url}/static`

  constructor(private http: HttpClient) { }

  getImage(imageName: string) {
    return this.http.get(`${this.baseUrl}/${imageName}`, { responseType: 'blob' });
  }
}
