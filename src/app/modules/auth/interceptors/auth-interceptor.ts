import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserModel } from '../models/user.model';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const authUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
        const authToken = authUser ? authUser.token : null;
        let authReq = req;

        if (authToken) {
            authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${authToken}`
                }
            });
        }
        
        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error(authReq);
                // Handle CORS error (status code 0)
                if (error.status === 0) {
                    console.error('CORS error detected');
                    this.authService.logout(); // Redirect to login page
                    return throwError(() => new Error('CORS error: Please check your server CORS configuration.'));
                }
                if (error.status === 401) {
                    if(!authReq.url.includes('/refresh')) {
                        return this.handle401Error(authReq, next);
                    } else {
                        this.authService.logout();
                        return throwError(error);
                    }
                } else {
                    return throwError(error);
                }
            })
        );
    }

    private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
        return this.authService.refreshToken().pipe(
            switchMap((user: UserModel) => {
                this.authService.setAuthFromLocalStorage(user);
                const authReq = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                return next.handle(authReq);
            }),
            catchError((error: any) => {
                this.authService.logout();
                return throwError(error);
            })
        );
    }
}