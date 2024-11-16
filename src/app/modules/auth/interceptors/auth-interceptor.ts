import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserModel } from '../models/user.model';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private authService: AuthService) {}

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
            this.authService.logout();
            return throwError(() => error);
          }
        }

        if (error.status === 403) {
          this.authService.logout();
          return throwError(() => error);
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
