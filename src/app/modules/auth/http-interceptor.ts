import { HttpHandler, HttpHeaders, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class HttpInterceptor implements HttpInterceptor{
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    // const token = localStorage.getItem('token');

    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiTWF4IFZlcnN0YXBwZW4iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsImV4cCI6MTcwNzQ3MTA3NywiaXNzIjoiaW52ZW5pby5jb20iLCJhdWQiOiJpbnZlbmlvLmNvbSJ9.qz1aa0eIt6_wjzndvgEZYWm2g6nFHGsutHGWbJuBYgA";

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    req = req.clone({
      headers
    });
    
    return next.handle(req);
  }
}