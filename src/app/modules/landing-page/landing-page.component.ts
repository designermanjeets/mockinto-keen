import { Component, Renderer2, HostListener, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
  @ViewChild('termsDialogTemplate', { static: true }) termsDialogTemplate!: TemplateRef<any>;


  // faqs = [
  //   {
  //     question: 'Can this be used for ordinary people with the world of technology?',
  //     answer: 'Our products are very easy to understand even by everyone because they are easy to drag and drop, making them comfortable to use by all people.',
  //     active: false
  //   },
  //   {
  //     question: 'Can it be connected using the WhatsApp application and other social media?',
  //     answer: 'Yes, this product can seamlessly connect with WhatsApp and other popular social media platforms.',
  //     active: false
  //   },
  //   {
  //     question: 'Is there a special rule to make a rule?',
  //     answer: 'No special rules are required. You can customize the rules as per your preferences.',
  //     active: false
  //   },
  //   {
  //     question: 'Can this product be subscribed to every month?',
  //     answer: 'Yes, our subscription model allows for monthly subscriptions, making it flexible for users.',
  //     active: false
  //   }
  // ];


  faqs = [
    {
      question: 'What is MockInto?',
      answer: 'MockInto is an AI-powered platform designed to help you prepare for job interviews through realistic, tailored mock interview sessions with intelligent feedback and guidance.',
      active: false
    },
    {
      question: 'How does MockInto work?',
      answer: 'MockInto uses advanced AI algorithms to simulate interview scenarios based on your role, industry, and experience. It analyzes your responses and provides detailed feedback to improve your skills.',
      active: false
    },
    {
      question: 'What types of interviews can I practice on MockInto?',
      answer: 'MockInto supports a variety of interview types, including technical, behavioral, situational, and leadership interviews, across multiple industries.',
      active: false
    },
    {
      question: 'Can MockInto customize the interview for my specific role?',
      answer: 'Yes, MockInto customizes questions and scenarios based on the job description, industry, and experience level you provide during setup.',
      active: false
    },
    {
      question: 'What kind of feedback does MockInto provide?',
      answer: 'MockInto offers detailed feedback on your communication, content, body language (if video-enabled), and response effectiveness, along with actionable improvement suggestions.',
      active: false
    },
    {
      question: 'Is MockInto suitable for beginners?',
      answer: 'Absolutely! MockInto caters to all experience levels, from fresh graduates to seasoned professionals, with tailored guidance for each user.',
      active: false
    },
    {
      question: 'How can MockInto help improve my confidence?',
      answer: 'By practicing realistic interview scenarios and receiving constructive feedback, you’ll gain familiarity with the process, reducing anxiety and building confidence.',
      active: false
    },
    {
      question: 'Does MockInto track my progress?',
      answer: 'Yes, MockInto provides analytics to track your improvement over time, highlighting strengths and areas requiring further attention.',
      active: false
    },
    {
      question: 'Can I practice for technical interviews with coding challenges?',
      answer: 'Yes, MockInto includes a technical interview feature where you can practice explaining coding problems and receive feedback on your solutions. Coming soon - Practice coding problems by doing.',
      active: false
    },
    {
      question: 'Is MockInto accessible on mobile devices?',
      answer: 'Not yet, our developers working to bring MockInto on Mobile!',
      active: false
    },
    {
      question: 'How long are the mock interview sessions?',
      answer: 'MockInto sessions can be customized, typically ranging from 15 to 60 minutes, depending on your preferences and the type of interview.',
      active: false
    },
    {
      question: 'Does MockInto support multiple languages?',
      answer: 'Not yet, currently we support only “English”.',
      active: false
    },
    {
      question: 'Can I get industry-specific questions on MockInto?',
      answer: 'Yes, MockInto provides industry-specific question sets tailored to your field, ensuring relevance and better preparation.',
      active: false
    },
    {
      question: 'Is MockInto suitable for non-technical roles?',
      answer: 'Yes, MockInto is designed for both technical and non-technical roles, offering comprehensive practice for a wide range of positions.',
      active: false
    },
    {
      question: 'How do I get started with MockInto?',
      answer: 'Getting started is easy! Sign up on our website, enter your job and interview details, and start your first mock interview right away!',
      active: false
    }
  ];

  allPlans: any = [];

  isDialogOpen = false;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private plutoService: StripeMockintoService,
    private sharedService: SharedService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Set the first FAQ as active (open) by default
    this.faqs[0].active = true;

    // Set body class for styling
    this.renderer.addClass(document.body, 'no-background');

    // Set the logo visibility based on the current scroll position
    this.updateLogoVisibility();

    this.fetchAllPlans();
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

  openTermsDialog(): void {
    const dialogRef = this.dialog.open(this.termsDialogTemplate, {
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

  closeDialog(): void {
    this.dialog.closeAll();
  }

}
