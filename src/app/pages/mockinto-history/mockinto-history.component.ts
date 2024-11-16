import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StripeMockintoService } from '../services/stripe.service';

@Component({
  selector: 'app-mockinto-history',
  templateUrl: './mockinto-history.component.html',
  styleUrls: ['./mockinto-history.component.scss']
})
export class MockintoHistoryComponent implements OnInit {

  allPayments: any = [];

  constructor(
    private cdRef: ChangeDetectorRef,
    private plutoService: StripeMockintoService
  ) { }

  ngOnInit(): void {
    this.fetchAllPayments();
  }

  fetchAllPayments() {
    this.plutoService.getPaymentHistory().subscribe((res) => {
      if(res) {
        this.allPayments = res.data;
        this.cdRef.detectChanges();
      }
    });
  }

}
