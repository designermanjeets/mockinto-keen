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
  productList:any[]=[];
  // productPrice:any;
  subscriptionId=JSON.parse(localStorage.getItem('stripeSubscriptionId') || '{}');
  customerId = JSON.parse(localStorage.getItem('stripeCustomerId') || '{}');
  productId = JSON.parse(localStorage.getItem('stripeProductId') || '{}');

  productPrice = JSON.parse(localStorage.getItem('stripeProductPrice') || '{}');

  //productId : any;
  paymentMethodId:any;
  setupIntentId:any;
  sessionId:any;
  currentPlan:any;
  newPlanPrice:any;

  logginInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');

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
        this.currentPlan = params.plan;

      }
    });
  }

  ngOnInit(): void {
    this.fetchAllPlans();
    
  }



  initCheckoutform() {
    this.checkoutForm = this.fb.group({
      name: [this.logginInUser.firstName || '', [Validators.required]],
      email: [this.logginInUser.email_id || '', [Validators.required]],
      address: [this.logginInUser.address || '', [Validators.required]],
      zipcode: ['', [Validators.required, Validators.maxLength(6),  Validators.minLength(6),Validators.pattern('^[0-9]*$'),]],
      city: ['', [Validators.required]],
      amount: [this.selectedPlan.amount, [Validators.required, Validators.pattern(/\d+/)]],
    });
    if(this.logginInUser.firstName && this.logginInUser.email_id)
    {
      this.checkoutForm.controls['name'].disable();
      this.checkoutForm.controls['email'].disable();
  
    }
   

    if (this.selectedPlan) {
      this.checkoutForm.get('amount')?.setValue(this.selectedPlan.amount);
    }

    
  }
  




  allowOnlyNumbers(event: any): void {
    const input = event.target.value;
    event.target.value = input.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    this.checkoutForm.controls['zipcode'].setValue(event.target.value);
  }

  
  updateSubscription(){
     this.plutoService.updateCandidateSubscription(this.subscriptionId,this.newPlanPrice).subscribe(sub=>{
      if(sub){
        localStorage.setItem('stripeSubscriptionId',JSON.stringify(sub.updatedSubscription?.id));
      }
     })
  }





  getProducts(){
    this.plutoService.getStripeProducts().subscribe(product=>{
      if(product){
        console.log("all product",product);
        this.productList = product.data.filter((x:any)=>x.name == this.currentPlan);
        this.newPlanPrice = this.productList[0].default_price;
        localStorage.setItem('stripeProductPrice',JSON.stringify(this.newPlanPrice));
        
      }
    })
  }
  


  
  // Helper function to flatten the params
  flattenParams(obj: any, prefix = ''): any {
    let result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}[${key}]` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          Object.assign(result, this.flattenParams(obj[key], newKey));  // Recurse if object is found
        } else {
          result[newKey] = obj[key];
        }
      }
    }
    return result;
  }
  

  collectPayment() {
    if (this.productPrice) {
      const formData = new FormData();
      formData.append('line_items[0][price]', this.productPrice); 
      formData.append('line_items[0][quantity]', '1'); 
      formData.append('stripeSuccessUrl', 'https://mockinto-dev.vercel.app/dashboard/successful-payment');
      formData.append('stripeCancelUrl', 'https://mockinto-dev.vercel.app/dashboard/cancel-payment');
  
      this.plutoService.createSessionChekout(formData).subscribe(
        (response) => {
          console.log('Checkout session created:', response);
          // this.updateSubscription();
        },
        (error) => {
          console.error('Error creating checkout session:', error);
        }
      );
    }
  }
  
  



  // collectPayment() {
  //   if (this.paying() || this.checkoutForm.invalid) {
  //     this.checkoutForm.markAllAsTouched();
  //     return;
  //   };
  //   let paymentMethod = 'card'
  //   this.paying.set(true);
  //   console.log(" this.paymentElement?.elements,", this.paymentElement?.elements,)


  //   const { name, email, address, zipcode, city } =
  //     this.checkoutForm.getRawValue();

  //   this.plutoService.confirmPaymentIntent(this.setupIntentId,paymentMethod
  //   )
  //     .subscribe({
  //       next: (result: any) => {
  //         this.paying.set(false);
  //         if (result.error) {
  //           (Swal as any).fire({
  //             icon: 'error',
  //             title: 'Oops...',
  //             text: result.error.message,
  //           });
  //         } else if (result.paymentIntent.status === 'succeeded') {
  //           this.paymentMethodId = result.paymentIntent.payment_method;
  //           this.updateCustomer();
  //          // this.updateSubscription();
  //           this.addSubcriptionPayment(result.id,result.amount);
  //           (Swal as any).fire({
  //             icon: 'success',
  //             title: 'Success',
  //             text: 'Payment completed successfully',
  //           });
  //           this.checkoutForm.reset();
           

           
  //         }
  //       },
  //       error: (err) => {
  //         this.paying.set(false);
  //         (Swal as any).fire({
  //           icon: 'error',
  //           title: 'Oops...',
  //           text: err.error.message,
  //         });
  //       },
  //     });
  // }


  deleteCandidateSubscription(){
    this.sharedService.deleteSubscription(this.logginInUser.tenant_id).subscribe(res=>{
      if(res){
        const backendPayload = {
          plan: {
            id: this.selectedPlanDetails[0]?.id, //this.selectedPlan.id,
          },
          tenant: {
          id: this.logginInUser.tenant_id
        },
        stripeSubscriptionId: this.subscriptionId,
        stripeProductId: this.productId,
          startDate: new Date().toISOString(),
          status : true,
         // status: res.status === 'succeess' ? true : false,
          deleted: 0,
          endDate: new Date().toISOString(),
          lastPaymentDate: new Date().toISOString(),
          lastPaymentAmount: this.amount,
          renewalDate: new Date().toISOString(),
          futureDiscount: 0,
        };
       this.updateBackendPlanChange(backendPayload);
      }
    })

  }

  

  addSubcriptionPayment(paymentIntenteId:any,amount:any):void{
    let payment = {
        amount: amount,
        active: "1",
        deleted: "0",
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        stripePaymentIntentId: paymentIntenteId
      }
    
    this.sharedService.addPayment(payment).subscribe(res=>{
      if(res){

      }
    })
  }

  updateBackendPlanChange(updateBackendForPlanChange: any) {
    this.sharedService.updateBackendForPlanChange(updateBackendForPlanChange).subscribe((res) => {
      if(res) {
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
