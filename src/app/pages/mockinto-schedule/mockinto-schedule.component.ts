import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { MatDialog } from '@angular/material/dialog';

import * as Swal from 'sweetalert2';
import * as moment from 'moment';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map, Observable, startWith } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMatDatetimepicker, NgxMatTimepickerComponent } from '@angular-material-components/datetime-picker';

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
  generalConfig:any[]=[];
  tenantGeneralConfig:any;
  scheduleCount :any;
  scheduleStatusId:any;

  @ViewChild('addDialogTemplate', { static: true }) addDialogTemplate!: TemplateRef<any>;
  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;

  // Picker
  @ViewChild('picker') picker: NgxMatDatetimepicker<any>;
  public date: moment.Moment;
  public enableMeridian = false;
  public minDate = new Date(Date.now());
  public maxDate: moment.Moment;
  public dateControl = new FormControl(new Date());
  public timeControlMinMax = new FormControl(new Date());
  private intervalId: any;
  allReadySchedule:any


  origSchedules: any = [];

  constructor(
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.sharedService.isLoading$;
    this.generalConfig = JSON.parse(localStorage.getItem('general_config') || '{}');
    this.tenantGeneralConfig = JSON.parse(localStorage.getItem('tenant_general_config') || '{}');
    const plan = this.generalConfig?.filter((x:any)=>x.type == this.tenantGeneralConfig?.name);
    const filterScheduleCount = plan.filter(x=>x.configKey == "mockinterviewcount");
    this.scheduleCount = Number(filterScheduleCount[0]?.configValue)
    this.fetchAllMockintoSchedules();
    this.fetchJobProfiles();
    this.fetchAllResumes();
    this.intervalId = setInterval(() => {
      if(!this.allReadySchedule)
      this.fetchAllMockintoSchedules();
    }, 20000);  
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
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
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.fetchAllMockintoSchedules(0, page, size, 'id', 'ASC').subscribe(
      data => {
        if(data) {
          this.paginator.length = data.totalElements;
          this.mockintoSchedules = data.content;
          this.origSchedules = JSON.parse(JSON.stringify(this.mockintoSchedules));
         this.allReadySchedule = this.mockintoSchedules.every((schedule:any) => schedule.statusDescription === 'Ready');
        }
        this.resetSelection();
        this.sharedService.isLoadingSubject?.next(false);
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
        this.sharedService.deleteMockintoScheduleBulk([{ id: profile?.id }]).subscribe(
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
          return { id: item?.id };
        });
        this.sharedService.deleteMockintoScheduleBulk(profiles).subscribe(
          data => {
            this.fetchAllMockintoSchedules();
          }
        );
      }
    });
  }

  editMockintoSchedule(mockscheduledata?: any) {
    const dialogRef = this.dialog.open(this.addDialogTemplate, {
      data: { mockscheduledata },
    });

    dialogRef.afterOpened().subscribe(result => {
      this.mockJobProfile = mockscheduledata.jobPostingId;
      this.mockResume = mockscheduledata?.resumeId;
      this.dateControl.patchValue(new Date(mockscheduledata?.scheduleStartDate));
      this.cdRef.detectChanges();
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  addMockintoScheduleDialog() {
    if(this.mockintoSchedules.length == this.scheduleCount) {
        (Swal as any).fire({
        title: "Mockinto Schedule Limit Reached", 
        text: "You have reached the maximum number of Mockinto Schedule. Please buy a subscription to add more Mockinto Schedule.", 
        icon: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: "Go to Subscription",
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-active-light"
        }
      }).then((result: any) => {
        if(result.isDismissed) {
          return;
        }
        if(result.isConfirmed) {
        this.router.navigate(['dashboard/mockinto-plan']);
        }
      });
    } else {
      const dialogRef = this.dialog.open(this.addDialogTemplate, {
        data: { },
      });

      dialogRef.afterOpened().subscribe(result => {
        const newDate = new Date();
        this.mockResume = "";
        this.mockJobProfile = "";
        newDate.setMinutes(newDate.getMinutes() + 31);
        this.dateControl.patchValue(newDate);
        this.dateControl.valueChanges.subscribe((value) => {
          if (value) {
            const currentTime = new Date();
            const givenTime = new Date(value);
            const timeDifference = (givenTime.getTime() - currentTime.getTime()) / (1000 * 60); // Difference in minutes
            if (timeDifference >= 30) {
              // Proceed with your logic
            } else {
              // Show error
              (Swal as any).fire({
                icon: 'error',
                title: 'Oops...',
                text: 'The time should be at least 30 minutes from now!',
              }).then((result: any) => {
                const newDate = new Date();
                newDate.setMinutes(newDate.getMinutes() + 31);
                this.dateControl.patchValue(newDate);
              });
            }
          }
          this.cdRef.detectChanges();
        });
      });

      dialogRef.afterClosed().subscribe(result => {
      });
    }
  }
  
  closeDialog() {
    this.dialog.closeAll();
  }

  startMockintoSchedule(schedule: any) {
    (Swal as any).fire({
      text: "Are you sure you would like to Start? This will start the Mock Interview and the minutes will start counting down.",
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Yes, Start it!",
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
        this.router.navigate([`/dashboard/mockinto-live/${schedule?.id}`]);
      }
    });
  }

  addUpdateMockintoSchedule(patchValue?: any) {
    this.sharedService.isLoadingSubject?.next(true);
    const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
    if(patchValue) {
      const payload = Object.assign({},
        {
          "id": patchValue.id,
          "active": 1,
          "deleted": 0,
          "interviewPeriodMinutes": 0,
          "scheduleStartDate": moment(this.dateControl.value).toISOString(),
          "scheduleStatusId": 0,
          "updatedBy": 0,
          "jobPosting": {
              "id": this.mockJobProfile,
              "active": 1,
              "deleted": 0,
              "updatedBy": 0,
              "tenant": {
                  "id": loggedInUser.tenant_id
              }
          },
          "resume": {
              "id": this.mockResume
          }
        }
      );
      const cleanedData = this.removeCircularReferences(payload);
      this.sharedService.updateMockintoSchedule(cleanedData).subscribe(data => {
        if(data) {
          this.sharedService.isLoadingSubject?.next(false);
          this.closeDialog();
          this.fetchAllMockintoSchedules();
        }
      });
    } else {
      const payload = {
        "active": 1,
        "deleted": 0,
        "interviewPeriodMinutes": 0,
        "scheduleStartDate": moment(this.dateControl.value).toISOString(),
        "scheduleStatusId": 0,
        "updatedBy": 0,
        "jobPosting": {
            "id": this.mockJobProfile,
            "active": 1,
            "deleted": 0,
            "updatedBy": 0,
            "tenant": {
                "id": loggedInUser.tenant_id
            }
        },
        "resume": {
            "id": this.mockResume
        }
      };
      this.sharedService.addMockintoSchedule(payload).subscribe(data => {
        if(data) {
          this.sharedService.isLoadingSubject?.next(false);
          this.closeDialog();
          this.fetchAllMockintoSchedules();
        }
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
    this.mockintoSchedules?.forEach((item: any) => item.checked = false);
  }

  onPageChange(event: any) {
    this.fetchAllMockintoSchedules(event.pageIndex, event.pageSize);
  }

  scheduleSearch(event: any) {
    this.sharedService.isLoadingSubject?.next(true);
    const searchValue = event.target.value;
    if(searchValue) {
      this.mockintoSchedules = this.origSchedules.filter((item: any) => {
        return item.jobHeader.toLowerCase().includes(searchValue.toLowerCase()) || item.jobDescription.toLowerCase().includes(searchValue.toLowerCase());
      });
    } else {
      this.mockintoSchedules = JSON.parse(JSON.stringify(this.origSchedules));
    }
    this.sharedService.isLoadingSubject?.next(false);
  }

}
