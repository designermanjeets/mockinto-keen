import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StripeMockintoService } from '../services/stripe.service';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import Swal from 'sweetalert2';

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
  tenantId:any;
  selectedPlanName :any

  constructor(
    private cdRef: ChangeDetectorRef,
    private plutoService: StripeMockintoService,
    private router: Router,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
   
    this.tenantId = loggedInUser.tenant_id;
    this.fetchAllPlans();
    this.getConfig();
    this.getSubscription();
   
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

  getSubscription(){
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.getSubscriptionByTenantId(this.tenantId).subscribe(
      data => {
        this.selectedPlanName = data[0]?.plan?.name;
        this.cdRef.detectChanges();
        
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
       // this.router.navigate(['/dashboard/create-subscription'], { queryParams: { plan: 'Starter' } });
     
        (Swal as any).fire({
          text: "You Already Use the Free plan please Choose  the another plan",
          icon: "warning",
          buttonsStyling: false,
          cancelButtonText: 'Cancel',
          customClass: {
            confirmButton: "btn btn-primary",
           
          }
        }).then((result: any) => {
          if(result.isConfirmed) {
          }
        });
      

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


  cancelSubscription(){

  }

}
