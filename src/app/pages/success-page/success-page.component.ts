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
  mockintoSubscriptionId = JSON.parse(localStorage.getItem('mockintoSubscriptionId') || '{}');
  selectedPlanDetails:any[]=[];


  private readonly plutoService = inject(StripeMockintoService);
  constructor(private router: Router, private sharedService: SharedService
  ) {}
  ngOnInit(){
    if(this.plan){
      this.getAllPlan();
    }
    this.deleteCandidateSubscription();

   
  }

  goToDashboard(): void {
   // this.router.navigate(['/']);
   window.close();


  }

 addSubcriptionPayment(id : any):void{
  let payment = {
    subscription: {
      id : id
      },
      amount: this.amount,
      active: "1",
      deleted: "0",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      stripePaymentIntentId: this.sessionId
    }
  
  this.sharedService.addPayment(payment).subscribe(res=>{
    if(res){
     //this.deleteCandidateSubscription();
     console.log("success");
    }
  })
}



deleteCandidateSubscription(){
  this.sharedService.deleteSubscription(this.mockintoSubscriptionId).subscribe(sub=>{
    if(sub){
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
        console.log("new response",res);
        localStorage.setItem('mockintoSubscriptionId', JSON.stringify(res?.id));
        console.log(JSON.stringify(res?.id))
        this.addSubcriptionPayment(JSON.stringify(res?.id));

      }
    });
    
  }


}



