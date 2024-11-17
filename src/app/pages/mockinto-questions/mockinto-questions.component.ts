import { AfterViewInit, ChangeDetectorRef, Component, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Observable } from 'rxjs';
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
  isLoading$: Observable<boolean>;

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
    this.isLoading$ = this.sharedService.isLoading$;
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
    this.sharedService.isLoadingSubject.next(true);
    this.sharedService.fetchAllMockintoSchedules(1, page, size, 'id', 'ASC').subscribe(
      data => {
        if(data) {
          this.mockintoSchedules = data.content;
        }
        this.sharedService.isLoadingSubject.next(false);
        this.cdRef.detectChanges();
      }
    );
  }

  fetchAllMockintoQuestions(page = 0, size = 10) {
    this.sharedService.isLoadingSubject.next(true);
    this.sharedService.fetchAllMockintoQuestions(1, page, size).subscribe(
      data => {
        if(data) {
          this.mockintoQuestions = data.content;
          this.paginator.length = data.totalElements;
          data.content.forEach((item: any, idx: number) => {
            setTimeout(() => {
              if(this.paginatorSub.toArray()[idx]) {
                this.paginatorLength[idx] = item.schedule.botJobCandidateQuestions.length;
                const paginators = this.paginatorSub.toArray();
                const start = paginators[idx].pageIndex * paginators[idx].pageSize;
                const end = start + paginators[idx].pageSize;
                this.subQuestionsSlice.splice(idx, 0, { start, end });
                this.cdRef.detectChanges();
              }
            }, 100);
          });
        }
        this.resetSelection();
        this.sharedService.isLoadingSubject.next(false);
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
        this.sharedService.deleteMockintoQuestionBulk([{ id: profile.schedule.id }]).subscribe(
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
          return { id: item.schedule.id };
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
      this.mockJobProfile = mockSchedule.jobPostingId;
      this.mockQuestion = mockQuestionData.question;
      this.cdRef.detectChanges();
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  addMockintoQuestionDialog() {
    const dialogRef = this.dialog.open(this.addDialogTemplate, {
      data: { },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  addUpdateMockintoQuestion(mockSchedule: any, mockQuestionData: any, idx: number, j: number) {
    this.sharedService.isLoadingSubject.next(true);
    mockSchedule.schedule.botJobCandidateQuestions[j].question = this.mockQuestion;
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const payload = Object.assign({},
      mockSchedule.schedule.botJobCandidateQuestions[j],
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
          "id": mockSchedule.schedule.id,
        },
    });

    if(mockSchedule) {
      this.sharedService.updateMockintoQuestion(payload).subscribe(data => {
        if(data) {
          this.sharedService.isLoadingSubject.next(false);
          this.closeDialog();
          this.fetchAllMockintoQuestions();
        }
      });
    } else {
      const payload = Object.assign({}, mockSchedule.schedule );
      // this.sharedService.addMockintoQuestion(payload).subscribe(data => {
      //   if(data) {
      //     this.sharedService.isLoadingSubject.next(false);
      //     this.closeDialog();
      //     this.fetchAllMockintoQuestions();
      //   }
      // });
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

  onSubMasterChange(event: any, idx: number) {
    this.masterCheckbox = event;
    const filteredQuestions = this.mockintoQuestionsFiltered(idx);
    this.mockintoQuestions[idx].schedule.botJobCandidateQuestions.forEach((item: any) => {
      const matchwith = filteredQuestions.find((i: any) => i.id === item.id);
      if(matchwith) {
        item.checked = event;
      }
    });
    console.log(filteredQuestions)
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
    this.subQuestionsSlice[idx] = { start, end };
    this.cdRef.detectChanges();
  }

  mockintoQuestionsFiltered(idx: number) {
    if(this.paginatorSub.toArray()[idx]) {
      const paginators = this.paginatorSub.toArray();
      const start = paginators[idx].pageIndex * paginators[idx].pageSize;
      const end = start + paginators[idx].pageSize;
      return this.mockintoQuestions[idx].schedule.botJobCandidateQuestions.slice(start, end);
    }
  }

}
