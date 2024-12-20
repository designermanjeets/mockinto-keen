import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss']
})
export class SuccessPageComponent {

  constructor(private router: Router) {}

  goToDashboard(): void {
    this.router.navigate(['/']);
  }

}
