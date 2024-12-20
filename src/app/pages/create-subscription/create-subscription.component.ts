import { ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { StripeMockintoService } from '../services/stripe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserModel } from 'src/app/modules/auth';
import { StripeElementsOptions } from '@stripe/stripe-js';
import { injectStripe, StripePaymentElementComponent } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import Swal from 'sweetalert2';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-create-subscription',
  templateUrl: './create-subscription.component.html',
  styleUrls: ['./create-subscription.component.scss']
})
export class CreateSubscriptionComponent implements OnInit {
  
  allPlans: any = [];
  selectedPlan: any;
  checkoutForm: FormGroup;
  selectedPlanDetails:any;

  logginInUser = JSON.parse(localStorage.getItem('auth-user') || '{}') as UserModel;

  @ViewChild(StripePaymentElementComponent) paymentElement!: StripePaymentElementComponent;
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly plutoService = inject(StripeMockintoService);
  readonly stripe = injectStripe(environment.STRIPE_PUBLIC_KEY);

  elementsOptions: StripeElementsOptions = {
    locale: 'en',
    appearance: {
      theme: 'stripe',
      labels: 'floating',
      variables: {
        colorPrimary: '#673ab7',
      },
    },
  };

  paying = signal(false);

  get amount() {
    const amountValue = this.checkoutForm.get('amount')?.value;
    if (!amountValue || amountValue < 0) return 0;

    return Number(amountValue) / 100;
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService
  ) { 
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params.plan) {
        this.selectedPlan = params.plan;
      }
    });
  }

  ngOnInit(): void {
    this.fetchAllPlans();
  }

  initCheckoutform() {
    this.checkoutForm = this.fb.group({
      name: [this.logginInUser.username || '', [Validators.required]],
      email: [this.logginInUser.email_id || '', [Validators.required]],
      address: [this.logginInUser.address || '', [Validators.required]],
      zipcode: ['', [Validators.required]],
      city: ['', [Validators.required]],
      amount: [this.selectedPlan.amount, [Validators.required, Validators.pattern(/\d+/)]],
    });


    if (this.selectedPlan) {
      this.checkoutForm.get('amount')?.setValue(this.selectedPlan.amount);
    }

    const amount = this.checkoutForm.get('amount')?.value;
    this.plutoService
      .createPaymentIntent({
        amount: amount,
        currency: 'usd'
      })
      .subscribe((pi) => {
        this.elementsOptions.clientSecret = pi.client_secret as string;
        this.cdRef.detectChanges();
      });
  }

  collectPayment() {
    if (this.paying() || this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    };
    this.paying.set(true);

    const { name, email, address, zipcode, city } =
      this.checkoutForm.getRawValue();

    this.stripe
      .confirmPayment({
        elements: this.paymentElement?.elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: name as string,
              email: email as string,
              address: {
                line1: address as string,
                postal_code: zipcode as string,
                city: city as string,
              },
            },
          },
        },
        redirect: 'if_required',
      })
      .subscribe({
        next: (result: any) => {
          this.paying.set(false);
          if (result.error) {
            (Swal as any).fire({
              icon: 'error',
              title: 'Oops...',
              text: result.error.message,
            });
          } else if (result.paymentIntent.status === 'succeeded') {
            (Swal as any).fire({
              icon: 'success',
              title: 'Success',
              text: 'Payment completed successfully',
            });
            this.checkoutForm.reset();
            this.sharedService.deleteSubscription(this.logginInUser.tenant_id).subscribe(res=>{
              if(res){
                const backendPayload = {
                  plan: {
                    id: this.selectedPlanDetails[0]?.id, //this.selectedPlan.id,
                  },
                  tenant: {
                  id: this.logginInUser.tenant_id
                },
                  startDate: new Date().toISOString(),
                  status: result.status === 'succeeded' ? true : false,
                  deleted: 0,
                  endDate: new Date().toISOString(),
                  lastPaymentDate: new Date().toISOString(),
                  lastPaymentAmount: this.amount,
                  renewalDate: new Date().toISOString(),
                  futureDiscount: 0,
                };
                this.updateBackendForPlanChange(backendPayload);
              }
            })

           
          }
        },
        error: (err) => {
          this.paying.set(false);
          (Swal as any).fire({
            icon: 'error',
            title: 'Oops...',
            text: err.error.message,
          });
        },
      });
  }

  updateBackendForPlanChange(updateBackendForPlanChange: any) {
    this.sharedService.updateBackendForPlanChange(updateBackendForPlanChange).subscribe((res) => {
      if(res) {
        console.log(res);
        this.router.navigate(['dashboard/landing']);
      } else {
        (Swal as any).fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong. Please try again later.',
        });
      }
    });
    
  }

  cancelPayment() {
    (Swal as any).fire({
      icon: 'error',
      title: 'Cancel Payment',
      text: 'Are you sure you want to cancel payment?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-active-light"
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.checkoutForm.reset();
        this.router.navigate(['dashboard/mockinto-plan']);
      }
    });
  }

  fetchAllPlans() {
    this.plutoService.getAllPlans().subscribe((res) => {
      if(res) {
        this.allPlans = res.data;
        this.activatedRoute.queryParams.subscribe((params) => {
          if (params.plan) {
            this.selectedPlan = this.allPlans.find((p: any) => {
              if(p.product === 'prod_RE6gpXJjiUWQwu' && params.plan === 'Starter') {
                p.planname = 'Starter';
                return p;
              }
              if(p.product === 'prod_RE6iUE4yKY0i3Q' && params.plan === 'Professional') {
                p.planname = 'Professional';
                return p;
              }
              if(p.product === 'prod_RE6icvAZSyUQ6n' && params.plan === 'Enterprise') {
                p.planname = 'Enterprise';
                return p;
              }
            });

            this.sharedService.getAllPlan(this.logginInUser.tenant_id).subscribe(res=>{
              if(res){
                let allPlan = res;
                this.selectedPlanDetails = allPlan.filter((x:any)=>x.name == params.plan);
              }
            })
          }
        });
        this.initCheckoutform();
        this.cdRef.detectChanges();
      }
    });
  }

}
