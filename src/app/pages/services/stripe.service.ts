import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { PaymentIntent } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';

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
        const candidateId = this.authUser.candidates && this.authUser.candidates.length > 0 ? this.authUser.candidates[0].id : null;
        const tenantId = this.authUser.tenant_id;
        const metadata = {
            candidateId: candidateId,
            tenantId: tenantId,
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


    createCheckoutSession(params: any): Observable<any> {
        const payload = new URLSearchParams();
      
        // Extract user details for metadata
        const candidateId = this.authUser.candidates && this.authUser.candidates.length > 0 
          ? this.authUser.candidates[0].id 
          : null;
        const tenantId = this.authUser.tenant_id;
      
        // Define metadata with explicit typing
        const metadata: Record<string, string | null> = {
          candidateId: candidateId,
          tenantId: tenantId,
        };
      
        // Required Stripe Checkout Session parameters
        payload.append('payment_method_types[]', 'card'); // Define accepted payment methods
        payload.append('mode', 'payment'); // Payment mode
        payload.append('success_url', params.successUrl); // Redirect URL on success
        payload.append('cancel_url', params.cancelUrl); // Redirect URL on cancel
      
        // Add line items for the checkout session
        params.line_items.forEach((item: any, index: number) => {
          payload.append(`line_items[${index}][price_data][currency]`, item.currency);
          payload.append(`line_items[${index}][price_data][product_data][name]`, item.name);
          payload.append(`line_items[${index}][price_data][unit_amount]`, item.amount.toString()); // Amount in cents
          payload.append(`line_items[${index}][quantity]`, item.quantity.toString());
        });
      
        // Add metadata to the payload
        Object.entries(metadata).forEach(([metaKey, metaValue]) => {
          if (metaValue !== null) { // Ensure metadata values are not null
            payload.append(`metadata[${metaKey}]`, metaValue);
          }
        });
      
        // Send the request to Stripe's Checkout Session API
        return this.http.post<any>(
          `${StripeMockintoService.STRIPE_BASE_URL}/checkout/sessions`,
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
            `${StripeMockintoService.STRIPE_BASE_URL}/subscriptions`, payload.toString(), { headers: this.HEADERS }
        );
    }






    confirmPaymentIntent(sessionIntentId: any, paymentMethod: any) {
      const payload = new URLSearchParams();
      payload.append('payment_method', paymentMethod);
      return this.http.post<any>(
        `${StripeMockintoService.STRIPE_BASE_URL}/setup_intents/${sessionIntentId}/confirm `,
        payload.toString(),
        { headers: this.HEADERS }
      );
    }


 

    createPaymentMethod(params: any) {
        const payload = new URLSearchParams(params);  // Now params are flattened
        return this.http.post<any>(
          `${StripeMockintoService.STRIPE_BASE_URL}/payment_methods`,
          payload.toString(), 
          { headers: this.HEADERS }
        );
      }


   customerPaymentAttach(paymentMethodId:any, params:any){
    
    const payload = new URLSearchParams(params);  
        return this.http.post<any>(
          `${StripeMockintoService.STRIPE_BASE_URL}/payment_methods/${paymentMethodId}/attach `,
          payload.toString(), 
          { headers: this.HEADERS }
        );

}




    getSubscription(limit: number): Observable<any> {
        return this.http.get<any>(
            `${StripeMockintoService.STRIPE_BASE_URL}/subscriptions`,{ headers: this.HEADERS , params: { limit: limit.toString() }}
        );
    } 



    getSessionById(sessionId: any): Observable<any> {
      return this.http.get<any>(
          `${StripeMockintoService.STRIPE_BASE_URL}/checkout/sessions/${sessionId}`,{ headers: this.HEADERS }
      );
  } 

    updateCustomer(customerId: string, updatedData: any): Observable<any> {
       
        const payload = new URLSearchParams();
      
       
        const flattenObject = (obj: any, parentKey = '') => {
          for (const [key, value] of Object.entries(obj)) {
            const newKey = parentKey ? `${parentKey}[${key}]` : key;
            if (typeof value === 'object' && value !== null) {
              flattenObject(value, newKey); 
            } else {
              payload.append(newKey, value as string);
            }
          }
        };
      
        flattenObject(updatedData);
      
        return this.http.post<any>(
          `${StripeMockintoService.STRIPE_BASE_URL}/customers/${customerId}`, 
          payload.toString(), 
          { headers: this.HEADERS } 
        );
      }
      

  

      createSetupIntent(params: any) {
        return this.http.post<any>(
          `${StripeMockintoService.STRIPE_BASE_URL}/setup_intents`,
          params, 
          { headers: this.HEADERS } 
        );
      }
      




      createSession(params: any) { 
        console.log("params",params)
        const payload = new URLSearchParams();
      
        payload.set('line_items[0][price]', params.price);  
        payload.set('line_items[0][quantity]', '1');
        payload.set('mode', 'subscription');
        payload.set('success_url', `${environment.apiUrl}/dashboard/successful-payment`);
      
        return this.http.post<any>(
          `${StripeMockintoService.STRIPE_BASE_URL}/checkout/sessions`,
          payload.toString(),  
          { headers: this.HEADERS }
        );
      }

     

    getCustomerDetails(customerId: string): Observable<any> {
        return this.http.get<any>(
          `${StripeMockintoService.STRIPE_BASE_URL}/customers/${customerId}`,
          { headers: this.HEADERS }
        );
      }


      retriveCheckoutSession(sessionId:any): Observable<any> {
        return this.http.get<any>(
          `${StripeMockintoService.STRIPE_BASE_URL}/checkout/sessions/${sessionId}/line_items`,
          { headers: this.HEADERS }
        );
      }
      
    


    updateSubscription(subscriptionId:any,productPrice:any,stripeCustomerId:any,candidateId:any,tenantId:any): Observable<any>{
        const payload = new URLSearchParams();
       // payload.append('customer', stripeCustomerId);
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
            `${StripeMockintoService.STRIPE_BASE_URL}/subscriptions/${subscriptionId}`, payload.toString(), { headers: this.HEADERS }
        );
    }


    deleteSubscription(subscriptionId:any){
        return this.http.delete<any>(
            `${StripeMockintoService.STRIPE_BASE_URL}/subscriptions/${subscriptionId}`, { headers: this.HEADERS }
        );

    }

    }



