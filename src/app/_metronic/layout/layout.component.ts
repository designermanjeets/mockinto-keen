import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { LayoutService } from './core/layout.service';
import { LayoutInitService } from './core/layout-init.service';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';  
import { Router } from '@angular/router';
import { SharedService } from 'src/app/pages/services/shared.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, AfterViewInit {
  // Public variables
  selfLayout = 'default';
  asideSelfDisplay: true;
  asideMenuStatic: true;
  contentClasses = '';
  contentContainerClasses = '';
  toolbarDisplay = true;
  contentExtended: false;
  asideCSSClasses: string;
  asideHTMLAttributes: any = {};
  headerMobileClasses = '';
  headerMobileAttributes = {};
  footerDisplay: boolean;
  footerCSSClasses: string;
  headerCSSClasses: string;
  headerHTMLAttributes: any = {};
  // offcanvases
  extrasSearchOffcanvasDisplay = false;
  extrasNotificationsOffcanvasDisplay = false;
  extrasQuickActionsOffcanvasDisplay = false;
  extrasCartOffcanvasDisplay = false;
  extrasUserOffcanvasDisplay = false;
  extrasQuickPanelDisplay = false;
  extrasScrollTopDisplay = false;
  asideDisplay: boolean;
  @ViewChild('ktAside', { static: true }) ktAside: ElementRef;
  @ViewChild('ktHeaderMobile', { static: true }) ktHeaderMobile: ElementRef;
  @ViewChild('ktHeader', { static: true }) ktHeader: ElementRef;



  contactForm: FormGroup;
  email : any;
  message : any;

  constructor(
    private initService: LayoutInitService,
    private layout: LayoutService,
    private router: Router,    
    private sharedService: SharedService,
  ) {
    this.initService.init();
  }

  ngOnInit(): void {
    // build view by layout config settings
    this.asideDisplay = this.layout.getProp('aside.display') as boolean;
    this.toolbarDisplay = this.layout.getProp('toolbar.display') as boolean;
    this.contentContainerClasses = this.layout.getStringCSSClasses('contentContainer');
    this.asideCSSClasses = this.layout.getStringCSSClasses('aside');
    this.headerCSSClasses = this.layout.getStringCSSClasses('header');
    this.headerHTMLAttributes = this.layout.getHTMLAttributes('headerMenu');
    const loggedInUser = JSON.parse(localStorage.getItem('auth-user') || '{}');
    this.email = loggedInUser.email_id;
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
  
    formData = {  message: '' };
    submitForm(myForm: NgForm) {
      if (myForm.invalid) {
        alert("Please fill out all required fields.");
        return;
      }
      console.log('Form submitted:', this.formData);
      this.submitTicketData(this.email, this.formData.message)
      myForm.resetForm();
    }
  



  ngAfterViewInit(): void {
    if (this.ktHeader) {
      for (const key in this.headerHTMLAttributes) {
        if (this.headerHTMLAttributes.hasOwnProperty(key)) {
          this.ktHeader.nativeElement.attributes[key] =
            this.headerHTMLAttributes[key];
        }
      }
    }
  }
}
