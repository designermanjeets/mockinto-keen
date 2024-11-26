import { Component, Renderer2, HostListener, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/pages/services/shared.service';
import { StripeMockintoService } from 'src/app/pages/services/stripe.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  @ViewChild('featuresSection') featuresSection!: ElementRef;
  @ViewChild('faqSection') faqSection!: ElementRef;
  @ViewChild('allPlanSection') allPlanSection!: ElementRef;


  faqs = [
    {
      question: 'Can this be used for ordinary people with the world of technology?',
      answer: 'Our products are very easy to understand even by everyone because they are easy to drag and drop, making them comfortable to use by all people.',
      active: false
    },
    {
      question: 'Can it be connected using the WhatsApp application and other social media?',
      answer: 'Yes, this product can seamlessly connect with WhatsApp and other popular social media platforms.',
      active: false
    },
    {
      question: 'Is there a special rule to make a rule?',
      answer: 'No special rules are required. You can customize the rules as per your preferences.',
      active: false
    },
    {
      question: 'Can this product be subscribed to every month?',
      answer: 'Yes, our subscription model allows for monthly subscriptions, making it flexible for users.',
      active: false
    }
  ];

  allPlans: any = [];

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private plutoService: StripeMockintoService,
    private sharedService: SharedService,
  ) {}

  ngOnInit(): void {
    // Set the first FAQ as active (open) by default
    this.faqs[0].active = true;

    // Set body class for styling
    this.renderer.addClass(document.body, 'no-background');

    // Set the logo visibility based on the current scroll position
    this.updateLogoVisibility();

    this.fetchAllPlans();
    this.getConfig();
  }


  getConfig(){
    this.sharedService.isLoadingSubject?.next(true);
    this.sharedService.getConfigAll().subscribe(
      data => {
        if(data) {
          // Without Token Need Plans Data
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

  ngOnDestroy(): void {
    // Clean up when component is destroyed
    this.renderer.removeClass(document.body, 'no-background');
  }

  toggleFaq(index: number): void {
    this.faqs[index].active = !this.faqs[index].active;
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.updateLogoVisibility();
  }

  private updateLogoVisibility(): void {
    const header = document.querySelector('header') as HTMLElement;
    const defaultLogo = document.querySelector('.def-logo') as HTMLElement;
    const fixedLogo = document.querySelector('.fix-logo') as HTMLElement;
    const navLinks = document.querySelectorAll('header li a') as NodeListOf<HTMLAnchorElement>;

    // Check scroll position and update styles
    if (window.scrollY >= 100) {
      // Change header background and add shadow
      this.renderer.setStyle(header, 'backgroundColor', '#ffffff');
      this.renderer.setStyle(header, 'boxShadow', '0px 4px 6px rgba(0, 0, 0, 0.1)');
      // Toggle logo visibility
      this.renderer.setStyle(defaultLogo, 'display', 'none'); // Hide default logo
      this.renderer.setStyle(fixedLogo, 'display', 'block');  // Show fixed logo
      // Change the color of anchor links to black
      navLinks.forEach((link) => this.renderer.setStyle(link, 'color', 'black'));
    } else {
      // Revert header background and shadow
      this.renderer.removeStyle(header, 'backgroundColor');
      this.renderer.removeStyle(header, 'boxShadow');
      // Toggle logo visibility
      this.renderer.setStyle(defaultLogo, 'display', 'block'); // Show default logo
      this.renderer.setStyle(fixedLogo, 'display', 'none');   // Hide fixed logo
      // Revert the color of anchor links
      navLinks.forEach((link) => this.renderer.removeStyle(link, 'color'));
    }
  }

  selectplan(event: Event, plan?: string) {
    event.stopImmediatePropagation();
    switch (plan) {
      case 'starter':
        this.router.navigate(['/auth/registration'], { queryParams: { plan: 'starter' } });
        break;

      case 'advanced':
        this.router.navigate(['/auth/registration'], { queryParams: { plan: 'advanced' } });
        break;

      case 'enterprise':
        this.router.navigate(['/auth/registration'], { queryParams: { plan: 'enterprise' } });
        break;
      default:
        break;
    }
  }

  signIn(): void {
    this.router.navigate(['/auth/login']);
  }

  signUp(): void {
    this.router.navigate(['/auth/registration'], { queryParams: { plan: 'starter' } });
  }

  getPlans(): void {

  }

  scrollToFeatures(): void {
    if (this.featuresSection) {
      this.featuresSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start', 
      });
    }
  }

  scrollToFaq(): void {
    if (this.faqSection) {
      this.faqSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start', 
      });
    }
  }

  scrollToAllPlan(): void {
    if (this.allPlanSection) {
      this.allPlanSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start', 
      });
    }
  }

}
