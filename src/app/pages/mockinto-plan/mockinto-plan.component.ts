import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StripeMockintoService } from '../services/stripe.service';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mockinto-plan',
  templateUrl: './mockinto-plan.component.html',
  styleUrls: ['./mockinto-plan.component.scss']
})
export class MockintoPlanComponent implements OnInit {

  allPlans: any = [];
  plansData:any = [];
  upgrade_plan_radio: any;
  allTenantGeneralConfig: any = [];
  tenantId:any;
  selectedPlanName :any
  selectedPlan:any;
  planName:any;
  selectedPlanDetails:any[]=[];
  productList:any[]=[];
  productPrice:any;
  planId:any;
  plan = JSON.parse(localStorage.getItem('tenant_general_config') || '{}');
  subscriptionId=JSON.parse(localStorage.getItem('stripeSubscriptionId') || '{}');
  amount = JSON.parse(localStorage.getItem('planAmount') || '{}');
  logginInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
  productId = JSON.parse(localStorage.getItem('stripeProductId') || '{}');
  currentPlan= JSON.parse(localStorage.getItem('currentPlan') || '{}');
  mockintoSubscriptionId= JSON.parse(localStorage.getItem('mockintoSubscriptionId') || '{}');
  stripeCustomerId = JSON.parse(localStorage.getItem('stripeCustomerId') || '{}')
  constructor(
    private cdRef: ChangeDetectorRef,
    private plutoService: StripeMockintoService,
    private router: Router,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
   
    this.tenantId = loggedInUser.tenant_id;
    this.fetchAllPlans();
    this.getConfig();
    this.getSubscription();
    this.fetchDashboardData();
    this.getAllPlan();
   
  }




  getAllPlan(){
    this.sharedService.getAllPlan(this.logginInUser.tenant_id).subscribe(res=>{
      if(res){
        let allPlan = res;
        this.selectedPlanDetails = allPlan.filter((x:any)=>x.name == this.currentPlan);
      }
    })
  
  }
  


  fetchDashboardData() {
    this.sharedService.fetchDashboardData().subscribe(
      (data) => {
        if(!data) {
        } else {
          console.log("subscription data --->",data?.subscription);
          this.planName = data?.subscription[data?.subscription.length -1]?.plan?.name;
          console.log(data?.subscription[data?.subscription.length -1]?.id);
          localStorage.setItem('mockintoSubscriptionId', JSON.stringify(data?.subscription[data?.subscription.length -1]?.id));
          localStorage.setItem("stripeCustomerId",JSON.stringify(data?.subscription[data?.subscription.length -1]?.tenant?.stripeCustomer?.stripeCustomerId))
          localStorage.setItem("stripeSubscriptionId",JSON.stringify(data?.subscription[data?.subscription.length -1]?.stripeSubscriptionId))
          this.getPaymentSubscriptionall(data?.subscription[data?.subscription.length -1]?.id);
        }
      }
    );
  }


getPaymentSubscriptionall(id:any) {
    this.sharedService.getPaymentSubscriptionall(id).subscribe(
      (data) => {
        if(!data) {
        } else {
          console.log("payment-Subscriptionall",data);
          if (data[0]?.stripePaymentIntentId) {
            localStorage.setItem('sessionId', data[0].stripePaymentIntentId);
          }
          console.log("sessionId",data[0]?.stripePaymentIntentId);
        }
      }
    );
  }


  getConfig(){
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.getConfigAll().subscribe(
      data => {
        if(data) {
         this.plansData = data.filter((item:any) => item.category === 'plan');
        }
      }
    ); 
  }

  getSubscription(){
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.getSubscriptionByTenantId(this.tenantId).subscribe(
      data => {
        this.selectedPlanName = data[data.length - 1]?.plan?.name;
        this.selectedPlan = data[data.length -1]?.plan;
        this.cdRef.detectChanges();
        
      }
    ); 
  }

  fetchAllPlans() {
    this.plutoService.getAllPlans().subscribe((res) => {
      if(res) {
        this.allPlans = res.data;
        this.cdRef.detectChanges();
      }
    });
  }

  selectplan(event: Event, plan?: string) {
    // event.stopImmediatePropagation();
    switch (plan) {
      case 'Starter':
       // this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Starter' } });
       if(this.planName == 'Starter'){
        (Swal as any).fire({
          text: "You are already using the Free plan",
          icon: "warning",
          buttonsStyling: false,
          cancelButtonText: 'Cancel',
          customClass: {
            confirmButton: "btn btn-primary",
           
          }
        }).then((result: any) => {
          if(result.isConfirmed) {
          }
        });
      

        break;
      }else{
        this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Starter' } });
        break
      }

      case 'Professional':

       if(this.planName == 'Professional'){
        (Swal as any).fire({
          text: "Already Subscribed Professional plan ! you Can Change it after a month",
          icon: "warning",
          buttonsStyling: false,
          cancelButtonText: 'Cancel',
          customClass: {
            confirmButton: "btn btn-primary",
           
          }
        }).then((result: any) => {
          if(result.isConfirmed) {
          }
        });
        break;
       }
       else{
        this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Professional' } });
        break;
       }
      // this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Professional' } });
      //  break;
       

      case 'Enterprise':
        console.log(this.planName);
       
        if(this.planName == 'Enterprise'){
          (Swal as any).fire({
            text: "Already Subscribed Enterprise plan !",
            icon: "warning",
            buttonsStyling: false,
            cancelButtonText: 'Cancel',
            customClass: {
            confirmButton: "btn btn-primary", 
            }
          }).then((result: any) => {
            if(result.isConfirmed) {
            }
          });
          break;
         }
         else{
          this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Enterprise' } });
          break;
         }

        // this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Enterprise' } });
        // break;
        
      default:
        break;
    }
  }


  cancelSubscription(){
    if(this.selectedPlanName == 'Starter'){
      (Swal as any).fire({
        text: "The free subscription cannot be canceled.",
        icon: "warning",
        buttonsStyling: false,
        cancelButtonText: 'Ok',
        customClass: {
          confirmButton: "btn btn-primary",
         
        }
      }).then((result: any) => {
        if(result.isConfirmed) {
        }
      });
    }
    else{
      (Swal as any).fire({
        title: "Are you sure?",
        text: "Do you really want to Cancel Subscription?",
        icon: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-active-light"
        }
      }).then((result: any) => {
        if (result.isDismissed) {
          return;
        }
        if (result.isConfirmed) {
          this.plutoService.cancelSubscription(this.subscriptionId).subscribe(res=>{
            if(res){
              const backendPayload = {
                id: this.mockintoSubscriptionId,
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
                deleted: 1,
                endDate: new Date().toISOString(),
                lastPaymentDate: new Date().toISOString(),
                lastPaymentAmount: this.amount,
                renewalDate: new Date().toISOString(),
                futureDiscount: 0,
              };
             this.cancekBackendPlan(backendPayload);
            }
      
          })
        }
      });

    }
   
    
  }




      cancekBackendPlan(updateBackendForPlanChange: any) {
        this.sharedService.cancelBackendForPlanChange(updateBackendForPlanChange).subscribe((res) => {
          if(res) {
            this.sharedService.isLoadingSubject?.next(false);
            this.currentPlan = 'Starter';
            localStorage.setItem('currentPlan', JSON.stringify(this.currentPlan));
            this.getStripeProducts();
             (Swal as any).fire({
                      icon: 'success',
                      title: 'Success',
                      text: 'Plan Cancel successful.',
                    }).then(() => {
                      this.router.navigate(['/']);
                    });
          } else {
            (Swal as any).fire({
              icon: 'error',
              title: 'Error',
              text: 'Something went wrong. Please try again later.',
            });
          }
        });
        
      }


      getStripeProducts() {
        this.plutoService.getStripeProducts().subscribe((prod: any) => {
          if (prod) {
            this.productList = prod.data;
            this.productList = this.productList.filter(x => x.name == this.currentPlan);
            this.productPrice = this.productList[0]?.default_price;
            this.productId = this.productList[0]?.id
            localStorage.setItem('stripeProductPrice', JSON.stringify(this.productPrice));
            localStorage.setItem('stripeProductId', JSON.stringify(this.productId));
            this.getMockintoAllPlan();
            this.createFreeSubscription();
    
          }
        })
      }


      getMockintoAllPlan(){
        this.sharedService.getAllPlan(this.tenantId).subscribe(plan=>{
          if(plan){
            let planDetails = plan.filter((x:any)=>x.name == this.currentPlan);
            this.planId = planDetails[0]?.id;
            
          }
    
        })
      }


      createFreeSubscription() {
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
      }




      



    


  


