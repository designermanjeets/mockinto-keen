import { Component, Renderer2, HostListener, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, TemplateRef, NgZone } from '@angular/core';
import { LayoutService } from '../../core/layout.service';
import { NgForm } from '@angular/forms';  
import { Router } from '@angular/router';
import { SharedService } from 'src/app/pages/services/shared.service';
import { StripeMockintoService } from 'src/app/pages/services/stripe.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  @ViewChild('supprtDialogTemplate', { static: true }) supprtDialogTemplate!: TemplateRef<any>;
  footerContainerCssClasses: string = '';
  currentDateStr: string = new Date().getFullYear().toString();
  isDialogOpen = false;
  constructor(private layout: LayoutService,
    private sharedService: SharedService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,


  ) {}

  ngOnInit(): void {
    this.footerContainerCssClasses =
      this.layout.getStringCSSClasses('footerContainer');
  }

  submitTicketData(email:any,message:any) {
      this.sharedService.submitTicket(email,message).subscribe(
        (data) => {
          if(data) {
            console.log(data.message);
  
            (Swal as any).fire({
            icon: 'success',
            title: 'Success',
            text: data.message,
          }).then(() => { 
          });
          } else {
            (Swal as any).fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'Something went wrong. Please try again later.',
                    }).then(() => {
                    });
          }
        }
      );
    }
  
    formData = { email: '', message: '' };
    submitForm(myForm: NgForm) {
      if (myForm.invalid) {
        alert("Please fill out all required fields.");
        return;
      }
      console.log('Form submitted:', this.formData);
      this.submitTicketData(this.formData.email, this.formData.message)
      myForm.resetForm();
    }



    openSupportDialog(){
      const dialogRef = this.dialog.open(this.supprtDialogTemplate, {
        width: '800px',
      });
  
      dialogRef.afterOpened().subscribe(() => {
        this.isDialogOpen = true;
        this.cdRef.detectChanges();
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        this.isDialogOpen = false;
        this.cdRef.detectChanges();
      });
  
    }


}
