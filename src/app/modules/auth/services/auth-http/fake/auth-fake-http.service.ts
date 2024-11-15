import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserModel } from '../../../models/user.model';
import { AuthModel } from '../../../models/auth.model';
import { UsersTable } from '../../../../../_fake/users.table';
import { environment } from '../../../../../../environments/environment';

const API_USERS_URL = `${environment.apiUrl}/users`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) {}

  // public methods
  login(email: string, password: string): Observable<any> {
    const notFoundError = new Error('Not Found');
    if (!email || !password) {
      return of(notFoundError);
    }

    return this.getAllUsers().pipe(
      map((result: UserModel[]) => {
        if (result.length <= 0) {
          return notFoundError;
        }

        const user = result.find((u) => {
          return (
            u.user_email?.toLowerCase() === email.toLowerCase() &&
            u.password === password
          );
        });
        if (!user) {
          return notFoundError;
        }

        const auth = new AuthModel();
        auth.token = user.token;
        auth.refreshToken = user.refreshToken;
        auth.jwtExpirationInSec =  user.jwtExpirationInSec; // new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
        return auth;
      })
    );
  }

  createUser(user: UserModel): Observable<any> {
    user.roles = [2]; // Manager
    user.token = 'auth-token-' + Math.random();
    user.refreshToken = 'auth-token-' + Math.random();
    user.jwtExpirationInSec = user.jwtExpirationInSec; // new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
    user.pic = './assets/media/avatars/300-1.jpg';

    return this.http.post<UserModel>(API_USERS_URL, user);
  }

  forgotPassword(email: string): Observable<boolean> {
    return this.getAllUsers().pipe(
      map((result: UserModel[]) => {
        const user = result.find(
          (u) => u.user_email?.toLowerCase() === email.toLowerCase()
        );
        return user !== undefined;
      })
    );
  }

  getUserByToken(data: any): Observable<any | undefined> {
    if (!data) {
      return of(undefined);
    }

    return of(data);
  }

  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(API_USERS_URL);
  }
}
