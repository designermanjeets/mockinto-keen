import { AfterViewInit, ChangeDetectorRef, Component, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, Observable, Subscription, timeout } from 'rxjs';
import { SharedService } from '../services/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

import * as Swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-mockinto-questions',
  templateUrl: './mockinto-questions.component.html',
  styleUrls: ['./mockinto-questions.component.scss']
})
export class MockintoQuestionsComponent  implements OnInit, AfterViewInit {

  mockintoQuestions: any = [];
  masterCheckbox: boolean = false;
  someChecked = [];

  mockJobProfile: any;
  mockResume: any;

  indicatorprogress = false;

  allJobProfiles: any = [];
  allResumes: any = [];

  @ViewChild('addDialogTemplate', { static: true }) addDialogTemplate!: TemplateRef<any>;
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChildren('paginatorSub') paginatorSub:QueryList<MatPaginator>;;

  paginatorLength: any = {};

  mockScheduleID: any;
  mockQuestion: string = '';
  mockintoSchedules: any = [];
  subQuestionsSlice: any = [];
  origMockintoQuestions:any = [];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];

  // Picker
  @ViewChild('picker') picker: any;
  public date: moment.Moment;
  public enableMeridian = false;
  public minDate = new Date(Date.now());
  public maxDate: moment.Moment;
  public dateControl = new FormControl(new Date());
  public dateControlMinMax = new FormControl(new Date());

  constructor(
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.isLoading$.next(true);
    this.fetchAllMockintoQuestions();
    this.fetchJobProfiles();
   this.fetchAllMockintoSchedules();
  }

  ngAfterViewInit(): void {
    
  }

  fetchJobProfiles() {
    this.sharedService.fetchAllJobProfiles(0, 99).subscribe(
      data => {
        if(data) {
          this.allJobProfiles = data.content;
        }
      }
    );
  }

  fetchAllMockintoSchedules(page = 0, size = 10) {
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.fetchAllMockintoSchedules(0, page, size, 'id', 'ASC').subscribe(
      data => {
        if(data) {
          this.mockintoSchedules = data.content;
        }
        this.sharedService.isLoadingSubject?.next(false);
        this.cdRef.detectChanges();
      }
    );
  }

  fetchAllMockintoQuestions(page = 0, size = 10) {
    this.isLoading$.next(true);
    this.sharedService.fetchAllMockintoQuestions(0, page, size).subscribe(
      data => {
        if(data) {
          this.mockintoQuestions = data.content;
          this.paginator.length = data.totalElements;
          this.origMockintoQuestions = JSON.parse(JSON.stringify(this.mockintoQuestions));
          this.isLoading$.next(false);
          this.cdRef.detectChanges();
        }
        this.resetSelection();
        this.isLoading$.next(false);
        this.cdRef.detectChanges();
      }
    );
  }

  deleteMockintoQuestion(profile: any) {
    (Swal as any).fire({
      text: "Are you sure you would like to Delete?",
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-active-light"
      }
    }).then((result: any) => {
      if(result.isDismissed) {
        return;
      }
      if(result.isConfirmed) {
        this.sharedService.deleteMockintoQuestion(profile.id).subscribe(
          data => {
            this.fetchAllMockintoQuestions();
          }
        );
      }
    });
  }

  deleteBulk() {
    (Swal as any).fire({
      text: "Are you sure you would like to Delete?",
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-active-light"
      }
    }).then((result: any) => {
      if(result.isDismissed) {
        return;
      }
      if(result.isConfirmed) {
        const profiles_filter = this.mockintoQuestions.filter((item: any) => item.checked);
        const profiles = profiles_filter.map((item: any) => {
          return { id: item?.id };
        });
        this.sharedService.deleteMockintoQuestionBulk(profiles).subscribe(
          data => {
            this.fetchAllMockintoQuestions();
          }
        );
      }
    });
  }

  editMockintoQuestion(mockSchedule: any, mockQuestionData: any, idx: number, j: number) {
    const dialogRef = this.dialog.open(this.addDialogTemplate, {
      data: { mockSchedule, mockQuestionData, idx, j },
    });

    dialogRef.afterOpened().subscribe(result => {
      this.mockJobProfile = mockSchedule;
      this.mockScheduleID = mockSchedule.id;
      this.mockQuestion = mockQuestionData.question;
      this.cdRef.detectChanges();
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  addMockintoQuestionDialog() {
    this.mockJobProfile = null;
    this.mockScheduleID = null;
    this.mockQuestion = '';
    const dialogRef = this.dialog.open(this.addDialogTemplate, {
      data: { },
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  addUpdateMockintoQuestion(mockSchedule: any, mockSchedulesdata:any, mockQuestionData: any, idx: number, j: number) {
    this.isLoading$.next(true);
    const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
    if(mockSchedule) {
      mockSchedule.botJobCandidateQuestions[j].question = this.mockQuestion;
      const payload = Object.assign({},
        mockSchedule.botJobCandidateQuestions[j],
        {
          "question": this.mockQuestion,
          "candidate": {
            "id": loggedInUser.id,
          },
          "jobPosting": {
            "id": mockSchedule.jobPostingId,
          },
          "tenant": {
            "id": loggedInUser.tenant_id,
          },
          "interviewSchedule": {
            "id": mockSchedule.id,
          },
         
      });
      this.sharedService.updateMockintoQuestion(payload)
      .pipe( timeout({ first: 5_000 }))
      .subscribe(data => {
        this.isLoading$.next(false);
        this.closeDialog();
        this.fetchAllMockintoQuestions();
      }, (error) => {
        if (error.error instanceof ProgressEvent) {
          console.error('Possible CORS or network issue');
        } else {
          console.error('Error details:', error.error);
        }
        this.isLoading$.next(false);
        this.closeDialog();
        this.fetchAllMockintoQuestions();
      });
    } else {
      let value = mockSchedulesdata.filter((x:any)=> x.id === Number(this.mockScheduleID));
      const payload = Object.assign({},
        {
          "active":"1",
          "question": this.mockQuestion,
          "candidate": {
            "id": loggedInUser.id,
          },

          "jobPosting": {
            "id": value[0]?.jobPostingId,
          },
          "tenant": {
            "id": loggedInUser.tenant_id,
          },
          "interviewSchedule": {
            "id": this.mockScheduleID,
          },
      });
      this.sharedService.addMockintoQuestion(payload)
      .pipe( timeout({ first: 5_000 }))
      .subscribe(data => {
        this.isLoading$.next(false);
        this.closeDialog();
        this.fetchAllMockintoQuestions();
      }, (error) => {
        if (error.error instanceof ProgressEvent) {
          console.error('Possible CORS or network issue');
        } else {
          console.error('Error details:', error.error);
        }
        this.isLoading$.next(false);
        this.closeDialog();
        this.fetchAllMockintoQuestions();
      });
    }
  }

 removeCircularReferences(obj: any, seen = new WeakSet()) {
    if (obj && typeof obj === 'object') {
      if (seen.has(obj)) return undefined;
      seen.add(obj);
      const result: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        result[key] = this.removeCircularReferences(obj[key], seen);
      }
      return result;
    }
    return obj;
  }

  onAccordHeaderClicked(schedule: any, idx: number, databastarget: HTMLElement) {
    if(databastarget.getAttribute('aria-expanded') === 'true') {
      this.fetchAllMockintoQuestionsByScheduleId(schedule, idx);
    }
  }

  fetchAllMockintoQuestionsByScheduleId(schedule: any, idx: number) {
    this.isLoading$.next(true);
    this.sharedService.fetchAllMockintoQuestionsByScheduleId(schedule.id).subscribe((res) => {
      if(res) {
        if(res?.content.length > 0) {
          schedule['botJobCandidateQuestions'] = res.content as any;
          if(this.paginatorSub.toArray()[idx]) {
            this.paginatorLength[idx] = res.content.length;
            const paginators = this.paginatorSub.toArray();
            const start = paginators[idx].pageIndex * paginators[idx].pageSize;
            const end = start + paginators[idx].pageSize;
            schedule['botJobCandidateQuestionsfiltered'] = JSON.parse(JSON.stringify(res.content)).slice(start, end);
            this.cdRef.detectChanges();
          }
          
        }
      }
      this.isLoading$.next(false);
      this.cdRef.detectChanges();
    });
  }

  onSubMasterChange(event: any, idx: number) {
    this.masterCheckbox = event;
    const filteredQuestions = this.mockintoQuestionsFiltered(idx);
    this.mockintoQuestions[idx].schedule.botJobCandidateQuestions.forEach((item: any) => {
      const matchwith = filteredQuestions.find((i: any) => i.id === item.id);
      if(matchwith) {
        item.checked = event;
      }
    });
  }

  onRowCheckChange(event: any, ques: string, idx: any, ijx: any) {
    this.mockintoQuestions[idx].checked = event;
    this.masterCheckbox = this.mockintoQuestions.every((item: any) => item.checked);
    this.someChecked = this.mockintoQuestions.filter((item: any) => item.checked);
  }

  resetSelection() {
    this.masterCheckbox = false;
    this.someChecked = [];
    this.mockintoQuestions.forEach((item: any) => item.checked = false);
  }

  onPageChange(event: any) {
    this.fetchAllMockintoQuestions(event.pageIndex, event.pageSize);
  }

  onSubPageChange(event: any, idx: number) {
    const paginators = this.paginatorSub.toArray();
    const start = paginators[idx].pageIndex * paginators[idx].pageSize;
    const end = start + paginators[idx].pageSize;
    this.mockintoQuestions[idx].botJobCandidateQuestionsfiltered = JSON.parse(JSON.stringify(this.mockintoQuestions[idx].botJobCandidateQuestions)).slice(start, end);
    this.cdRef.detectChanges();
  }

  mockintoQuestionsFiltered(idx: number) {
    if(this.paginatorSub.toArray()[idx]) {
      const paginators = this.paginatorSub.toArray();
      const start = paginators[idx].pageIndex * paginators[idx].pageSize;
      const end = start + paginators[idx].pageSize;
      return this.mockintoQuestions[idx]?.schedule?.botJobCandidateQuestions.slice(start, end);
    }
  }


  
  searchQuestions(event: any) {
    const value = event.target.value;
    this.sharedService.isLoadingSubject?.next(true);
    if(value) {
      this.mockintoQuestions = this.origMockintoQuestions.filter((item: any) => {
        return item.jobHeader.toLowerCase().includes(value.toLowerCase());
      });
    } else {
      this.mockintoQuestions = JSON.parse(JSON.stringify(this.origMockintoQuestions));
    }
    this.sharedService.isLoadingSubject?.next(false);
  }

}
