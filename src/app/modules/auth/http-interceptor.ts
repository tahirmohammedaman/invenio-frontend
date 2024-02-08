import { HttpHandler, HttpHeaders, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class HttpInterceptor implements HttpInterceptor{
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    // const token = localStorage.getItem('token');

    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiSm9obiBEb2UiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJVc2VyIiwiZXhwIjoxNzA3NDQ5NDQ1LCJpc3MiOiJpbnZlbmlvLmNvbSIsImF1ZCI6ImludmVuaW8uY29tIn0.907taHKUHBaWpu7ev4jTlh4WpJT1aj5Y9ZrZMcmewPU";

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    req = req.clone({
      headers
    });
    
    return next.handle(req);
  }
}