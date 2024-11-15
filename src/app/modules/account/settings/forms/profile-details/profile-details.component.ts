import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SharedService } from 'src/app/pages/services/shared.service';

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

  private authLocalStorageToken = `auth-user`;

  constructor(
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService
  ) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    const loggedInUser = JSON.parse(localStorage.getItem(this.authLocalStorageToken) || '{}');
    console.log(loggedInUser);
    this.first_name = loggedInUser.candidates[0].first_name;
    this.last_name = loggedInUser.candidates[0].last_name;
    this.candidatePhone = loggedInUser.candidates[0].candidatePhone;
    this.candidateEmail = loggedInUser.candidates[0].candidateEmail;
    this.preferredTimezone = loggedInUser.candidates[0].preferredTimezone
  }

  saveSettings() {
    this.isLoading$.next(true);
    const payload = {
      first_name: this.first_name,
      last_name: this.last_name,
      candidatePhone: this.candidatePhone,
      candidateEmail: this.candidateEmail,
      preferredTimezone: this.preferredTimezone
    };

    this.sharedService.editProfile(payload).subscribe((res) => {
      if(res) {
        console.log('Profile updated successfully');
      }
    });

    setTimeout(() => {
      this.isLoading$.next(false);
      this.cdr.detectChanges();
    }, 1500);
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

  updatePreferredTimezone(event: any) {
    this.preferredTimezone = event;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
