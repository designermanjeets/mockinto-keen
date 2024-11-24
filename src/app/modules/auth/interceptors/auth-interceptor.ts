import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserModel } from '../models/user.model';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authUser = this.getAuthUser();
    const authToken = authUser?.token;
    let authReq = req;

    if (authToken && !req.url.includes('https://api.stripe.com/')) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        // Handle CORS error (status code 0)
        if (error.status === 0) {
          // Return an empty observable to stop further processing
          return throwError(() => new Error('CORS error: Please check your server CORS configuration.'));
        }

        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          if (!authReq.url.includes('/refresh') && !this.isRefreshing) {
            return this.handle401Error(authReq, next);
          } else {
            (Swal as any).fire({
              title: 'Session Expired',
              text: 'Your session has expired. Please login again.',
              icon: 'error',
              showConfirmButton: false,
              showCancelButton: true,
              cancelButtonText: 'OK'
            }).then(() => {
              this.authService.logout();
            });
            return throwError(() => error);
          }
        }

        if (error.status === 403) {
          if(!this.router.url.includes('auth/login')) {
            (Swal as any).fire({
              title: 'Forbidden',
              text: 'You do not have permission to access this resource.',
              icon: 'error',
              showConfirmButton: false,
              showCancelButton: true,
              cancelButtonText: 'OK'
            }).then(() => {
              this.authService.logout();
            });
          }
          return throwError(() => error);
        }

        if (error.status === 417) {
          const error_417 = document.getElementById('kt_docs_toast_error_317');
          const toast = new bootstrap.Toast(error_417 as any);
          toast.show();
          setTimeout(() => {
            // if(localStorage.getItem('kt_docs_error_417')) {
            //   localStorage.removeItem('kt_docs_error_417');
            //   this.authService.logout();
            // } else {
            //   localStorage.setItem('kt_docs_error_417', 'true');
            //   window.location.reload();
            // }
          }, 2000);
          // (Swal as any).fire({
          //   title: 'Something went wrong, reloding the page',
          //   text: error.error.message,
          //   icon: 'error',
          //   showConfirmButton: false,
          //   showCancelButton: true,
          //   cancelButtonText: 'OK'
          // }).then(() => {
          //   window.location.reload();
          // });
        }

        // Other errors
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      return throwError(() => new Error('Token refresh in progress'));
    }
    this.isRefreshing = true;

    return this.authService.refreshToken().pipe(
      switchMap((user: UserModel) => {
        this.isRefreshing = false;
        this.authService.setAuthFromLocalStorage(user);

        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${user.token}`
          }
        });

        return next.handle(authReq);
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => error);
      })
    );
  }

  private getAuthUser(): UserModel | null {
    try {
      const user = localStorage.getItem('auth-user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  }
}
