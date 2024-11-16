import { ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { StripeMockintoService } from '../services/stripe.service';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/modules/auth';
import { StripeElementsOptions } from '@stripe/stripe-js';
import { injectStripe, StripePaymentElementComponent } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-subscription',
  templateUrl: './create-subscription.component.html',
  styleUrls: ['./create-subscription.component.scss']
})
export class CreateSubscriptionComponent implements OnInit {
  
  allPlans: any = [];

  logginInUser = JSON.parse(localStorage.getItem('auth-user') || '{}') as UserModel;

  @ViewChild(StripePaymentElementComponent) paymentElement!: StripePaymentElementComponent;
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly plutoService = inject(StripeMockintoService);
  readonly stripe = injectStripe(environment.STRIPE_PUBLIC_KEY);

  checkoutForm = this.fb.group({
    name: [this.logginInUser.first_name || '', [Validators.required]],
    email: [this.logginInUser.user_email || '', [Validators.required]],
    address: [this.logginInUser.address || '', [Validators.required]],
    zipcode: ['', [Validators.required]],
    city: ['', [Validators.required]],
    amount: [900, [Validators.required, Validators.pattern(/\d+/)]],
  });

  elementsOptions: StripeElementsOptions = {
    locale: 'en',
    appearance: {
      theme: 'stripe',
      labels: 'floating',
      variables: {
        colorPrimary: '#673ab7',
      },
    },
  };

  paying = signal(false);

  get amount() {
    const amountValue = this.checkoutForm.get('amount')?.value;
    if (!amountValue || amountValue < 0) return 0;

    return Number(amountValue) / 100;
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchAllPlans();


    const amount = this.checkoutForm.get('amount')?.value;
    this.plutoService
      .createPaymentIntent({
        amount: amount,
        currency: 'usd'
      })
      .subscribe((pi) => {
        this.elementsOptions.clientSecret = pi.client_secret as string;
        this.cdRef.detectChanges();
      });
  }


  clear() {
    this.checkoutForm.patchValue({
      name: '',
      email: '',
      address: '',
      zipcode: '',
      city: '',
    });
  }

  collectPayment() {
    if (this.paying() || this.checkoutForm.invalid) return;
    this.paying.set(true);

    const { name, email, address, zipcode, city } =
      this.checkoutForm.getRawValue();

    this.stripe
      .confirmPayment({
        elements: this.paymentElement?.elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: name as string,
              email: email as string,
              address: {
                line1: address as string,
                postal_code: zipcode as string,
                city: city as string,
              },
            },
          },
        },
        redirect: 'if_required',
      })
      .subscribe({
        next: (result) => {
          this.paying.set(false);
          if (result.error) {
            (Swal as any).fire({
              icon: 'error',
              title: 'Oops...',
              text: result.error.message,
            });
          } else if (result.paymentIntent.status === 'succeeded') {
            (Swal as any).fire({
              icon: 'success',
              title: 'Success',
              text: 'Payment completed successfully',
            });
            this.clear();
          }
        },
        error: (err) => {
          this.paying.set(false);
          (Swal as any).fire({
            icon: 'error',
            title: 'Oops...',
            text: err.error.message,
          });
        },
      });
  }

  fetchAllPlans() {
    this.plutoService.getAllPlans().subscribe((res) => {
      if(res) {
        console.log(res);
        this.allPlans = res.data;
        this.cdRef.detectChanges();
      }
    });
  }

}
