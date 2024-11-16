import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { PaymentIntent } from '@stripe/stripe-js';

@Injectable({ providedIn: 'root' })

export class StripeMockintoService {

    private static readonly STRIPE_BASE_URL = 'https://api.stripe.com/v1';
    STRIPE_PUBLIC_KEY = "pk_test_51QA7S8AWH1At8PiUavNwOL5XwoiIMBb6wS5YjDBlKnjHZr2a703Xwdbkjn0wjyiZ83XaqaoBXoZifc85weR8SeoB00IZPZtpH0";
    STRIPE_SECRET_KEY = "sk_test_51QA7S8AWH1At8PiUzUgL0hKv5UQyQ4lpQuDWLdwMvk8iSxbviNDzTfCAEZOgF5DXMI7IZFiXR9ikaZ2YTrDxH0PQ00GsKMNpLf";
    HEADERS = {
        'Authorization': `Bearer ${this.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    constructor(
        private readonly http: HttpClient
    ) { }

    createPaymentIntent(params: any): Observable<PaymentIntent> {
        const payload = new URLSearchParams(params);
        return this.http.post<PaymentIntent>(
            `${StripeMockintoService.STRIPE_BASE_URL}/payment_intents`, payload.toString(), { headers: this.HEADERS }
        );
    }

    getPaymentHistory(): Observable<any> {
        return this.http.get<any>(
            `${StripeMockintoService.STRIPE_BASE_URL}/payment_intents`, { headers: this.HEADERS }
        );
    }

    getAllPlans(): Observable<any> {
        return this.http.get<any>(
            `${StripeMockintoService.STRIPE_BASE_URL}/plans`, { headers: this.HEADERS }
        );
    }

}
