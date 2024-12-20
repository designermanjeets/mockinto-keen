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
  productPrice:any;
  subscriptionId=JSON.parse(localStorage.getItem('subscriptionId') || '{}');
  customerId = JSON.parse(localStorage.getItem('customerId') || '{}');
  productId : any;
  paymentMethodId:any;
  setupIntentId:any;
  sessionId:any;
  currentPlan:any;

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
    this.getProduct();
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

    

    const amount = this.checkoutForm.get('amount')?.value;
    // this.plutoService.createSession({
    //   customer : this.customerId,
    //   mode: 'subscription',
    //   currency: 'usd',
    //   success_url: "https://example.com/success",
    //   price: this.productPrice

    // }).subscribe(session=>{
    //   console.log("create session",session)
    //   this.sessionId = session.id
    //   this.setupIntentId = session?.setup_intent;
    //   // this.plutoService
    //   // .createSetupIntent({
    //   //   // amount: amount,
    //   //   // currency: 'usd'
    //   //   payment_method_types: ['card'], // Ensure this is an array with valid entries
    //   // })
    //   // .subscribe((pi) => {
    //   //  this.reteriveSessionId();
    //   //   this.elementsOptions.clientSecret = pi.client_secret as string;
    //   //   this.cdRef.detectChanges();
    //   // });
    // })
    
  }
  




  allowOnlyNumbers(event: any): void {
    const input = event.target.value;
    event.target.value = input.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    this.checkoutForm.controls['zipcode'].setValue(event.target.value);
  }

  

  getProduct(){
    this.plutoService.getProducts(3).subscribe(res=>{
      if(res){
          this.productList = res.data;
          this.productList = this.productList.filter(x=>x.name == this.currentPlan);
          this.productId = this.productList[0]?.id
          this.productPrice = this.productList[0]?.default_price;
          
      }

    })                 
  }



  updateSubscription(){
    
     this.plutoService.updateSubscription(this.subscriptionId,this.productPrice,this.customerId,this.logginInUser.candidates[0]?.id,this.logginInUser.tenant_id).subscribe(subscription=>{
      if(subscription){
      
 
       
      }
    })
  }




  createPaymentMethod() {
    // const params = {
    //   type: 'us_bank_account',  // Required field to specify the payment method type
    //   us_bank_account: {
    //     account_holder_type: 'individual',  // account_holder_type is inside the us_bank_account object
    //     account_number: '000123456789',    // Bank account number
    //     routing_number: '110000000',       // Routing number
    //   },
    //   billing_details: {
    //     name: this.logginInUser.username,  // Use the user name as billing details
    //   }
    // };


    const params = {
      type : 'card',
      card:{
        exp_month: 11,
        exp_year: 28,
        number: 4242424242424242,
        cvc:346
      }
    }




  
    const flatParams = this.flattenParams(params);
  
    // Send the flattened payload to your backend
    this.plutoService.createPaymentMethod(flatParams).subscribe(payment => {
      console.log("Payment Method Created:", payment);
      this.paymentMethodId = payment.id;
      
    });
  }

  createPaymentAttach(){
    let paylod={
      customer: this.customerId 
    }
   
    this.plutoService.customerPaymentAttach(this.paymentMethodId,paylod).subscribe(attach=>{
      console.log("attach", attach)
      if(attach){
        this.updateCustomer();
      }
    })
  }


  updateCustomer() {
    const updatedData = {
      invoice_settings: {
        default_payment_method: this.paymentMethodId // Set the default payment method
      }
    };
  
    
    this.plutoService.updateCustomer(this.customerId, updatedData)
      .subscribe((customer) => {
        console.log('Customer updated:', customer);
        this.updateSubscription();
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
  


  collectPayment(){
    if(this.productPrice){
      this.plutoService.createSession({
        customer : this.customerId,
        price: this.productPrice
  
      }).subscribe(session=>{
        let url = session.url
        this.sessionId = session.id
        this.setupIntentId = session?.setup_intent;
        if(url){
          window.open(`${url}`, '_blank');
        }  
      })
     
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
        this.updateBackendForPlanChange(backendPayload);
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

  updateBackendForPlanChange(updateBackendForPlanChange: any) {
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
