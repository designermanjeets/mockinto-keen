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

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];

  constructor(
    private cdRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private router: Router
  ) {
    const loadingSubscr = this.isLoading$.asObservable().subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
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
        }
        this.resetSelection();
        this.sharedService.isLoadingSubject?.next(false);
        this.cdRef.detectChanges();
      }
    );
  }

  reportMockintoSchedule(mockintoSchedule: any) {
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.fetchMockintoReportByScheduleId(mockintoSchedule.id).subscribe(
      data => {
        if(data) {
          this.sharedService.isLoadingSubject?.next(false);
          this.router.navigate([`/dashboard/mockinto-report/${mockintoSchedule.id || 99}`]);
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