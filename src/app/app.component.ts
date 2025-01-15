import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslationService } from './modules/i18n';
import { Injectable } from '@angular/core';
// language list
import { locale as enLang } from './modules/i18n/vocabs/en';
import { locale as chLang } from './modules/i18n/vocabs/ch';
import { locale as esLang } from './modules/i18n/vocabs/es';
import { locale as jpLang } from './modules/i18n/vocabs/jp';
import { locale as deLang } from './modules/i18n/vocabs/de';
import { locale as frLang } from './modules/i18n/vocabs/fr';
import { ThemeModeService } from './_metronic/partials/layout/theme-mode-switcher/theme-mode.service';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './modules/auth';
import jwt_decode from 'jwt-decode';
import { jwtDecode } from "jwt-decode";



@Injectable({
  providedIn: 'root',
})

@Component({
  // tslint:disable-next-line:component-selector
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {

  private authLocalStorageToken = `auth-user`;

  constructor(
    private translationService: TranslationService,
    private modeService: ThemeModeService,
    private router: Router,
    private authService: AuthService
  ) {
    // register translations
    this.translationService.loadTranslations(
      enLang,
      chLang,
      esLang,
      jpLang,
      deLang,
      frLang
    );
  }

  // ngOnInit() {
  //   this.modeService.init();
  //   this.router.events.subscribe((event) => {
  //     const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
  //       if(Object.keys(loggedInUser).length === 0) {
  //         localStorage.removeItem('isLoggedIn');
  //       }
  //   });
  //   this.router.events.subscribe((event) => {
  //     if (event instanceof NavigationEnd) {
  //       const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
  //       if (!loggedInUser || !loggedInUser.token) {
  //         console.error('Token is missing or invalid:', loggedInUser?.token);
  //       } else{
  //         const decoded = jwtDecode(loggedInUser.token);
  //         console.log('Decoded Token:', decoded.exp);
  //         if(Object.keys(loggedInUser).length !== 0) {
  //           const jwtExpired = loggedInUser.jwtExpirationInSec;
  //           const currentTime = Math.floor(Date.now() / 1000);
  //           console.log(currentTime);
  //           if (decoded.exp && currentTime > decoded.exp - 120) {
  //             console.log("refreshing token");
  //             this.authService.refreshToken().subscribe((response) => {
  //               console.log(response);
  //               if (response) {
  //                 console.log("REFRESHING TOKEN...")
  //                 // localStorage.setItem('auth-user', JSON.stringify(response));
  //               }
  //             });
  //           }
  //         } else {
  //           localStorage.removeItem(this.authLocalStorageToken);
  //           localStorage.removeItem('isLoggedIn');
  //         }
  //       }
  //     }
  //   });
  // }




  ngOnInit() {
    this.modeService.init();
  
    // Check if user is logged in when route changes
    this.router.events.subscribe((event) => {
      const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
      if (Object.keys(loggedInUser).length === 0) {
        localStorage.removeItem('isLoggedIn');
      }
    });
    this.startTokenRefreshWatcher();
  }
  
  startTokenRefreshWatcher() {
    const REFRESH_THRESHOLD = 120;
    const CHECK_INTERVAL = 60 * 1000; 
    setInterval(() => {
      const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
      if (loggedInUser && loggedInUser.token) {
        try {
          console.log('checking for token')
          const decoded = jwtDecode(loggedInUser.token);
          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded.exp && currentTime > decoded.exp - REFRESH_THRESHOLD) {
            console.log("Refreshing token automatically...");
            this.authService.refreshToken().subscribe((response) => {
              if (response) {
                console.log("Token refreshed successfully:", response);
                // localStorage.setItem('auth-user', JSON.stringify(response));
              } else {
                console.error("Failed to refresh token.");
              }
            });
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem('auth-user');
          localStorage.removeItem('isLoggedIn');
        }
      }
    }, CHECK_INTERVAL);
  }
}
