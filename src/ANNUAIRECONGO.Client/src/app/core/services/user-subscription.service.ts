import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export type UserSubscriptionStatus = 'Active' | 'ExpiringSoon' | 'Expired' | 'Cancelled' | 'Pending';

export interface UserSubscriptionDto {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planPrice: number;
  status: UserSubscriptionStatus;
  startedAt: string;
  expiresAt: string;
}

export interface SubscribeAsUserRequest {
  planId: string;
  method: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserSubscriptionService {
  private readonly api = inject(ApiService);

  /** GET /user-subscriptions/my — returns the active/latest subscription for the calling RegularUser. */
  getMySubscription(): Observable<UserSubscriptionDto> {
    return this.api.get<UserSubscriptionDto>('/user-subscriptions/my');
  }

  /** POST /user-subscriptions/subscribe — subscribes the calling RegularUser to a plan. */
  subscribe(data: SubscribeAsUserRequest): Observable<UserSubscriptionDto> {
    return this.api.post<UserSubscriptionDto>('/user-subscriptions/subscribe', data);
  }

  /** DELETE /user-subscriptions/{id}/cancel — cancels a UserSubscription. */
  cancel(subscriptionId: string): Observable<void> {
    return this.api.delete<void>(`/user-subscriptions/${subscriptionId}/cancel`);
  }
}
