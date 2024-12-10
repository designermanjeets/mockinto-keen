import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SharedService } from '../services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;

  mockData = {
    "totalSchedules": 0,
    "totalResumes": 1,
    "activeSchedules": 0,
    "totalJobPostings": 100,
    "oldSchedules": 0,
    "subscription": null,
    "candidate": {
        "id": 4,
        "active": 1,
        "candidateEmail": "d@d.com",
        "candidatePhone": "3333333333",
        "createdDate": "2024-10-12T06:11:54.000+00:00",
        "deleted": 0,
        "lastUpdatedDate": "2024-10-12T18:38:32.000+00:00",
        "preferredTimezone": "EST",
        "resumeS3Path": "def",
        "updatedBy": 1
    }
  };

  dashboardData!: any;
  plansData: any[] = [];
  tenantId:any;

  jobProfiles: any = [];
  isLoaded = false;
  allMockintoHistory: any = [];

  constructor(
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
   
    this.tenantId = loggedInUser.tenant_id;
    if(Object.keys(loggedInUser).length === 0) {
      this.router.navigate(['/landing-page']);
    } else {
      this.fetchDashboardData();
      this.getConfig();
      this.getSubscription();
      this.fetchAlljobProfiles();
      this.fetchAllMockintoSchedules();
    }
  }

  fetchDashboardData() {
    this.sharedService.fetchDashboardData().subscribe(
      (data) => {
        if(!data) {
          // this.dashboardData = this.mockData;
        } else {
          this.dashboardData = data;
        }
        this.cdr.detectChanges();
      }
    );
  }


  getConfig(){
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.getConfigAll().subscribe(
      data => {
        if(data) {
         //this.plansData = data.filter((item:any) => item.category === 'plan');
         
         localStorage.setItem('general_config',JSON.stringify(data));
        }
      }
    ); 
  }

  getSubscription(){
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.getSubscriptionByTenantId(this.tenantId).subscribe(
      data => {
        if(data.length <= 0) {
          (Swal as any).fire({
            title: 'Warning',
            text: 'Some technical issue occur Please Contact Customer Support',
            icon: 'warning',
            confirmButtonText: "Ok",
          }).then((result: any) => {
            if(result.isConfirmed) {
              this.auth.logout();
            }
          });
        }
        else{
          localStorage.setItem('tenant_general_config',JSON.stringify(data[0]?.plan));

        }
      }
    ); 
  }

  getConfigByTenat(){
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.getTenantConfig(this.tenantId).subscribe(
      data => {
        if(data) {
          let paginationConfigue = data.filter((item:any) => item.category === 'pagination');
          let Userpalns= data.filter((item:any) => item.category === 'plan');
          localStorage.setItem('tenant_general_config',JSON.stringify(Userpalns));
          localStorage.setItem('pagination_general_config',JSON.stringify(paginationConfigue));
        }
      }
    ); 
  }

  goToMockintoSchedule() {
    this.router.navigateByUrl('/dashboard/mockinto-schedule');
    // this.sharedService.sendToRouterSubject.next('mockinto-schedule');
  }

  goToJobProfiles() {
    this.router.navigateByUrl('/dashboard/job-profile');
  }

  fetchAlljobProfiles(page = 0, size = 10) {
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.fetchAllJobProfiles(page, size).subscribe(
      data => {
        if(data) {
          this.jobProfiles = data.content;
          this.isLoaded = true;
        }
        this.sharedService.isLoadingSubject?.next(false);
        this.cdr.detectChanges();
      }
    );
  }

  fetchAllMockintoSchedules(page = 0, size = 10) {
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.fetchAllMockintoSchedules(0, page, size, 'id', 'ASC').subscribe(
      data => {
        if(data) {
          this.allMockintoHistory = data.content;
          this.allMockintoHistory = this.allMockintoHistory.filter((mockinto:any)=>mockinto.statusDescription === 'Ready')
        }
        this.sharedService.isLoadingSubject?.next(false);
        this.cdr.detectChanges();
      }
    );
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

  async openModal() {
    return await this.modalComponent.open();
  }
}
