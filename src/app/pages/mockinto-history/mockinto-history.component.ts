import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-mockinto-history',
  templateUrl: './mockinto-history.component.html',
  styleUrls: ['./mockinto-history.component.scss']
})
export class MockintoHistoryComponent implements OnInit {

  allMockintoHistory: any = [];
  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;

  masterCheckbox: boolean = false;
  someChecked = [];
  mockResume: any;

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
    this.sharedService.fetchAllMockintoSchedules(1, page, size, 'id', 'ASC').subscribe(
      data => {
        if(data) {
          this.paginator.length = data.totalElements;
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

  editMockintoSchedule(mockintoSchedule: any) {
    this.sharedService.isLoadingSubject?.next(true);
    // this.sharedService.fetchMockintoScheduleById(mockintoSchedule.id).subscribe(
    //   data => {
    //     if(data) {
    //       this.sharedService.isLoadingSubject?.next(false);
    //       this.router.navigate([`/dashboard/mockinto-schedule/${mockintoSchedule.id || 99}`]);
    //     }
    //   }
    // );
  }

  deleteMockintoSchedule(mockintoSchedule: any) {
    this.sharedService.isLoadingSubject?.next(true);
    // this.sharedService.deleteMockintoSchedule(mockintoSchedule.id).subscribe(
    //   data => {
    //     if(data) {
    //       this.fetchAllMockintoSchedules();
    //     }
    //   }
    // );
  }

  deleteBulk () {
    this.sharedService.isLoadingSubject?.next(true);
    // const ids = this.someChecked.map((item: any) => item.id);
    // this.sharedService.deleteBulkMockintoSchedules(ids).subscribe(
    //   data => {
    //     if(data) {
    //       this.fetchAllMockintoSchedules();
    //     }
    //   }
    // );
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
