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

  allTenantGeneralConfig: any = [];

  constructor(
    private cdRef: ChangeDetectorRef,
    private plutoService: StripeMockintoService,
    private router: Router,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.fetchAllPlans();
    this.getConfig();
    this.allTenantGeneralConfig = this.sharedService.allTenantGeneralConfig;
    console.log(this.allTenantGeneralConfig);
    const result = this.allTenantGeneralConfig.features[0]
      .split("\n")
      .map((item: any) => item.trim())
      .filter((item: any) => item.length > 0) // Remove empty entries
      .map((item: any, index: any) => ({ id: index + 1, description: item }));
    console.log(result);
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
    // event.stopImmediatePropagation();
    switch (plan) {
      case 'Starter':
        this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Starter' } });
        break;

      case 'Professional':
        this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Professional' } });
        break;

      case 'Enterprise':
        this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Enterprise' } });
        break;
      default:
        break;
    }
  }

}
