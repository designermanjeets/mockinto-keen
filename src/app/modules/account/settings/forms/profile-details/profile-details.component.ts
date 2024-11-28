import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { SharedService } from 'src/app/pages/services/shared.service';
import * as Swal from 'sweetalert2';


interface Payload {
  first_name: string;
  last_name: string;
  user_email: string;
  preferredTimezone: string;
  password?: string;
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
  passwordMismatch: boolean = false;



  private authLocalStorageToken = `auth-user`;

  constructor(
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
    private auth: AuthService,

  ) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    this.getCandidateDetails();
  }


  getCandidateDetails(){
    const loggedInUser = JSON.parse(localStorage.getItem(this.authLocalStorageToken) || '{}');
        if(loggedInUser) {
          this.first_name = loggedInUser.firstName;
          this.last_name = loggedInUser.lastName;
          this.candidatePhone = loggedInUser.candidates[0].candidatePhone;
          this.candidateEmail = loggedInUser.candidates[0].candidateEmail;
          this.preferredTimezone = loggedInUser.candidates[0].preferredTimezone;
        } 
       this.cdr.detectChanges();
      
  }

 

  saveSettings() {
    this.isLoading$.next(true);
    const payload: Payload = {
      first_name: this.first_name,
      last_name: this.last_name,
      user_email: this.candidateEmail,
      preferredTimezone: this.preferredTimezone
    };
    if (this.candidatePassword && this.confirmPassword) {
      payload.password = this.candidatePassword;

    }

    this.sharedService.editProfile(payload).subscribe((res) => {
      if(res) {
       
      }
    });

    setTimeout(() => {
      this.isLoading$.next(false);
      this.cdr.detectChanges();
    }, 1500);
  }

  checkPasswordsMatch(): void {
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
  }

  updatePreferredTimezone(event: any) {
    this.preferredTimezone = event;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
