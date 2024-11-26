import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import * as bootstrap from 'bootstrap';

@Injectable({
  providedIn: 'root',
})
export class SharedService implements OnInit, OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `auth-user`;

  // public fields
  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  sendToRouter$: Observable<any>;
  sendToRouterSubject: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  authUser = JSON.parse(localStorage.getItem(this.authLocalStorageToken) || '{}');

  candidateId: any;
  tenantId: any;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.setUpAuthUser();
  }

  ngOnInit(): void {
    this.setUpAuthUser();
  }

  setUpAuthUser() {
    this.authUser = JSON.parse(localStorage.getItem(this.authLocalStorageToken) || '{}');
    if(Object.keys(this.authUser).length === 0) {
      this.router.navigate(['/auth/login']);
    } else {
      if(this.authUser.candidates?.length !== 0) {
        this.candidateId = this.authUser.candidates[0].id;
      }
      this.tenantId = this.authUser.tenant_id;
      this.isLoadingSubject = new BehaviorSubject<boolean>(false);
      this.isLoading$ = this.isLoadingSubject.asObservable();
      this.sendToRouter$ = this.sendToRouterSubject.asObservable();
    }
  }

  fetchDashboardData(): Observable<any> {
    this.authUser = JSON.parse(localStorage.getItem(this.authLocalStorageToken) || '{}');
    this.setUpAuthUser();
    this.isLoadingSubject?.next(true);
    return this.http.get<any>(`${environment.apiUrl}/candidate/dashboard?candidateId=${this.candidateId}&tenantId=${this.tenantId}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  // BEGIN: Manage Resumes

  uploadResume(file: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    return this.http.post<any>(`${environment.apiUrl}/resume?candidateId=${this.candidateId}&tenantId=${this.tenantId}`, formData)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  fetchAllResumes(page: number, size: number): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.get<any>(`${environment.apiUrl}/resume/candidate/all?candidateId=${this.candidateId}&page=${page}&size=${size}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  previewResume(resumeId: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    const responseTypeHeader = { responseType: 'arraybuffer' }; 
    return this.http.get<any>(`${environment.apiUrl}/resume/${resumeId}`, {
      responseType: 'arraybuffer' as 'json',
      observe: 'response'
    })
    .pipe(
      map((data: any) => {
        const contentDisposition = data.headers.get('Content-Disposition');
        let filename = 'download.pdf';

        // Extract filename from Content-Disposition header if present
        if (contentDisposition) {
          const matches = /filename="(.+)"/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }
        return { filename, data: data.body as ArrayBuffer };
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  deleteResume(resumes: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.delete<any>(`${environment.apiUrl}/resume/all`, { body: resumes })
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  // Job Profile/Job Posting Actions

  fetchAllJobProfiles(page: number, size: number): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.get<any>(`${environment.apiUrl}/jobPosting/all?tenantId=${this.tenantId}&page=${page}&size=${size}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  addJobProfile(jobProfile: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.post<any>(`${environment.apiUrl}/jobPosting`, jobProfile)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  updateJobProfile(jobProfile: any): Observable<any> {
    const payload = {
      ...jobProfile,
      tenant: { id: this.tenantId}
    }
    this.isLoadingSubject?.next(true);
    return this.http.put<any>(`${environment.apiUrl}/jobPosting`, payload)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  deleteJobProfile(jobProfile: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.delete<any>(`${environment.apiUrl}/jobPosting?jobPostingId=${jobProfile.id}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  deleteJobProfileBulk(jobProfiles: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.delete<any>(`${environment.apiUrl}/jobPosting/all`, { body: jobProfiles })
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  // Mockinto Schedules

  fetchAllMockintoSchedules(status: number, page: number, size: number, sortField: string, sortDirection: string): Observable<any> {
    this.isLoadingSubject?.next(true);
    if(!this.candidateId) {
      return of(Error('No Candidate Found'));
    }
    return this.http.get<any>(`${environment.apiUrl}/interviewSchedule/candidate/all?candidateId=${this.candidateId}&status=${status}&page=${page}&size=${size}&sortField=${sortField}&sortDirection=${sortDirection}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }
  
  fetchMockintoScheduleById(scheduleId: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.get<any>(`${environment.apiUrl}/interviewSchedule?InterviewScheduleId=${scheduleId}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(new Error('No Schedule Found'));
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  addMockintoSchedule(mockintoSchedule: any): Observable<any> {
    const payload = {
      ...mockintoSchedule,
      tenant: { id: this.tenantId },
      candidate: { id: this.candidateId, tenant: { id: this.tenantId } }
    }
    console.log(payload);
    this.isLoadingSubject?.next(true);
    return this.http.post<any>(`${environment.apiUrl}/interviewSchedule`, payload)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  updateMockintoSchedule(mockintoSchedule: any): Observable<any> {
    const payload = {
      ...mockintoSchedule,
      tenant: { id: this.tenantId },
      candidate: { id: this.candidateId, tenant: { id: this.tenantId } }
    }
    console.log(payload);
    this.isLoadingSubject?.next(true);
    return this.http.put<any>(`${environment.apiUrl}/interviewSchedule`, payload)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  deleteMockintoSchedule(mockintoSchedule: any): Observable<any> { // Single Not Working at the Moment
    this.isLoadingSubject?.next(true);
    return this.http.delete<any>(`${environment.apiUrl}/interviewSchedule?interviewScheduleId=${mockintoSchedule.schedule.id}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  deleteMockintoScheduleBulk(mockintoSchedules: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.delete<any>(`${environment.apiUrl}/interviewSchedule/all`, { body: mockintoSchedules })
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  // Profile Actions
  editProfile(profile: any): Observable<any> {
    const payload = {
      ...profile,
      id: this.candidateId,
      tenant: { id: this.tenantId }
    }
    this.isLoadingSubject?.next(true);
    return this.http.put<any>(`${environment.apiUrl}/candidate`, payload)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  // Mockinto Questions

  fetchAllMockintoQuestions(status: number, page: number, size: number): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.get<any>(`${environment.apiUrl}/interviewSchedule/candidate/all?candidateId=${this.candidateId}&status=${status}&page=${page}&size=${size}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  addMockintoQuestion(mockintoQuestion: any): Observable<any> {
    const payload = {
      ...mockintoQuestion,
      tenant: { id: this.tenantId },
      candidate: { id: this.candidateId, tenant: { id: this.tenantId } }
    }
    return this.http.post<any>(`${environment.apiUrl}/botJobCandidateQuestion`, payload)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  updateMockintoQuestion(mockintoQuestion: any): Observable<any> {
    const payload = {
      ...mockintoQuestion,
      tenant: { id: this.tenantId },
      candidate: { id: this.candidateId, tenant: { id: this.tenantId } }
    }
    return this.http.put<any>(`${environment.apiUrl}/botJobCandidateQuestion`, payload)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(err);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  deleteMockintoQuestionBulk(mockintoQuestions: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.delete<any>(`${environment.apiUrl}/interviewSchedule/all`, { body: mockintoQuestions })
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }
  
  deleteMockintoQuestion(mockintoQuestions: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.delete<any>(`${environment.apiUrl}/botJobCandidateQuestion?botJobCandidateQuestionId=${mockintoQuestions}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  // Mockinto History
  fetchAllMockintoSchedulesByCandidate(status: number, page: number, size: number): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.get<any>(`${environment.apiUrl}/interviewSchedule/candidate/all?candidateId=${this.candidateId}&status=${status}&page=${page}&size=${size}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  endMockintoSchedule(mockintoSchedule: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    console.log(mockintoSchedule);
    return this.http.post<any>(`${environment.apiUrl}/interviewSchedule/end`, mockintoSchedule)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(new Error('Error Ending Mockinto Schedule'));
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  fetchMockintoReportByScheduleId(scheduleId: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.get<any>(`${environment.apiUrl}/interviewSchedule/candidate/report?scheduleId=${scheduleId}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(new Error('No Report Found'));
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  stopMockintoSchedule(scheduleData: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.put<any>(`${environment.apiUrl}/interviewSchedule`, scheduleData)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  // Live Mockinto

  fetchAllMockintoQuestionsByScheduleId(scheduleId: any, page: number = 0, pageSize: number = 99): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.get<any>(`${environment.apiUrl}/botJobCandidateQuestion/schedule/all?scheduleId=${scheduleId}&page=${page}&size=${pageSize}`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  saveCandidateAnswer(candidateAnswer: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.post<any>(`${environment.apiUrl}/botJobCandidateQuestionResponse`, candidateAnswer)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(new Error('Error Save Candidate Answer'));
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  // Mockinto Plan Backend Update
  updateBackendForPlanChange(stripeSubscription: any): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.post<any>(`${environment.apiUrl}/subscription`, stripeSubscription)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(new Error('Error Updating Plan'));
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }


  getConfigAll(): Observable<any> {
    this.isLoadingSubject?.next(true);
    return this.http.get<any>(`${environment.apiUrl}/generalConfig/tenant/all?tenantId=1`)
    .pipe(
      map((data: any) => {
        return data;
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject?.next(false))
    );
  }

  // Misc Actions

  showToaster() {
    const toastElement = document.getElementById('kt_docs_toast_toggle');
    const toast = bootstrap.Toast.getOrCreateInstance(toastElement as any);
    toast.show();
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
