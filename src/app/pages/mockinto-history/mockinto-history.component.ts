import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StripeMockintoService } from '../services/stripe.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-mockinto-history',
  templateUrl: './mockinto-history.component.html',
  styleUrls: ['./mockinto-history.component.scss']
})
export class MockintoHistoryComponent implements OnInit {

  allMockintoHistory: any = [];

  constructor(
    private cdRef: ChangeDetectorRef,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.fetchAllMockintoSchedules();
  }

  fetchAllMockintoSchedules(page = 0, size = 10) {
    this.sharedService.fetchAllMockintoSchedulesByCandidate(1, page, size).subscribe((res) => {
      if(res) {
        this.allMockintoHistory = res.content
        this.cdRef.detectChanges();
      }
    });
  }

}
