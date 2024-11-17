import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { ResumeComponent } from '../resume/resume.component';
import { JobProfileComponent } from '../job-profile/job-profile.component';
import { MockintoHistoryComponent } from '../mockinto-history/mockinto-history.component';
import { MockintoScheduleComponent } from '../mockinto-schedule/mockinto-schedule.component';
import { MockintoQuestionsComponent } from '../mockinto-questions/mockinto-questions.component';
import { MyProfileComponent } from '../my-profile/my-profile.component';
import { MockintoBillingComponent } from '../mockinto-billing/mockinto-billing.component';
import { MockintoPlanComponent } from '../mockinto-plan/mockinto-plan.component';
import { CreateSubscriptionComponent } from '../create-subscription/create-subscription.component';
import { MockintoReportComponent } from '../mockinto-report/mockinto-report.component';
import { MockintoLiveComponent } from '../mockinto-live/mockinto-live.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'resume',
        component: ResumeComponent,
      },
      {
        path: 'job-profile',
        component: JobProfileComponent,
      },
      {
        path: 'mockinto-questions',
        component: MockintoQuestionsComponent,
      },
      {
        path: 'mockinto-schedule',
        component: MockintoScheduleComponent,
      },
      {
        path: 'mockinto-history',
        component: MockintoHistoryComponent,
      },
      {
        path: 'account-settings',
        component: MyProfileComponent,
      },
      {
        path: 'mockinto-billing',
        component: MockintoBillingComponent,
      },
      {
        path: 'mockinto-plan',
        component: MockintoPlanComponent,
      },
      {
        path: 'mockinto-payments',
        component: MockintoHistoryComponent,
      },
      {
        path: 'create-subscription',
        component: CreateSubscriptionComponent,
      },
      {
        path: 'mockinto-report/:id',
        component: MockintoReportComponent
      },
      {
        path: 'mockinto-live/:id',
        component: MockintoLiveComponent
      }
    ]),
    WidgetsModule,
    ModalsModule
  ],
})
export class DashboardModule {}
