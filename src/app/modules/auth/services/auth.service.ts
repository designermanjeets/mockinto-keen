import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `auth-user`;

  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router,
    private http: HttpClient
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  login(username: string | undefined, password: string | undefined, rememberMe: boolean = true): Observable<UserType> {
    this.isLoadingSubject.next(true);
    localStorage.removeItem('unAuthSelectededPlan');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem(this.authLocalStorageToken);
    return this.http.post<any>(`${environment.apiUrl}/authenticate`, { username, password, rememberMe })
    .pipe(
      map((auth: AuthModel) => {
        const result = this.setAuthFromLocalStorage(auth);
        return result;
      }),
      switchMap(() => this.getUserByToken()),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout() {
    if(this.router.url.includes('auth/login')) {
      return;
    }
    localStorage.removeItem(this.authLocalStorageToken);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('unAuthSelectededPlan');
    localStorage.removeItem('general_config');
    localStorage.removeItem('tenant_general_config');
    localStorage.removeItem('pagination_general_config');
    
    (Swal as any).fire({
      title: 'Logout',
      text: 'You have been successfully logged out!',
      icon: 'success',
      showConfirmButton: false,
      timer: 1500,
    }).then(() => {
      localStorage.removeItem(this.authLocalStorageToken);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('unAuthSelectededPlan');
      localStorage.removeItem('general_config');
      localStorage.removeItem('pagination_general_config');
      this.router.navigate(['/auth/login'], {
        queryParams: {},
      });
      document.location.reload();
    });
  }

  getUserByToken(): Observable<UserType> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.token) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return this.authHttpService.getUserByToken(auth).pipe(
      map((user: UserType) => {
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // need create new user then login
  registration(user: UserModel): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.http.post<any>(`${environment.apiUrl}/register`, user)
    .pipe(
      map(() => {
        this.isLoadingSubject.next(false);
      }),
      switchMap(() => this.login(user.user_email, user.password)),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }


  forgotPassword(email: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    let payload = {
      email : email
    }
    return this.http.post<any>(`${environment.apiUrl}/forgotPassword`, payload)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(new Error('Error not Forgot Plan'));
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }


  // forgotPassword(email: string): Observable<boolean> {
  //   this.isLoadingSubject.next(true);
  //   return this.authHttpService
  //     .forgotPassword(email)
  //     .pipe(finalize(() => this.isLoadingSubject.next(false)));
  // }

  setAuthFromLocalStorage(auth: AuthModel): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.token) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }
      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      return undefined;
    }
  }

  refreshToken(): Observable<any> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.refreshToken) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return this.http.post<any>(`${environment.apiUrl}/refresh`, {
      refreshToken: auth.refreshToken,
      token: auth.token,
    })
    .pipe(
      map((auth: AuthModel) => {
        this.setAuthFromLocalStorage(auth);
        return auth.token;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
