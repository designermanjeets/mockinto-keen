import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService, UserModel } from 'src/app/modules/auth';
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
  isCheckdeactiveAccount:boolean = false;
  
  private authLocalStorageToken = `auth-user`;
  authUser = JSON.parse(localStorage.getItem(this.authLocalStorageToken) || '{}');


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
    (Swal as any).fire({
      title: "Are you sure?",
      text: "Do you really want to deactivate your account?",
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-active-light"
      }
    }).then((result: any) => {
      if (result.isDismissed) {
        return;
      }
      if (result.isConfirmed) {
        if (true) {
          
          // Step 1: Prompt user to enter password
          (Swal as any).fire({
            title: "Verify Password",
            input: "password",
            inputPlaceholder: "Enter your password",
            inputAttributes: {
              autocapitalize: "off",
              autocorrect: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Verify",
            cancelButtonText: "Cancel",
            preConfirm: (password: string | null) => {  
              if (!password) {
                Swal.showValidationMessage("Password is required");
                return false;  // Prevents modal from closing
              }
              return password;
            }
          }).then((passwordResult: any) => {
            if (passwordResult.isDismissed) {
              return;
            }
  
            const payload = {
              username: this.authUser.email_id,
              password: passwordResult.value, // ✅ Fix: Use user input
              rememberMe: true
            };
            console.log("Payload:", payload);
  
            this.auth.verifypassword(payload.username, payload.password, payload.rememberMe).subscribe(
              (user: UserModel | undefined | any) => { // ✅ Explicit typing
                console.log("User:", user);
                if (user?.success==true) {
                  // Step 3: Proceed with account deactivation
                  const deactivatePayload = {
                    active: false,
                    user_email: this.authUser.email_id,
                    deleted: true
                  };
  
                  this.sharedService.deactivateCandidateAccount(deactivatePayload).subscribe(
                    (deactivateRes: { error?: boolean; message?: string }) => {
                      if (!deactivateRes?.error) {
                        (Swal as any).fire({
                          title: 'Success!',
                          text: 'Profile deactivated successfully',
                          icon: 'success',
                          confirmButtonText: 'Ok'
                        }).then((finalResult: any) => {
                          if (finalResult.isConfirmed) {
                            console.log("Logging out...");
                            this.auth.logout();
                          }
                        });
                      } else {
                        (Swal as any).fire({
                          title: 'Error!',
                          text: deactivateRes?.message || "An error occurred while deactivating the account",
                          icon: 'error',
                          confirmButtonText: 'Ok'
                        }).then(() => {
                          this.isLoading$.next(false);
                          this.cdr.detectChanges();
                        });
                      }
                    }
                  );

                } else {
                  (Swal as any).fire({
                    title: 'Error!',
                    text: user?.error || "Invalid password. Please try again.",
                    icon: 'error',
                    confirmButtonText: 'Ok'
                  });
                }
              },
              (error) => {
                console.error("API Error:", error);
                (Swal as any).fire({
                  title: 'Error!',
                  text: "Failed to verify password. Please try again later.",
                  icon: 'error',
                  confirmButtonText: 'Ok'
                });
              }
            );
          });
        }
      }
    });
  }
  
}
