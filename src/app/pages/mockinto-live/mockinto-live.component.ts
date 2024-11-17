import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-mockinto-live',
  templateUrl: './mockinto-live.component.html',
  styleUrls: ['./mockinto-live.component.scss']
})
export class MockintoLiveComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];

  isMeetingProgress: boolean = false;
  jobPostingId: string = '';
  jogIDBotQuestions: any = [];

  constructor(
    private cdRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private router: Router
  ) {
    const loadingSubscr = this.isLoading$.asObservable().subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    this.jobPostingId = this.router.url.split('/')[3]; // Fixed Position Don't Change the Path in routing
  }
  
  startOrStopMockinto() {
    if(this.isMeetingProgress) {
      this.isMeetingProgress = false;
      this.jogIDBotQuestions = [];
    } else {
      this.fetchAllMockintoQuestionsByJobPostingId();
    }
  }

  fetchAllMockintoQuestionsByJobPostingId() {
    this.isLoading$.next(true);
    this.sharedService.fetchAllMockintoQuestionsByJobPostingId(this.jobPostingId).subscribe((res) => {
      this.jogIDBotQuestions = res;
      this.isLoading$.next(false);
      if(this.jogIDBotQuestions.length > 0) {
        this.isMeetingProgress = true;
      }
    });
  }

}