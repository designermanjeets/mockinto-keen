import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-mockinto-report',
  templateUrl: './mockinto-report.component.html',
  styleUrls: ['./mockinto-report.component.scss']
})
export class MockintoReportComponent implements OnInit {

  allMockintoHistory: any = [];
  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;

  masterCheckbox: boolean = false;
  someChecked = [];
  scheduleId:any;
  mockintoSchedules:any[]=[]

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];
  interviewSummary:any

  constructor(
    private cdRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private router: Router
  ) {
    const loadingSubscr = this.isLoading$.asObservable().subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    this.scheduleId = this.router.url.split('/')[3];
    if(this.scheduleId){
      this.reportMockintoSchedule();
    }
    this.fetchAllMockintoSchedules();
  }

  fetchAllMockintoSchedules(page = 0, size = 10) {
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.fetchAllMockintoSchedules(0, page, size, 'id', 'ASC').subscribe(
      data => {
        if(data) {
          if(this.paginator) {
            this.paginator.length = data.totalElements;
           
          }
          this.allMockintoHistory = data.content;
          const filteredSchedules = this.allMockintoHistory.filter(
            (x: any) => x.id === Number(this.scheduleId)
          );

          this.mockintoSchedules = filteredSchedules;
          console.log("filetr",this.mockintoSchedules)
        }
        this.resetSelection();
        this.sharedService.isLoadingSubject?.next(false);
        this.cdRef.detectChanges();
      }
    );
  }






  reportMockintoSchedule() {
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.fetchMockintoSummaryByScheduleId(this.scheduleId).subscribe(
      data => {
        if(data) {
          this.interviewSummary = data[0];
          console.log("interview Summary ",this.interviewSummary);
          this.sharedService.isLoadingSubject?.next(false);
        }
      }
    );
  }

  onMasterChange(event: any) {
    this.masterCheckbox = event;
    this.allMockintoHistory.forEach((item: any) => item.checked = event);
    this.someChecked = this.allMockintoHistory.filter((item: any) => item.checked);
  }

  onRowCheckChange(event: any, idx: any) {
    this.allMockintoHistory[idx].checked = event;
    this.masterCheckbox = this.allMockintoHistory.every((item: any) => item.checked);
    this.someChecked = this.allMockintoHistory.filter((item: any) => item.checked);
  }

  resetSelection() {
    this.masterCheckbox = false;
    this.someChecked = [];
    this.allMockintoHistory.forEach((item: any) => item.checked = false);
  }

  onPageChange(event: any) {
    this.fetchAllMockintoSchedules(event.pageIndex, event.pageSize);
  }

}