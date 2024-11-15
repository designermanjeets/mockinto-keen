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

@Component({
  selector: 'app-job-profile',
  templateUrl: './job-profile.component.html',
  styleUrls: ['./job-profile.component.scss']
})
export class JobProfileComponent implements OnInit {

  jobProfiles: any = [];
  masterCheckbox: boolean = false;
  someChecked = [];

  jobName: any;
  jobDescription: any;

  indicatorprogress = false;
  isLoading$: Observable<boolean>;

  @ViewChild('addDialogTemplate', { static: true }) addDialogTemplate!: TemplateRef<any>;
  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredFruits: Observable<string[]>;
  fruits: string[] = [];
  allFruits: string[] = ['Java', 'Python', 'React', 'Angular'];
  fruitCtrl = new FormControl('');
  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);

  constructor(
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allFruits.slice())),
    );
  }

  ngOnInit(): void {
    this.isLoading$ = this.sharedService.isLoading$;
    this.fetchAlljobProfiles();
  }

  fetchAlljobProfiles(page = 0, size = 10) {
    this.sharedService.isLoadingSubject.next(true);
    this.sharedService.fetchAllJobProfiles(page, size).subscribe(
      data => {
        if(data) {
          this.paginator.length = data.totalElements;
          this.jobProfiles = data.content;
        }
        this.resetSelection();
        this.sharedService.isLoadingSubject.next(false);
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
      if(result.isDismissed) {
        return;
      }
      if(result.isConfirmed) {
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
      if(result.isDismissed) {
        return;
      }
      if(result.isConfirmed) {
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
    console.log('editJobProfile', jobdescription);
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
      console.log('The dialog was closed');
    });
  }

  addJobDescriptionDialog() {
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

  addUpdatejobDescription(patchValue?: any) {
    const tags = this.fruits?.map((item: any) => item).join(',');
    this.sharedService.isLoadingSubject.next(true);
    if(Object.keys(patchValue).length !== 0 && patchValue.constructor === Object) {
      const payload = {
        ...patchValue.jobdescription,
        "jobHeader": this.jobName,
        "jobDescription": this.jobDescription,
        "jobTags": tags
      }
      this.sharedService.updateJobProfile(payload).subscribe(
        data => {
          if(data) {
            this.sharedService.isLoadingSubject.next(false);
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
            "id": "1"
        }
      };
      this.sharedService.addJobProfile(payload).subscribe(
        data => {
          if(data) {
            this.sharedService.isLoadingSubject.next(false);
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

  // Chips AutoComplete
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    // this.fruitCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);

      // this.announcer.announce(`Removed ${fruit}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }

}
