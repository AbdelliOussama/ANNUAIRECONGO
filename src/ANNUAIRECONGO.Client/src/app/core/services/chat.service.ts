import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly api = inject(ApiService);

  sendChatMessage(message: string, history: ChatMessage[]): Observable<{ response: string }> {
    return this.api.post<{ response: string }>('/api/v1/ai/chat', { message, history });
  }
}
