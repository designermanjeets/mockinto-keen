import { Component, OnInit, OnDestroy, ChangeDetectorRef, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription, Observable } from 'rxjs';
import { UserModel } from '../../models/user.model';
import Swal from 'sweetalert2';
import { SharedService } from 'src/app/pages/services/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { StripeMockintoService } from 'src/app/pages/services/stripe.service';


@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
})
export class VerifyComponent implements OnInit {
    logError = '';
    otpForm: FormGroup;
    otpArray = new Array(6).fill('');
    isSubmitting = false; // Loader state for submit button
    isResendDisabled = true; // Disable resend button initially
    countdown = 120; // 2-minute timer
    verify_email = JSON.parse(localStorage.getItem('verify-email') || '{}')
    first_name = JSON.parse(localStorage.getItem('first_name') || '{}')
    activatedRoute: ActivatedRoute;
    password= JSON.parse(localStorage.getItem('password') || '{}')
    selectedPlan = JSON.parse(localStorage.getItem('selectedPlan') || '{}');
    regError: string;
    passwordMismatch: boolean = false;
    stripeCustomerId: any;
    productList: any[] = [];
    productPrice: any;
    subscriptionId: any;
    productId: any;
    tenantId= JSON.parse(localStorage.getItem('tenantId') || '{}')
    candidateId= JSON.parse(localStorage.getItem('candidateId') || '{}')
    planId:any;
    private timer: any;
    private unsubscribe: Subscription[] = []; 
    private readonly plutoService = inject(StripeMockintoService);
    constructor(private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef,
  ) {
    this.otpForm = this.fb.group({
      otp: new FormControl('')  
       
    });
  }

  ngOnInit() {
    this.startResendTimer();
    console.log(this.verify_email);
    if (!this.verify_email || Object.keys(this.verify_email).length === 0) {
      console.log("Email not found");
      this.router.navigate(['/landing-page']);
     
      
    }else{
      this.logError = '';
      console.log("Email found");
    }
    
  }


  startResendTimer() {
    clearInterval(this.timer);
    this.isResendDisabled = true;
    this.countdown = 120;

    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
        this.cdr.detectChanges();  // Force UI update
      } else {
        this.isResendDisabled = false;
        this.cdr.detectChanges();
        clearInterval(this.timer);
      }
    }, 1000);
  }


  resendOTP() {
    console.log("Resending OTP...");
    this.isResendDisabled = true;

    this.authService.resendOtp(this.verify_email).subscribe(data => {
        console.log("Data:", data);
        if (data?.success==true) {
          console.log("OTP Resent");
            this.countdown = 120; 
            this.startResendTimer();
        } else {
          this.logError = 'Failed to resend OTP';
        }
        }
    );

  }



  isOtpComplete(): boolean {

    return this.otpForm.value.otp?.length === 6;
  }

  onInputChange(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && index < 5) {
      const nextInput = document.querySelectorAll<HTMLInputElement>('.otp-input')[index + 1];
      nextInput?.focus();
    }
    this.updateOtpValue();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && index > 0 && !(event.target as HTMLInputElement).value) {
      const prevInput = document.querySelectorAll<HTMLInputElement>('.otp-input')[index - 1];
      prevInput?.focus();
    }
    this.updateOtpValue();
  }

  updateOtpValue() {
    const otpInputs = document.querySelectorAll<HTMLInputElement>('.otp-input');
    const otpValue = Array.from(otpInputs).map(input => input.value).join('');
    this.otpForm.patchValue({ otp: otpValue });
  }


  onSubmit() {

    this.isSubmitting = true;
    console.log("Entered OTP:", this.otpForm.value.otp);

    this.authService.validateOtp( this.verify_email,this.otpForm.value.otp).subscribe
    (data => {
      console.log("Data:", data);
      if (data?.success==true) {
        console.log("OTP Verified");
        let payload = {
            firstName: this.first_name,
            email: this.verify_email
          }
        this.ceateCustomer(payload, this.password);
      } else {
        this.logError = 'Invalid OTP';
        this.isSubmitting = false;
      }
    });



  }

  updateTenant() {
    this.sharedService.updateTenant(this.tenantId, this.stripeCustomerId).subscribe(tenant => {
      if (tenant) {
        this.getStripeProducts();
      }
    })
  }


  getStripeProducts() {
    this.plutoService.getStripeProducts().subscribe((prod: any) => {
      if (prod) {
        this.productList = prod.data;
        // console.log(this.productList[0]?.default_price);
        // console.log(this.productList);
        this.productList = this.productList.filter(x => x.name.toLowerCase() == this.selectedPlan.toLowerCase());
        // console.log(this.selectedPlan);
        // console.log(this.productList);
        this.productPrice = this.productList[0]?.default_price;
        this.productId = this.productList[0]?.id
        localStorage.setItem('stripeProductPrice', JSON.stringify(this.productPrice));
        localStorage.setItem('stripeProductId', JSON.stringify(this.productId));
        this.getAllPlan();
        this.createSubscription();
      }
    })
  }



  getAllPlan(){
    this.sharedService.getAllPlan(this.tenantId).subscribe(plan=>{
      if(plan){
        let planDetails = plan.filter((x:any)=>x.name == this.selectedPlan);
        this.planId = planDetails[0]?.id || 9;
      }
    })
  }



  createSubscription() {
    console.log("create subscription",this.productPrice,this.stripeCustomerId);
    this.plutoService.createCandidateSubscription(this.productPrice, this.stripeCustomerId).subscribe(subscription => {
      if (subscription) {
        this.subscriptionId = subscription?.id
        localStorage.setItem('stripeSubscriptionId', JSON.stringify(this.subscriptionId));
        if (this.subscriptionId) {
          const backendPayload = {
            plan: {
              id: this.planId 
            },
            tenant: {
              id: this.tenantId
            },
            stripeSubscriptionId: this.subscriptionId,
            stripeProductId: this.productId,
            startDate: new Date().toISOString(),
            status: true,
            deleted: 0,
            endDate: new Date().toISOString(),
            lastPaymentDate: new Date().toISOString(),
            lastPaymentAmount: 0,
            renewalDate: new Date().toISOString(),
            futureDiscount: 0,
          };
          this.updateBackendForPlanChange(backendPayload);
        }
      }
    })
  }




    updateBackendForPlanChange(updateBackendForPlanChange: any) {
      this.sharedService.updateBackendForPlanChange(updateBackendForPlanChange).subscribe((res: any) => {
        if (res) {
          localStorage.setItem('mockintoSubscriptionId', JSON.stringify(res?.id));
          this.router.navigate(['/']);
          // (Swal as any).fire({
          //   icon: 'success',
          //   title: 'Success',
          //   text: 'Registration successful.',
          // }).then(() => {
          //   this.router.navigate(['/']);
          // });
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
  



  ceateCustomer(payload: any, password: any) {
    this.plutoService.createStripeCustomer(payload).subscribe(customer => {
      if (customer) {
        this.stripeCustomerId = customer?.id;
        localStorage.setItem('stripeCustomerId', JSON.stringify(this.stripeCustomerId));
        //this.updateTenant(payload.email,password);
        this.authService.login(payload.email, password).subscribe(res => {
          this.updateTenant();
        })
      }
    })
  }
}
