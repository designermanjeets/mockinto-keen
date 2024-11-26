import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StripeMockintoService } from '../services/stripe.service';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-mockinto-plan',
  templateUrl: './mockinto-plan.component.html',
  styleUrls: ['./mockinto-plan.component.scss']
})
export class MockintoPlanComponent implements OnInit {

  allPlans: any = [];
  plansData:any = [];

  upgrade_plan_radio: any;

  constructor(
    private cdRef: ChangeDetectorRef,
    private plutoService: StripeMockintoService,
    private router: Router,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.fetchAllPlans();
    this.getConfig();
  }


  getConfig(){
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.getConfigAll().subscribe(
      data => {
        if(data) {
         this.plansData = data.filter((item:any) => item.category === 'plan');
        }
      }
    ); 

  }

  fetchAllPlans() {
    this.plutoService.getAllPlans().subscribe((res) => {
      if(res) {
        this.allPlans = res.data;
        this.cdRef.detectChanges();
      }
    });
  }

  selectplan(event: Event, plan?: string) {
    event.stopImmediatePropagation();
    switch (plan) {
      case 'starter':
        this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'starter' } });
        break;

      case 'advanced':
        this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'advanced' } });
        break;

      case 'enterprise':
        this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'enterprise' } });
        break;
      default:
        break;
    }
  }

}
