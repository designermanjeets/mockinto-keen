import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(private fb: FormBuilder, private authService: AuthService,private router: Router) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    this.initForm();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.forgotPasswordForm.controls;
  }

  initForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
    });
  }

  submit() {
    this.isLoading$.next(true);
    const forgotPasswordSubscr = this.authService.forgotPassword(this.f.email.value).subscribe((res) => {
       //this.errorState = res ? ErrorStates.NoError : ErrorStates.HasError;
        if(res.success == false){
          
          (Swal as any ).fire({
            title: 'Warning',
            text: res?.data ? res?.data : 'Please enter the Correct email',
            icon: 'warning',
            showConfirmButton:"ok",
          });
          this.isLoading$.next(false);
        }
       else{
       
        Swal.fire({
          title: 'Success',
          text: 'Sent new Password Please check the entered email!',
          icon: 'success',
          timer: 4000,
          showConfirmButton: false,
        });
        this.isLoading$.next(false);
        this.router.navigate(['auth/login']); 
      }
     
       
    });
  
    this.unsubscribe.push(forgotPasswordSubscr);
  }
}
