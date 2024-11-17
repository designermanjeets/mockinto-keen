import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ClipboardModule } from 'ngx-clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './modules/auth/services/auth.service';
import { environment } from 'src/environments/environment';
// #fake-start#
import { FakeAPIService } from './_fake/fake-api.service';
import { ResumeComponent } from './pages/resume/resume.component';
import { JobProfileComponent } from './pages/job-profile/job-profile.component';
import { MockintoQuestionsComponent } from './pages/mockinto-questions/mockinto-questions.component';
import { MockintoScheduleComponent } from './pages/mockinto-schedule/mockinto-schedule.component';
import { MockintoHistoryComponent } from './pages/mockinto-history/mockinto-history.component';
import { MockintoPlanComponent } from './pages/mockinto-plan/mockinto-plan.component';
import { ActivityLogsComponent } from './pages/activity-logs/activity-logs.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { AuthInterceptor } from './modules/auth/interceptors/auth-interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ProfileDetailsComponent } from './modules/account/settings/forms/profile-details/profile-details.component';
import { MockintoBillingComponent } from './pages/mockinto-billing/mockinto-billing.component';
import { NgxStripeModule } from 'ngx-stripe';
import { DeactivateAccountComponent } from './modules/account/settings/forms/deactivate-account/deactivate-account.component';
import { CreateSubscriptionComponent } from './pages/create-subscription/create-subscription.component';
import { MockintoReportComponent } from './pages/mockinto-report/mockinto-report.component';
import { WidgetsModule } from './_metronic/partials';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
// #fake-end#

function appInitializer(authService: AuthService) {
  return () => {
    return new Promise((resolve) => {
      // @ts-ignore
      authService.getUserByToken().subscribe().add(resolve);
    });
  };
}

@NgModule({
  declarations: [
    AppComponent, 
    ResumeComponent, 
    JobProfileComponent, 
    MockintoQuestionsComponent, 
    MockintoScheduleComponent, 
    MockintoHistoryComponent, 
    MockintoPlanComponent, 
    ActivityLogsComponent, 
    NotificationsComponent, 
    MyProfileComponent, 
    CheckoutComponent,
    ProfileDetailsComponent,
    DeactivateAccountComponent,
    MockintoBillingComponent,
    CreateSubscriptionComponent,
    MockintoReportComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    ClipboardModule,
    // #fake-start#
    environment.isMockEnabled
      ? HttpClientInMemoryWebApiModule.forRoot(FakeAPIService, {
          passThruUnknownUrl: true,
          dataEncapsulation: false,
        })
      : [],
    // #fake-end#
    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule,
    MatCardModule,
    NgxStripeModule.forRoot('pk_test_51QA7S8AWH1At8PiUavNwOL5XwoiIMBb6wS5YjDBlKnjHZr2a703Xwdbkjn0wjyiZ83XaqaoBXoZifc85weR8SeoB00IZPZtpH0'),
    
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },
    {
      provide: HTTP_INTERCEPTORS,  
      useClass: AuthInterceptor,  
      multi: true 
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
