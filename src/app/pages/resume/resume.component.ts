import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { MatDialog } from '@angular/material/dialog';

import * as bootstrap from 'bootstrap';
import * as Swal from 'sweetalert2';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit {

  resumes: any = [];
  origResumes: any = [];
  masterCheckbox: boolean = false;
  someChecked = [];

  fileName: any;
  resumeFile: any;

  indicatorprogress = false;
  isLoading$: Observable<boolean>;
  generalConfig:any[]=[];
  tenantGeneralConfig:any;
  resumeCount:any

  @ViewChild('addDialogTemplate', { static: true }) addDialogTemplate!: TemplateRef<any>;
  @ViewChild('previewResumeTemplate', { static: true }) previewResumeTemplate!: TemplateRef<any>;
  @ViewChild('fileUploadInput', { static: true }) fileUploadInput!: any;
  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;

  constructor(
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.sharedService.isLoading$;
    this.generalConfig = JSON.parse(localStorage.getItem('general_config') || '{}');
    this.tenantGeneralConfig = JSON.parse(localStorage.getItem('tenant_general_config') || '{}');
    const plan = this.generalConfig?.filter((x:any)=>x.type == this.tenantGeneralConfig?.name);
    const filterResumeCount = plan.filter(x=>x.configKey == "resumecount");
    this.resumeCount = Number(filterResumeCount[0]?.configValue)
    this.fetchAllResumes();
  }

  fetchAllResumes(page = 0, size = 10) {
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.fetchAllResumes(page, size).subscribe(
      data => {
        if(data) {
          this.paginator.length = data.totalElements;
          this.resumes = data.content;
          this.origResumes = JSON.parse(JSON.stringify(this.resumes));
        }
        this.resetSelection();
        this.sharedService.isLoadingSubject?.next(false);
        this.cdRef.detectChanges();
      }
    );
  }

  previewResume(resume: any) {
    this.sharedService.previewResume(resume.id).subscribe(
      result => {
        const { filename, data } = result;
        this.previewResumeDialog(filename, data);
      }
    );
  }

  deleteResume(resume: any) {
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
        const resumes = [resume].map((item: any) => {
          return { id: item.id };
        });
        this.sharedService.deleteResume(resumes).subscribe(
          data => {
            this.fetchAllResumes();
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
        const resumes_filter = this.resumes.filter((item: any) => item.checked);
        const resumes = resumes_filter.map((item: any) => {
          return { id: item.id };
        });
        this.sharedService.deleteResume(resumes).subscribe(
          data => {
            this.fetchAllResumes();
          }
        );
      }
    });
  }

  addResumeDialog() {
  if(this.resumeCount == this.resumes.length){
    (Swal as any).fire({
      title: "Resume Limit Reached", 
      text: "You have reached the maximum number of resumes. Please buy a subscription to add more resumes.", 
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
       console.log("click subscr")
       this.router.navigate(['dashboard/mockinto-plan']);
      }
    });
  }

  else{
    const dialogRef = this.dialog.open(this.addDialogTemplate, {
      data: { },
    });

    dialogRef.afterOpened().subscribe(() => {
      this.fileName = '';
      this.resumeFile = '';
      if(this.fileUploadInput) {
        this.fileUploadInput.nativeElement.value = '';
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  }
  

  closeDialog() {
    this.dialog.closeAll();
  }

  previewResumeDialog(filename: string, data: any) {
    // Convert the response to a Blob
    const blob = new Blob([data], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);
    // Create a URL for the Blob
    const resume = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    const dialogRef = this.dialog.open(this.previewResumeTemplate, {
      data: { filename, resume },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  onFileChange(event: any) {
    this.resumeFile = event.target.files[0];
    this.sharedService.showToaster();
  }

  uploadResume() {
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.uploadResume(this.resumeFile).subscribe(
      data => {
        this.fileName = '';
        this.resumeFile = '';
        if(this.fileUploadInput) {
          this.fileUploadInput.nativeElement.value = '';
        }
        this.fetchAllResumes();
        this.closeDialog();
      }
    );
  }

  onMasterChange(event: any) {
    this.masterCheckbox = event;
    this.resumes.forEach((item: any) => item.checked = event);
    this.someChecked = this.resumes.filter((item: any) => item.checked);
  }

  onRowCheckChange(event: any, idx: any) {
    this.resumes[idx].checked = event;
    this.masterCheckbox = this.resumes.every((item: any) => item.checked);
    this.someChecked = this.resumes.filter((item: any) => item.checked);
  }

  resetSelection() {
    this.masterCheckbox = false;
    this.resumes.forEach((item: any) => item.checked = false);
    this.someChecked = [];
  }

  onPageChange(event: any) {
    console.log('event', event);
    this.fetchAllResumes(event.pageIndex, event.pageSize);
  }

  searchResume(event: any) {
    const value = event.target.value;
    this.sharedService.isLoadingSubject?.next(true);
    if(value) {
      this.resumes = this.origResumes.filter((item: any) => {
        return item.name.toLowerCase().includes(value.toLowerCase());
      });
    } else {
      this.resumes = JSON.parse(JSON.stringify(this.origResumes));
    }
    this.sharedService.isLoadingSubject?.next(false);
  }

}
