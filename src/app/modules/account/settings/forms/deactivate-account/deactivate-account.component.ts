import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { SharedService } from 'src/app/pages/services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deactivate-account',
  templateUrl: './deactivate-account.component.html',
})
export class DeactivateAccountComponent implements OnInit{
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];
  isCheckdeactiveAccount:boolean = false

  constructor(
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
    private auth: AuthService,

  ) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res:any) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    {

      }
  }

  saveSettings() {
    alert('Account has been successfully deleted!');
    if(this.isCheckdeactiveAccount){
    const payload: any = {
      active: "0"
    };
    this.sharedService.deactivateCandidateAccount(payload).subscribe((res) => {
      if(!res.error){
        (Swal as any).fire({
          title: 'Success!',
          text: 'Profile Deactivate  successfully',
          icon: 'success',
          confirmButtonText: 'Ok'
        }).then((result: any) => {
          if(result.isConfirmed) {
            this.auth.logout();
          }
        });
      } else {
        (Swal as any).fire({
          title: 'Error!',
          text: res.error.data,
          icon: 'error',
          confirmButtonText: 'Ok'
        }).then(() => {
          this.isLoading$.next(false);
          this.cdr.detectChanges();
        });
      }
    });
  }
  }
}
