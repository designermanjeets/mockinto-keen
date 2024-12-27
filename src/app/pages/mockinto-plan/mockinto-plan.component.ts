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

  plan = JSON.parse(localStorage.getItem('tenant_general_config') || '{}');
  subscriptionId=JSON.parse(localStorage.getItem('stripeSubscriptionId') || '{}');
  amount = JSON.parse(localStorage.getItem('planAmount') || '{}');
  logginInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
  productId = JSON.parse(localStorage.getItem('stripeProductId') || '{}');
  currentPlan= JSON.parse(localStorage.getItem('currentPlan') || '{}');




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
          this.planName = data?.subscription[0]?.plan?.name;
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
        this.selectedPlanName = data[0]?.plan?.name;
        this.selectedPlan = data[0]?.plan;
        this.cdRef.detectChanges();
        
      }
    ); 
  }

  fetchAllPlans() {
    this.plutoService.getAllPlans().subscribe((res) => {
      if(res) {
        this.allPlans = res.data;
        console.log("all plans",this.allPlans);
        this.cdRef.detectChanges();
      }
    });
  }

  selectplan(event: Event, plan?: string) {
    // event.stopImmediatePropagation();
    switch (plan) {
      case 'Starter':
       // this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Starter' } });
     
        (Swal as any).fire({
          text: "You Already Use the Free plan please Choose  the another plan",
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

      case 'Professional':
      //  if(this.planName == 'Professional' || this.planName == 'Enterprise'){
      //   (Swal as any).fire({
      //     text: "Already Subscribed Professional plan ! you Can Change it after a month",
      //     icon: "warning",
      //     buttonsStyling: false,
      //     cancelButtonText: 'Cancel',
      //     customClass: {
      //       confirmButton: "btn btn-primary",
           
      //     }
      //   }).then((result: any) => {
      //     if(result.isConfirmed) {
      //     }
      //   });
      //   break;
      //  }
      //  else{
      //   this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Professional' } });
      //   break;
      //  }
      this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Professional' } });
       break;
       

      case 'Enterprise':
        // if(this.planName == 'Enterprise'){
        //   (Swal as any).fire({
        //     text: "Already Subscribed Enterprise plan ! you Can Change it after a month",
        //     icon: "warning",
        //     buttonsStyling: false,
        //     cancelButtonText: 'Cancel',
        //     customClass: {
        //       confirmButton: "btn btn-primary",
             
        //     }
        //   }).then((result: any) => {
        //     if(result.isConfirmed) {
        //     }
        //   });
        //   break;
        //  }
        //  else{
        //   this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Enterprise' } });
        //   break;
        //  }

        this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Enterprise' } });
        break;
        
      default:
        break;
    }
  }


  cancelSubscription(){
    this.plutoService.cancelSubscription(this.subscriptionId).subscribe(res=>{
      if(res){
        console.log("res",res)

        const backendPayload = {
          id: this.subscriptionId,
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
       this.updateBackendPlanChange(backendPayload);
      }

    })
  }




      updateBackendPlanChange(updateBackendForPlanChange: any) {
        this.sharedService.cancelBackendForPlanChange(updateBackendForPlanChange).subscribe((res) => {
          if(res) {
            this.sharedService.isLoadingSubject?.next(false);
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

  }




  


