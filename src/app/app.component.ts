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

  ngOnInit() {
    this.modeService.init();
    this.router.events.subscribe((event) => {
      const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
        if(Object.keys(loggedInUser).length === 0) {
          localStorage.removeItem('isLoggedIn');
        }
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');

        const decoded = jwtDecode(loggedInUser.token);
        console.log('Decoded Token:', decoded.exp);

        if(Object.keys(loggedInUser).length !== 0) {
          const jwtExpired = loggedInUser.jwtExpirationInSec;
          const currentTime = Math.floor(Date.now() / 1000);
          console.log(currentTime);
          
          if (decoded.exp && currentTime > decoded.exp - 1100) {
            console.log("refreshing token");
            this.authService.refreshToken().subscribe((response) => {
              console.log(response);
              if (response) {
                console.log("REFRESHING TOKEN...")
                // localStorage.setItem('auth-user', JSON.stringify(response));
              }
            });
          }
        } else {
          localStorage.removeItem(this.authLocalStorageToken);
          localStorage.removeItem('isLoggedIn');
        }
      }
    });
  }
}
