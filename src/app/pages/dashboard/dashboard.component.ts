import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;

  mockData = {
    "totalSchedules": 0,
    "totalResumes": 1,
    "activeSchedules": 0,
    "totalJobPostings": 100,
    "oldSchedules": 0,
    "subscription": null,
    "candidate": {
        "id": 4,
        "active": 1,
        "candidateEmail": "d@d.com",
        "candidatePhone": "3333333333",
        "createdDate": "2024-10-12T06:11:54.000+00:00",
        "deleted": 0,
        "lastUpdatedDate": "2024-10-12T18:38:32.000+00:00",
        "preferredTimezone": "EST",
        "resumeS3Path": "def",
        "updatedBy": 1
    }
  };

  dashboardData!: any;

  constructor(
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.sharedService.fetchDashboardData().subscribe(
      (data) => {
        console.log('data', data);
        if(!data) {
          // Return Mock for now
          this.dashboardData = this.mockData;
          console.log('this.dashboardData', this.dashboardData);
          this.cdr.detectChanges();
        }
      }
    );
  }

  async openModal() {
    return await this.modalComponent.open();
  }
}
