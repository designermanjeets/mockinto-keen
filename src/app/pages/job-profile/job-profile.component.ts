import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { MatDialog } from '@angular/material/dialog';

import * as Swal from 'sweetalert2';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map, Observable, startWith } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-profile',
  templateUrl: './job-profile.component.html',
  styleUrls: ['./job-profile.component.scss']
})
export class JobProfileComponent implements OnInit {

  jobProfiles: any = [];
  origJobProfiles: any = [];
  masterCheckbox: boolean = false;
  someChecked = [];
  maxWords: number = 300; // Define the maximum word limit
  remainingWords: number = this.maxWords;

  jobName: any;
  jobDescription: any;

  indicatorprogress = false;
  isLoading$: Observable<boolean>;
  tenantGeneralConfig: any;
  generalConfig: any[] = [];
  jobCount: any;

  @ViewChild('addDialogTemplate', { static: true }) addDialogTemplate!: TemplateRef<any>;
  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredFruits: Observable<string[]>;
  tenantId: any;
  fruits: string[] = [];
  allFruits: string[] = ['Java', 'Python', 'React', 'Angular'];
  fruitCtrl = new FormControl('');
  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);
  maxCharacters: number = 3000;
  remainingCharacters: number = this.maxCharacters;
  constructor(
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allFruits.slice())),
    );
  }

  ngOnInit(): void {
    this.isLoading$ = this.sharedService.isLoading$;
    const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
    this.tenantId = loggedInUser.tenant_id;

    this.getSubscription()
    
  }





  getSubscription(){
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.getSubscriptionByTenantId(this.tenantId).subscribe(
      data => {
        if(data.length <= 0) {
          console.log("No Subscription");
        }
        else{
          const data_ = data[data.length - 1]?.plan
          console.log("genral_config_data",data_)
          localStorage.setItem('tenant_general_config',JSON.stringify(data[data.length - 1]?.plan));
          this.tenantGeneralConfig = data_
          this.generalConfig = JSON.parse(localStorage.getItem('general_config') || '{}');

          const plan = this.generalConfig?.filter((x: any) => x.type == this.tenantGeneralConfig?.name);
          const filterJobCount = plan.filter(x => x.configKey == "jobdescription")
          this.jobCount = Number(filterJobCount[0]?.configValue)
          this.fetchAlljobProfiles();
          console.log('jobcount',this.jobCount);
          
          localStorage.setItem('peviousPlan',JSON.stringify(data[data.length - 1]?.plan?.name));

        }
      }
    ); 
  }

  fetchAlljobProfiles(page = 0, size = 10) {
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.fetchAllJobProfiles(page, size).subscribe(
      data => {
        if (data) {
          this.paginator.length = data.totalElements;
          this.jobProfiles = data.content;
          console.log('job profiles---->',this.jobProfiles);
          this.origJobProfiles = JSON.parse(JSON.stringify(this.jobProfiles));
        }
        this.resetSelection();
        this.sharedService.isLoadingSubject?.next(false);
        this.cdRef.detectChanges();
      }
    );
  }

  deleteJobProfile(profile: any) {
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
      if (result.isDismissed) {
        return;
      }
      if (result.isConfirmed) {
        this.sharedService.deleteJobProfile(profile).subscribe(
          data => {
            this.fetchAlljobProfiles();
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
      if (result.isDismissed) {
        return;
      }
      if (result.isConfirmed) {
        const profiles_filter = this.jobProfiles.filter((item: any) => item.checked);
        const profiles = profiles_filter.map((item: any) => {
          return { id: item.id };
        });
        this.sharedService.deleteJobProfileBulk(profiles).subscribe(
          data => {
            this.fetchAlljobProfiles();
          }
        );
      }
    });
  }

  editJobProfile(jobdescription: any) {
    const dialogRef = this.dialog.open(this.addDialogTemplate, {
      data: { jobdescription },
    });

    dialogRef.afterOpened().subscribe(result => {
      this.jobName = jobdescription.jobHeader;
      this.jobDescription = jobdescription.jobDescription;
      this.fruits = jobdescription.jobTags?.split(',') || [];
      this.cdRef.detectChanges();
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  addJobDescriptionDialog() {
    if (this.jobProfiles.length == this.jobCount) {
      (Swal as any).fire({
        title: "Job Limit Reached",
        text: "You have reached the maximum number of Job. Please buy a subscription to add more Job.",
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
        if (result.isDismissed) {
          return;
        }
        if (result.isConfirmed) {
          this.router.navigate(['dashboard/mockinto-plan']);
        }
      });
    }
    else {
      const dialogRef = this.dialog.open(this.addDialogTemplate, {
        data: {},
      });

      dialogRef.afterOpened().subscribe(result => {
        this.jobName = '';
        this.jobDescription = '';
        this.fruits = [];
        this.fruitInput.nativeElement.value = '';
        this.fruitCtrl.setValue(null);
        this.cdRef.detectChanges();
      });

      dialogRef.afterClosed().subscribe(result => {
      });
    }
  }

  updateRemainingCharacters() {
    const wordCount = this.jobDescription 
    ? this.jobDescription.trim().split(/\s+/).length 
    : 0;

  // Calculate remaining words
  this.remainingWords = Math.max(this.maxWords - wordCount, 0);

  // Optional: truncate the description if it exceeds the word limit
  if (wordCount > this.maxWords) {
    const wordsArray = this.jobDescription.trim().split(' ').slice(0, this.maxWords);
    this.jobDescription = wordsArray.join(' ');
  }
  }


  closeDialog() {
    this.dialog.closeAll();
  }

  addUpdatejobDescription(patchValue?: any) {
    const tags = this.fruits?.map((item: any) => item).join(',');
    const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
    this.sharedService.isLoadingSubject?.next(true);
    if (Object.keys(patchValue).length !== 0 && patchValue.constructor === Object) {
      const payload = {
        ...patchValue.jobdescription,
        "jobHeader": this.jobName,
        "jobDescription": this.jobDescription,
        "jobTags": tags
      }
      this.sharedService.updateJobProfile(payload).subscribe(
        data => {
          if (data) {
            this.sharedService.isLoadingSubject?.next(false);
            this.closeDialog();
            this.fetchAlljobProfiles();
          }
        }
      );
    } else {
      const payload = {
        "jobHeader": this.jobName,
        "jobDescription": this.jobDescription,
        "active": "1",
        "deleted": "0",
        "updatedBy": "0",
        "jobTags": tags,
        "tenant": {
          "id": loggedInUser.tenant_id
        }
      };
      this.sharedService.addJobProfile(payload).subscribe(
        data => {
          if (data) {
            this.sharedService.isLoadingSubject?.next(false);
            this.closeDialog();
            this.fetchAlljobProfiles();
          }
        }
      );
    }
  }

  onMasterChange(event: any) {
    this.masterCheckbox = event;
    this.jobProfiles.forEach((item: any) => item.checked = event);
    this.someChecked = this.jobProfiles.filter((item: any) => item.checked);
  }

  onRowCheckChange(event: any, idx: any) {
    this.jobProfiles[idx].checked = event;
    this.masterCheckbox = this.jobProfiles.every((item: any) => item.checked);
    this.someChecked = this.jobProfiles.filter((item: any) => item.checked);
  }

  resetSelection() {
    this.masterCheckbox = false;
    this.someChecked = [];
    this.jobProfiles.forEach((item: any) => item.checked = false);
  }

  onPageChange(event: any) {
    this.fetchAlljobProfiles(event.pageIndex, event.pageSize);
  }

  add(event: MatChipInputEvent): void {

    console.log("adding", this.fruits);
    const value = (event.value || '').trim();
    if (value && !this.fruits.some(fruit => fruit.toLowerCase() === value.toLowerCase())) {
      this.fruits.push(value);
    }
    event.chipInput!.clear();
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);

      // Optionally announce the removed value
      // this.announcer.announce(`Removed ${fruit}`);
    }
  }


  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedValue = event.option.viewValue;

    if (!this.fruits.includes(selectedValue)) {
      this.fruits.push(selectedValue);
      console.log('Selected event:', event);
    } else {
      console.log('Duplicate value not added:', selectedValue);
    }

    // Clear the input and reset the form control
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }

  searchJobProfile(event: any) {
    const value = event.target.value;
    this.sharedService.isLoadingSubject?.next(true);
    if (value) {
      this.jobProfiles = this.origJobProfiles.filter((item: any) => {
        return item.jobHeader.toLowerCase().includes(value.toLowerCase());
      });
    } else {
      this.jobProfiles = JSON.parse(JSON.stringify(this.origJobProfiles));
    }
    this.sharedService.isLoadingSubject?.next(false);
  }

}
