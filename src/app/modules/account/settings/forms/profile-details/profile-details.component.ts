import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { SharedService } from 'src/app/pages/services/shared.service';
import * as Swal from 'sweetalert2';

interface Payload {
  first_name: string;
  last_name: string;
  password?: string;
  user_email:string;
  active:boolean;
  deleted:boolean;
}




@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
})


export class ProfileDetailsComponent implements OnInit, OnDestroy {

  

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];




  first_name: string = '';
  last_name: string = '';
  candidatePhone: string = '';
  candidateEmail: string = '';
  preferredTimezone: string = '';
  candidatePassword: string = '';
  confirmPassword: string = '';
  planName!:any;
  planPrice!:any;
  totaltime:any;
  candidateId = JSON.parse(localStorage.getItem('candidateId') || '1');
  tenantId:any;
  tenantGeneralConfig:any;
  generalConfig:any[]=[];
  timeleft!:any;
  timespent:any;


  passwordMismatch: boolean = false;
  logginInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
  private authLocalStorageToken = `auth-user`;
  authUser = JSON.parse(localStorage.getItem(this.authLocalStorageToken) || '{}');

  constructor(
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
    private auth: AuthService,
    private router: Router

  ) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    
    this.fetchTotalTimeSpend();
    
    this.getCandidateDetails();
    this.first_name = this.authUser.firstName;
    this.last_name = this.authUser.lastName;
    const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
    this.tenantId = loggedInUser.tenant_id;
    this.fetchDashboardData();
    this.getSubscription();
  }

  fetchTotalTimeSpend() {
    this.sharedService.totalTimeSpend(this.candidateId).subscribe(
      data => {
        this.timespent = data;
        if(data) {
          this.timespent = data;
        }
      }
    );
  }

  getSubscription(){
    // this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.getSubscriptionByTenantId(this.tenantId).subscribe(
      data => {
        if(data.length <= 0) {
          console.log("No Subscription");
        }
        else{
          const data_ = data[data.length - 1]?.plan
          
          localStorage.setItem('tenant_general_config',JSON.stringify(data[data.length - 1]?.plan));
          this.tenantGeneralConfig = data_
          this.generalConfig = JSON.parse(localStorage.getItem('general_config') || '{}');
          const plan = this.generalConfig?.filter((x: any) => x.type == this.tenantGeneralConfig?.name);     
          const filterJobCount = plan.filter(x => x.configKey == "totalAllowedTimeinMins");
          this.totaltime = Number(filterJobCount[0]?.configValue)
          
          localStorage.setItem('peviousPlan',JSON.stringify(data[data.length - 1]?.plan?.name));
          this.setTimeLeft();
        }
      }
    ); 
}


  setTimeLeft(){
    
    this.timeleft = this.totaltime - this.timespent;

    this.cdr.detectChanges();
  }







  
  fetchDashboardData() {
    this.sharedService.fetchDashboardData().subscribe(
      (data) => {
        if(!data) {
        } else {
          
          this.planName = data?.subscription[data?.subscription.length -1]?.plan?.name;
          this.planPrice =data?.subscription[data?.subscription.length -1]?.plan?.price;
          this.cdr.detectChanges();
          // localStorage.setItem('mockintoSubscriptionId', JSON.stringify(data?.subscription[data?.subscription.length -1]?.id));
          // localStorage.setItem("stripeCustomerId",JSON.stringify(data?.subscription[data?.subscription.length -1]?.tenant?.stripeCustomer?.stripeCustomerId))
          // localStorage.setItem("stripeSubscriptionId",JSON.stringify(data?.subscription[data?.subscription.length -1]?.stripeSubscriptionId))
          //this.getPaymentSubscriptionall(data?.subscription[data?.subscription.length -1]?.id);
        }
      }
    );
  }


  getCandidateDetails(){
    this.sharedService.getCandidateDetails().subscribe((res) => {
      if(res) {
        this.candidatePhone = res.candidatePhone;
        this.candidateEmail = res.candidateEmail;
        this.preferredTimezone = res.preferredTimezone;
        this.cdr.markForCheck();
      }
    });      
  }


  updatePlan(){
    this.router.navigate(['/dashboard/mockinto-plan']);
  }

  saveSettings() {

    if(this.passwordMismatch || !this.first_name || !this.last_name) {
      (Swal as any).fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }

    this.isLoading$.next(true);
    const payload: Payload = {
      first_name: this.first_name,
      last_name: this.last_name,
      user_email: this.candidateEmail,
      active: true,
      deleted: false
      //password: this.candidatePassword,
    };
    if (this.candidatePassword && this.confirmPassword) {
      payload.password = this.candidatePassword;
    }

    this.sharedService.editProfile(payload).subscribe((res) => {
      if(!res.error){
        if (this.authUser) {
          this.authUser.firstName = this.first_name;
          this.authUser.lastName = this.last_name;
          localStorage.setItem('auth-user', JSON.stringify(this.authUser));
        }
        (Swal as any).fire({
          title: 'Success!',
          text: 'Profile updated successfully',
          icon: 'success',
          confirmButtonText: 'Ok'
        }).then(() => {
          this.isLoading$.next(false);
          this.cdr.detectChanges();
        });
      } else {
        (Swal as any).fire({
          title: 'Error!',
          text: res.error.data,
          icon: 'error',
          confirmButtonText: 'Ok'
        }).then(() => {
          this.isLoading$.next(false);
          this.cdr.detectChanges();
        });
      }
      if(res) {
      
        if(payload.password){
          (Swal as any).fire({
            title: 'Warning!',
            text: "Please Login New Credentials",
            icon: "warning",
            buttonsStyling: false,
            confirmButtonText: "Logout",
            customClass: {
              confirmButton: "btn btn-primary",
             
            }
          }).then((result: any) => {
            if(result.isConfirmed) {
              this.auth.logout();
            }
            else{
              this.auth.logout();
            }
          });
          
        }
       
      }
    });
  }



  changePassword() {

    if(this.passwordMismatch || !this.first_name || !this.last_name || !this.candidatePassword || !this.confirmPassword) {
      (Swal as any).fire({
        title: 'Error!',
        text: 'Please fill password and confirm password fields',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }

    this.isLoading$.next(true);
    const payload: Payload = {
      first_name: this.first_name,
      last_name: this.last_name,
      user_email: this.candidateEmail,
      active: true,
      deleted: false,
      password: this.candidatePassword,
    };
   

    this.sharedService.editProfile(payload).subscribe((res) => {
      if(!res.error){
        if (this.authUser) {
          this.authUser.firstName = this.first_name;
          this.authUser.lastName = this.last_name;
          localStorage.setItem('auth-user', JSON.stringify(this.authUser));
        }
        (Swal as any).fire({
          title: 'Success!',
          text: 'Profile updated successfully',
          icon: 'success',
          confirmButtonText: 'Ok'
        }).then(() => {
          this.isLoading$.next(false);
          this.cdr.detectChanges();
        });
      } else {
        (Swal as any).fire({
          title: 'Error!',
          text: res.error.data,
          icon: 'error',
          confirmButtonText: 'Ok'
        }).then(() => {
          this.isLoading$.next(false);
          this.cdr.detectChanges();
        });
      }
      if(res) {
       
        if(payload.password){
          (Swal as any).fire({
            title: 'Warning!',
            text: "Please Login New Credentials",
            icon: "warning",
            buttonsStyling: false,
            confirmButtonText: "Logout",
            customClass: {
              confirmButton: "btn btn-primary",
             
            }
          }).then((result: any) => {
            if(result.isConfirmed) {
              this.auth.logout();
            }
            else{
              this.auth.logout();
            }
          });    
        }      
      }
    });
  }

  checkPasswordsMatch(event: any): void {
    this.confirmPassword = event;
    this.passwordMismatch = this.candidatePassword !== this.confirmPassword;
  }

  updateFirstName(event: any) {
    this.first_name = event;
  }

  updateLastName(event: any) {
    this.last_name = event;
  }

  updateCandidatePhone(event: any) {
    this.candidatePhone = event;
  }

  updateCandidateEmail(event: any) {
    this.candidateEmail = event;
  }

  updatePassword(event: any) {
    this.candidatePassword = event;
    //this.passwordMismatch = this.candidatePassword !== this.confirmPassword;
  }

  updatePreferredTimezone(event: any) {
    this.preferredTimezone = event;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
