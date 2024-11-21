import { Component, Renderer2, HostListener, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, OnDestroy {
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

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    // Set the first FAQ as active (open) by default
    this.faqs[0].active = true;

    this.renderer.addClass(document.body, 'no-background');
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'no-background');
  }

  toggleFaq(index: number): void {
    this.faqs[index].active = !this.faqs[index].active;
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const header = document.querySelector('header') as HTMLElement;
    const defaultLogo = document.querySelector('.def-logo') as HTMLElement;
    const fixedLogo = document.querySelector('.fix-logo') as HTMLElement;

    if (window.scrollY >= 100) {
      // Change header background and add shadow
      this.renderer.setStyle(header, 'backgroundColor', '#ffffff');
      this.renderer.setStyle(header, 'boxShadow', '0px 4px 6px rgba(0, 0, 0, 0.1)');
      // Toggle logo visibility
      this.renderer.setStyle(defaultLogo, 'display', 'none'); // Hide default logo
      this.renderer.setStyle(fixedLogo, 'display', 'block');  // Show fixed logo
    } else {
      // Revert header background and shadow
      this.renderer.removeStyle(header, 'backgroundColor');
      this.renderer.removeStyle(header, 'boxShadow');
      // Toggle logo visibility
      this.renderer.setStyle(defaultLogo, 'display', 'block'); // Show default logo
      this.renderer.setStyle(fixedLogo, 'display', 'none');   // Hide fixed logo
    }
  }
}
