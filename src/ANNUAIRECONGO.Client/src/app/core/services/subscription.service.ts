import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Subscription, Payment } from '../models/company.model';

export interface SubscribeRequest {
  companyId: string;
  planId: string;
  method: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly api = inject(ApiService);

  createSubscription(data: SubscribeRequest): Observable<Subscription> {
    return this.api.post<Subscription>('/api/v1.0/subscriptions', data);
  }

  cancelSubscription(subscriptionId: string): Observable<Subscription> {
    return this.api.put<Subscription>(`/api/v1.0/subscriptions/${subscriptionId}/cancel`, {});
  }

  getCompanySubscriptions(companyId: string): Observable<Subscription[]> {
    return this.api.get<Subscription[]>(`/api/v1.0/subscriptions/company/${companyId}`);
  }

  confirmPayment(paymentId: string): Observable<Payment> {
    return this.api.put<Payment>(`/api/v1.0/subscriptions/payments/${paymentId}/confirm`, {});
  }

  refundPayment(paymentId: string): Observable<Payment> {
    return this.api.put<Payment>(`/api/v1.0/subscriptions/payments/${paymentId}/Refund`, {});
  }

  rejectPayment(paymentId: string, reason: string): Observable<Payment> {
    return this.api.put<Payment>(`/api/v1.0/subscriptions/payments/${paymentId}/Reject`, reason);
  }

  getCompanyPayments(companyId: string): Observable<Payment[]> {
    return this.api.get<Payment[]>(`/api/v1.0/subscriptions/payments/company/${companyId}`);
  }
}