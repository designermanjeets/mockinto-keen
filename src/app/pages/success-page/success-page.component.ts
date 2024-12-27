import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StripeMockintoService } from '../services/stripe.service';
import { SharedService } from '../services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss']
})
export class SuccessPageComponent implements OnInit {
  subscriptionId=JSON.parse(localStorage.getItem('stripeSubscriptionId') || '{}');
  productPrice = JSON.parse(localStorage.getItem('stripeProductPrice') || '{}');
  sessionId = JSON.parse(localStorage.getItem('sessionId') || '{}');
  amount = JSON.parse(localStorage.getItem('planAmount') || '{}');
  logginInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
  productId = JSON.parse(localStorage.getItem('stripeProductId') || '{}');
  plan= JSON.parse(localStorage.getItem('currentPlan') || '{}');
  selectedPlanDetails:any[]=[];


  private readonly plutoService = inject(StripeMockintoService);
  constructor(private router: Router, private sharedService: SharedService
  ) {}
  ngOnInit(){
    this.addSubcriptionPayment();
    if(this.plan){
      this.getAllPlan();
    }

  }

  goToDashboard(): void {
    console.log("click the button")
    this.router.navigate(['/']);
  }

  

 

 addSubcriptionPayment():void{
  let payment = {
      amount: this.amount,
      active: "1",
      deleted: "0",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      stripePaymentIntentId: this.sessionId
    }
  
  this.sharedService.addPayment(payment).subscribe(res=>{
    if(res){
     this.deleteCandidateSubscription();
    }
  })
}



deleteCandidateSubscription(){
  this.sharedService.deleteSubscription(this.logginInUser.tenant_id).subscribe(sub=>{
    if(sub){
      console.log("deltsubscription",sub)
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

getAllPlan(){
  this.sharedService.getAllPlan(this.logginInUser.tenant_id).subscribe(res=>{
    if(res){
      let allPlan = res;
      this.selectedPlanDetails = allPlan.filter((x:any)=>x.name == this.plan);
    }
  })

}



  updateBackendPlanChange(updateBackendForPlanChange: any) {
    this.sharedService.updateBackendForPlanChange(updateBackendForPlanChange).subscribe((res) => {
      if(res) {
        console.log("update ",updateBackendForPlanChange)
      }
    });
    
  }


}
