import { Component, OnInit, OnDestroy, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmPasswordValidator } from './confirm-password.validator';
import { UserModel } from '../../models/user.model';
import { first } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { SharedService } from 'src/app/pages/services/shared.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  hasError: boolean;
  isLoading$: Observable<boolean>;
  selectedPlan: string;
  regError: string;
  passwordMismatch: boolean = false;


  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  logginInUser = JSON.parse(localStorage.getItem('auth-user') || '{}') as UserModel;
  @ViewChild('termsDialogTemplate', { static: true }) termsDialogTemplate!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,

  ) {
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params.plan) {
        this.selectedPlan = params.plan;
      }
    });
  }

  signIn() {
    if(this.selectedPlan) {
      this.router.navigate(['/auth/login'], {
        queryParams: { plan: this.selectedPlan },
      });
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registrationForm.controls;
  }

  initForm() {
    this.registrationForm = this.fb.group(
      {
        first_name: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
            Validators.pattern('^[a-zA-Z ]*$')
          ]),
        ],
        last_name: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
            Validators.pattern('^[a-zA-Z ]*$')
          ]),
        ],
        user_email: [
          '',
          Validators.compose([
            Validators.required,
            Validators.email,
            Validators.minLength(3),
            Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
          ]),
        ],
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        confirmPassword: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        isAgreed: [false],
      },
      {
        validator: ConfirmPasswordValidator.MatchPassword,
      }
    );
  }

  submit() {
    this.hasError = false;
    const data: { [key: string]: string; } = {};
    
    Object.keys(this.f).forEach((key) => { data[key] = this.f[key].value });

    let payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      password: data.password,
      confirmPassword: data.password,
      isAgreed: data.isAgreed,
      candidates: [
        {
          active: "1",
          candidateEmail: data.user_email,
          candidatePhone: "",
          deleted: "0",
          preferredTimezone: "CST",
          resumeS3Path: null,
          updatedBy: "1",
        }
      ],
      active: 1,
      deleted: 0,
      updated_by: "1",
      roles: [ { role: "admin" } ],
      enabled: 1,
      username: data.username,
      user_email: data.user_email,
      accountNonExpired: true,
      accountNonLocked: true,
      credentialsNonExpired: true
    } as UserModel | any;

    const registrationSubscr = this.authService
      .registration(payload)
      .pipe(first())
      .subscribe((user: UserModel) => {
        if (user) {
          // if(this.selectedPlan && this.selectedPlan !== 'starter') {
          //   this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: this.selectedPlan } });
          // } else {
          //   this.router.navigate(['/']);
          // }
          if(this.selectedPlan == undefined){
            this.selectedPlan = 'starter'
          }
          if(this.selectedPlan){
            const backendPayload = {
              plan: {
                id: 9, //this.selectedPlan.id,
              },
              tenant: {
              id: user.tenant_id
            },
              startDate: new Date().toISOString(),
              status:  true,
              deleted: 0,
              endDate: new Date().toISOString(),
              lastPaymentDate: new Date().toISOString(),
              lastPaymentAmount: 0,
              renewalDate: new Date().toISOString(),
              futureDiscount: 0,
            };
            this.updateBackendForPlanChange(backendPayload);

          }
        } else {
          this.hasError = true;
          //this.regError = user.error.data;
        } 
      }, error => {
        this.hasError = true;
        this.regError = error.data;
      });
    this.unsubscribe.push(registrationSubscr);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }


  checkPasswordsMatch(event: any): void {
   this.registrationForm.get('confirmPassword')?.value
    this.passwordMismatch = this.registrationForm.get('password')?.value !== this.registrationForm.get('confirmPassword')?.value;
  }

  updateBackendForPlanChange(updateBackendForPlanChange: any) {
    this.sharedService.updateBackendForPlanChange(updateBackendForPlanChange).subscribe((res:any) => {
      if(res) {
        (Swal as any).fire({
          icon: 'success',
          title: 'Success',
          text: 'Registration successful.',
        }).then(() => {
          this.router.navigate(['/']);
        });
      } else {
        (Swal as any).fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong. Please try again later.',
        }).then(() => {
          this.router.navigate(['/landing-page']);
        });
      }
    });
    
  }

  openTerms(event: Event) {
    event.preventDefault();
    const dialogRef = this.dialog.open(this.termsDialogTemplate, {
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

}
