import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cancel-payment-page',
  templateUrl: './cancel-payment-page.component.html',
  styleUrls: ['./cancel-payment-page.component.scss']
})
export class CancelPaymentPageComponent {
   constructor(private router: Router) {}
  
    goToDashboard(): void {
      this.router.navigate(['/']);
    }

}
