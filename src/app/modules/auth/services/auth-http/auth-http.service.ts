import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, catchError, concatMap, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { UserModel } from '../../models/user.model';
import { environment } from '../../../../../environments/environment';
import { AuthModel } from '../../models/auth.model';
import { BaseUrl } from 'src/app/services/base-url';
import { JwtPayload, jwtDecode } from 'jwt-decode';

const API_USERS_URL = `${environment.apiUrl}/auth`;

const LOGIN_URL = `${BaseUrl.url}/login`;
@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {

  private unsubscribe: Subscription[]= [];

  constructor(private http: HttpClient) {}

  // public methods
  login(email: string, password: string): Observable<HttpResponse<any> | HttpErrorResponse> {

    const formdata = new FormData();

    formdata.append('Email', email);
    formdata.append('Password', password);

    return this.http.post(LOGIN_URL, formdata , { observe: 'response' }).pipe (
      concatMap((response: HttpResponse<{}>) => {
        const decodedToken = jwtDecode<JwtPayload>((response.body as {Token?:string})?.Token || '');
        const auth = new AuthModel();
        auth.authToken = (response.body as {Token?: string})?.Token || '';
        auth.refreshToken = '';
        auth.expiresIn = decodedToken.exp? new Date(decodedToken.exp * 1000): null;
        auth.displayImage = "";
        auth.displayName = '';

        return of(new HttpResponse({status: 200, body: auth}));
      }),
      catchError((error: HttpErrorResponse)=>{
        return throwError(()=> error);
      })
    ) 
  }

  // CREATE =>  POST: add a new user to the server
  createUser(user: UserModel): Observable<UserModel> {
    return this.http.post<UserModel>(API_USERS_URL, user);
  }

  // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${API_USERS_URL}/forgot-password`, {
      email,
    });
  }
  
  tokenExpValid(token: AuthModel): Observable<boolean> {
    const decodedToken = jwtDecode<JwtPayload>(token.authToken);
    //@ts-ignore
    // console.log(new Date((decodedToken.exp * 1000) - (decodedToken.iat * 1000)).getUTCMinutes());
    // checking if the local-storage auth has been tampered or not
    if (decodedToken && decodedToken.exp) {
      if (token.expiresIn?.toString() !== new Date(decodedToken.exp * 1000).toISOString()) {
        // local-storage has been tampered
        return of(false);
      }
      if (Date.now() >= decodedToken.exp * 1000) {
        // the authentication token has expired
        return of(false);
      }
      return of(true);
    } else {
      return of(false);
    }
  }
  
    getUserByToken(token: string): Observable<any> {
      // const auth = this.getAuthFromLocalStorage();
      // if(!auth || !auth.authToken){
      //   return of(undefined);
      // }
      // this.isLoadingSubject.next(true);
      
      const httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      return this.http.get<UserModel>(`${API_USERS_URL}/me`, {
        headers: httpHeaders,
      });
    }


  // private getAuthFromLocalStorage(): AuthModel | undefined {
  //   try{
  //     const lsValue = localStorage.getItem(this.authLocalStorageToken);
  //     if(!lsValue){
  //       return undefined;
  //     }

  //     const authData = JSON.parse(lsValue);
  //     return authData;
  //   } catch {
  //     return undefined;
  //   }
  // }
}
