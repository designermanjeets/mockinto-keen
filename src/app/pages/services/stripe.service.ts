import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { PaymentIntent } from '@stripe/stripe-js';

@Injectable({ providedIn: 'root' })

export class StripeMockintoService {
    private authLocalStorageToken = `auth-user`;

    private static readonly STRIPE_BASE_URL = 'https://api.stripe.com/v1';
    STRIPE_PUBLIC_KEY = "pk_test_51QA7S8AWH1At8PiUavNwOL5XwoiIMBb6wS5YjDBlKnjHZr2a703Xwdbkjn0wjyiZ83XaqaoBXoZifc85weR8SeoB00IZPZtpH0";
    STRIPE_SECRET_KEY = "sk_test_51QA7S8AWH1At8PiUzUgL0hKv5UQyQ4lpQuDWLdwMvk8iSxbviNDzTfCAEZOgF5DXMI7IZFiXR9ikaZ2YTrDxH0PQ00GsKMNpLf";
    HEADERS = {
        'Authorization': `Bearer ${this.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    authUser = JSON.parse(localStorage.getItem(this.authLocalStorageToken) || '{}');


    constructor(
        private readonly http: HttpClient
    ) { }

    createPaymentIntent(params: any): Observable<PaymentIntent> {
        const payload = new URLSearchParams(params);
        const metadata = {
            candidateId: this.authUser.candidates[0].id,
            tenantId: this.authUser.tenant_id,
        };
        params.metadata = metadata;
        Object.keys(params).forEach(key => {
            if (key === 'metadata') {
                Object.keys(params.metadata).forEach(metaKey => {
                    payload.append(`metadata[${metaKey}]`, params.metadata[metaKey]);
                });
            } else {
                payload.append(key, params[key]);
            }
        });
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

    // createCustomer(params: any):Observable<any>{
    //     const payload = new URLSearchParams(params);
    //     return this.http.post<any>(
    //         `${StripeMockintoService.STRIPE_BASE_URL}/customers`, payload.toString(), { headers: this.HEADERS }
    //     );
    // }

    createCustomer(params: any,candidateId:any,tenantId:any): Observable<any> {
        // Add candidateId and tenantId to the metadata object
        const metadata = {
            candidateId: candidateId,
            tenantId: tenantId,
        };
        params.metadata = metadata;
        const payload = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (key === 'metadata') {
                Object.keys(params.metadata).forEach(metaKey => {
                    payload.append(`metadata[${metaKey}]`, params.metadata[metaKey]);
                });
            } else {
                payload.append(key, params[key]);
            }
        });
    
        return this.http.post<any>(
            `${StripeMockintoService.STRIPE_BASE_URL}/customers`,
            payload.toString(),
            { headers: this.HEADERS }
        );
    }


    getProducts(limit: number): Observable<any> {
        return this.http.get<any>(
            `${StripeMockintoService.STRIPE_BASE_URL}/products`,{ headers: this.HEADERS , params: { limit: limit.toString() }}
        );
    } 
    
    
    createSubscription(productPrice:any,stripeCustomerId:any,candidateId:any,tenantId:any): Observable<any>{
        const payload = new URLSearchParams();
        payload.append('customer', stripeCustomerId);
        payload.append('items[0][price]', productPrice);
        const metadata: { [key: string]: any } = {
            candidateId: candidateId,
            tenantId: tenantId,
            customerId: stripeCustomerId,
            productPrice: productPrice,
          };
        Object.keys(metadata).forEach((key) => {
            payload.append(`metadata[${key}]`, metadata[key]);
        });
    
        return this.http.post<any>(
            `${StripeMockintoService.STRIPE_BASE_URL}/subscriptions `, payload.toString(), { headers: this.HEADERS }
        );
    }

}
