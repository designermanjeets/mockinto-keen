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
  passwordMismatch: boolean = true;

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
    this.sharedService.getCandidateDetails().subscribe((res) => {
      if(res) {
        this.first_name = res.first_name;
        this.last_name = res.last_name;
        this.candidatePhone = res.candidatePhone;
        this.candidateEmail = res.candidateEmail;
        this.preferredTimezone = res.preferredTimezone;
        this.cdr.markForCheck();
      }
    });      
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
      password: this.candidatePassword,
    };
    if (this.candidatePassword && this.confirmPassword) {
      payload.password = this.candidatePassword;
    }

    this.sharedService.editProfile(payload).subscribe((res) => {
      if(!res.error){
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
    this.passwordMismatch = this.candidatePassword !== this.confirmPassword;
  }

  updatePreferredTimezone(event: any) {
    this.preferredTimezone = event;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
