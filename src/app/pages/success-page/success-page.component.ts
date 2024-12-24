import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StripeMockintoService } from '../services/stripe.service';

@Component({
  selector: 'app-success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss']
})
export class SuccessPageComponent implements OnInit {
  subscriptionId=JSON.parse(localStorage.getItem('stripeSubscriptionId') || '{}');
  productPrice = JSON.parse(localStorage.getItem('stripeProductPrice') || '{}');


  private readonly plutoService = inject(StripeMockintoService);
  constructor(private router: Router) {}
  ngOnInit(){
    if(this.subscriptionId ){
      this.updateSubscription();
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/']);
  }

  
  updateSubscription(){
    this.plutoService.updateCandidateSubscription(this.subscriptionId,this.productPrice).subscribe(sub=>{
     if(sub){
       localStorage.setItem('stripeSubscriptionId',JSON.stringify(sub.updatedSubscription?.id));
     }
    })
 }


}
