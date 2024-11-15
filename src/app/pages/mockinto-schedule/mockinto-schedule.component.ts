import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { MatDialog } from '@angular/material/dialog';

import * as Swal from 'sweetalert2';
import * as moment from 'moment';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map, Observable, startWith } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-mockinto-schedule',
  templateUrl: './mockinto-schedule.component.html',
  styleUrls: ['./mockinto-schedule.component.scss']
})
export class MockintoScheduleComponent implements OnInit, AfterViewInit {

  mockintoSchedules: any = [];
  masterCheckbox: boolean = false;
  someChecked = [];

  mockJobProfile: any;
  mockResume: any;

  indicatorprogress = false;
  isLoading$: Observable<boolean>;

  allJobProfiles: any = [];
  allResumes: any = [];

  @ViewChild('addDialogTemplate', { static: true }) addDialogTemplate!: TemplateRef<any>;
  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;

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
    this.fetchAllMockintoSchedules();
    this.fetchJobProfiles();
    this.fetchAllResumes();
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

  fetchAllResumes() {
    this.sharedService.fetchAllResumes(0, 99).subscribe(
      data => {
        if(data) {
          this.allResumes = data.content;
        }
      }
    );
  }

  fetchAllMockintoSchedules(page = 0, size = 10) {
    this.sharedService.isLoadingSubject.next(true);
    this.sharedService.fetchAllMockintoSchedules(1, page, size, 'id', 'ASC').subscribe(
      data => {
        if(data) {
          this.paginator.length = data.totalElements;
          this.mockintoSchedules = data.content;
        }
        this.resetSelection();
        this.sharedService.isLoadingSubject.next(false);
        this.cdRef.detectChanges();
      }
    );
  }

  deleteMockintoSchedule(profile: any) {
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
        this.sharedService.deleteMockintoSchedule(profile).subscribe(
          data => {
            this.fetchAllMockintoSchedules();
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
        const profiles_filter = this.mockintoSchedules.filter((item: any) => item.checked);
        const profiles = profiles_filter.map((item: any) => {
          return { id: item.id };
        });
        this.sharedService.deleteMockintoScheduleBulk(profiles).subscribe(
          data => {
            this.fetchAllMockintoSchedules();
          }
        );
      }
    });
  }

  editMockintoSchedule(mockinto: any) {
    console.log('editMockintoSchedule', mockinto);
    const dialogRef = this.dialog.open(this.addDialogTemplate, {
      data: { mockinto },
    });

    dialogRef.afterOpened().subscribe(result => {
      this.mockJobProfile = mockinto.mockJobProfile;
      this.mockResume = mockinto.resume;
      this.cdRef.detectChanges();
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  addMockintoScheduleDialog() {
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

  addUpdateMockintoSchedule(patchValue?: any) {

    this.sharedService.isLoadingSubject.next(true);
    if(Object.keys(patchValue).length !== 0 && patchValue.constructor === Object) {
      const payload = {
        ...patchValue.mockinto,
        "mockJobProfile": this.mockJobProfile,
        "jobDescription": this.mockResume,
      }
      this.sharedService.updateMockintoSchedule(payload).subscribe(
        data => {
          if(data) {
            this.sharedService.isLoadingSubject.next(false);
            this.closeDialog();
            this.fetchAllMockintoSchedules();
          }
        }
      );
    } else {
      console.log(this.mockJobProfile);
      console.log(this.mockResume);
      const payload = {
        "active": 1,
        "deleted": 0,
        "interviewPeriodMinutes": 0,
        "scheduleStartDate": this.dateControl,
        "scheduleStatusId": 0,
        "updatedBy": 0,
        "jobPosting": {
            "id": this.mockJobProfile,
            "active": 1,
            "deleted": 0,
            "updatedBy": 0,
            "tenant": {
                "id": "1"
            }
        },
        "resume": {
            "id": this.mockResume
        }
    };
      console.log(payload);
      console.log(this.dateControl);
      this.sharedService.addMockintoSchedule(payload).subscribe(
        data => {
          if(data) {
            this.sharedService.isLoadingSubject.next(false);
            this.closeDialog();
            this.fetchAllMockintoSchedules();
          }
        }
      );
    }
  }

  onMasterChange(event: any) {
    this.masterCheckbox = event;
    this.mockintoSchedules.forEach((item: any) => item.checked = event);
    this.someChecked = this.mockintoSchedules.filter((item: any) => item.checked);
  }

  onRowCheckChange(event: any, idx: any) {
    this.mockintoSchedules[idx].checked = event;
    this.masterCheckbox = this.mockintoSchedules.every((item: any) => item.checked);
    this.someChecked = this.mockintoSchedules.filter((item: any) => item.checked);
  }

  resetSelection() {
    this.masterCheckbox = false;
    this.someChecked = [];
    this.mockintoSchedules.forEach((item: any) => item.checked = false);
  }

  onPageChange(event: any) {
    this.fetchAllMockintoSchedules(event.pageIndex, event.pageSize);
  }

}
