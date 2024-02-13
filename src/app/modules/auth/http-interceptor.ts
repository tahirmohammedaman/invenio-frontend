import { HttpHandler, HttpHeaders, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class HttpInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    let token = localStorage.getItem('authToken');
    
    if (token) {
      const parsedAuthToken = JSON.parse(token);

      if (parsedAuthToken && parsedAuthToken.authToken) {
        token = parsedAuthToken.authToken;

        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
        req = req.clone({
          headers
        });
      }
    }

    return next.handle(req);
  }
}