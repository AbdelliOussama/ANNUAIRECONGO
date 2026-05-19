import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';

@Component({
  selector: 'ac-ai-chat-widget',
  standalone: true,
  template: `
    <!-- Floating Chat Trigger Button -->
    <button 
      (click)="toggleChat()" 
      class="chat-trigger-btn flex items-center justify-center relative"
      [class.active]="isOpen()"
      type="button" 
      aria-label="Assistant IA">
      @if (isOpen()) {
        <span class="material-symbols-outlined text-white text-2xl transition-transform duration-300 rotate-90">close</span>
      } @else {
        <span class="material-symbols-outlined text-white text-2xl animate-sparkle">psychology</span>
        <span class="pulse-ring"></span>
        <span class="pulse-ring-slow"></span>
      }
    </button>

    <!-- Chat Window Container -->
    @if (isOpen()) {
      <div class="chat-window-container glass-panel flex flex-col overflow-hidden">
        <!-- Chat Header -->
        <div class="chat-header flex items-center justify-between p-4 border-b border-outline-variant/30">
          <div class="flex items-center gap-3">
            <div class="bot-avatar flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-xl">smart_toy</span>
            </div>
            <div>
              <h3 class="text-sm font-black font-headline text-foreground flex items-center gap-1.5">
                <span>CongoBot</span>
                <span class="active-indicator"></span>
              </h3>
              <p class="text-[10px] text-primary font-bold uppercase tracking-wider">Assistant IA Congo</p>
            </div>
          </div>
          <button (click)="toggleChat()" class="btn-close-chat flex items-center justify-center" type="button">
            <span class="material-symbols-outlined text-sm">minimize</span>
          </button>
        </div>

        <!-- Chat Messages List -->
        <div 
          #scrollContainer
          class="chat-messages-list flex-1 overflow-y-auto p-4 space-y-4"
          (click)="handleMessageClick($event)">
          
          <!-- Bot Welcome Message -->
          <div class="flex items-start gap-2.5">
            <div class="avatar-mini flex items-center justify-center mt-1">
              <span class="material-symbols-outlined text-white text-xs">smart_toy</span>
            </div>
            <div class="message-bubble assistant">
              <p class="text-sm leading-relaxed text-slate-800">
                Bonjour ! Je suis **CongoBot 🤖**, votre conseiller économique personnel. 
                Posez-moi des questions sur les entreprises du Congo-Brazzaville, nos secteurs, ou le fonctionnement de la plateforme !
              </p>
            </div>
          </div>

          <!-- Message History -->
          @for (msg of messages(); track $index) {
            <div class="flex items-start gap-2.5" [class.justify-end]="msg.role === 'user'">
              @if (msg.role === 'assistant') {
                <div class="avatar-mini flex items-center justify-center mt-1">
                  <span class="material-symbols-outlined text-white text-xs">smart_toy</span>
                </div>
              }
              <div 
                class="message-bubble" 
                [class.user]="msg.role === 'user'" 
                [class.assistant]="msg.role === 'assistant'"
                [innerHTML]="formatContent(msg.content)">
              </div>
            </div>
          }

          <!-- Bot Typing Indicator -->
          @if (isThinking()) {
            <div class="flex items-start gap-2.5">
              <div class="avatar-mini flex items-center justify-center mt-1">
                <span class="material-symbols-outlined text-white text-xs">smart_toy</span>
              </div>
              <div class="message-bubble assistant flex items-center gap-1.5 py-3 px-4">
                <span class="dot-bounce"></span>
                <span class="dot-bounce delay-150"></span>
                <span class="dot-bounce delay-300"></span>
              </div>
            </div>
          }
        </div>

        <!-- Quick Suggestions Panel (Shown when conversation is quiet) -->
        @if (messages().length === 0 && !isThinking()) {
          <div class="suggestions-panel px-4 py-2 border-t border-outline-variant/10 bg-slate-50/50 flex flex-wrap gap-1.5">
            @for (s of suggestions; track s.text) {
              <button 
                (click)="sendSuggestion(s.text)"
                class="suggestion-btn text-[11px] font-semibold py-1.5 px-3 border border-outline-variant/30 rounded-full transition-all text-slate-700 bg-white"
                type="button">
                {{ s.label }}
              </button>
            }
          </div>
        }

        <!-- Chat Input Form -->
        <form (submit)="sendMessage($event)" class="chat-input-form flex items-center gap-2 p-3 border-t border-outline-variant/20 bg-surface">
          <input 
            #chatInput
            type="text" 
            placeholder="Écrivez votre message..." 
            class="chat-input flex-1 px-4 py-2.5 rounded-full border border-outline bg-surface text-foreground text-sm"
            [disabled]="isThinking()"
            aria-label="Message"
            required />
          
          <button 
            type="submit" 
            class="chat-send-btn flex items-center justify-center" 
            [disabled]="isThinking()">
            <span class="material-symbols-outlined text-white text-md">send</span>
          </button>
        </form>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    /* Floating trigger buttons with double pulsing glow effects */
    .chat-trigger-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary), #7c3aed);
      box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
      z-index: 99999;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
    }
    .chat-trigger-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(124, 58, 237, 0.5);
    }
    .chat-trigger-btn.active {
      transform: rotate(90deg);
      background: var(--color-surface-container-highest);
      color: var(--color-on-surface);
      border: 1px solid var(--color-outline-variant);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .chat-trigger-btn.active .material-symbols-outlined {
      color: var(--color-on-surface) !important;
    }

    .pulse-ring, .pulse-ring-slow {
      position: absolute;
      inset: -4px;
      border: 2px solid var(--color-primary);
      border-radius: 50%;
      opacity: 0;
      animation: pulseGlow 2s infinite linear;
      pointer-events: none;
    }
    .pulse-ring-slow {
      animation-delay: 1s;
    }
    @keyframes pulseGlow {
      0% { transform: scale(0.95); opacity: 0.8; }
      100% { transform: scale(1.25); opacity: 0; }
    }

    /* Glassmorphic Chat Window Container */
    .chat-window-container {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 380px;
      height: 520px;
      border-radius: var(--radius-2xl);
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      border: 1px solid var(--color-outline-variant);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
      z-index: 99998;
      animation: slideUpSpring 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15);
    }
    @keyframes slideUpSpring {
      from { transform: translateY(30px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    /* Header & Avatar Styling */
    .bot-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary), #7c3aed);
    }
    .avatar-mini {
      width: 24px; height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary), #7c3aed);
      flex-shrink: 0;
    }
    .active-indicator {
      width: 6px; height: 6px;
      background: var(--color-success, #22c55e);
      border-radius: 50%;
      display: inline-block;
    }
    .btn-close-chat {
      width: 28px; height: 28px;
      border-radius: 50%;
      color: var(--color-outline);
      transition: background 0.2s;
    }
    .btn-close-chat:hover {
      background: rgba(0, 0, 0, 0.05);
      color: var(--color-on-surface);
    }

    /* Bubbles & Message Layout */
    .message-bubble {
      padding: 12px 16px;
      border-radius: 20px;
      max-width: 85%;
      font-size: 13px;
      line-height: 1.5;
    }
    .message-bubble.assistant {
      background: var(--color-surface-container-low, #f1f5f9);
      color: var(--color-on-surface, #1e293b);
      border-top-left-radius: 4px;
    }
    .message-bubble.user {
      background: linear-gradient(135deg, var(--color-primary), #7c3aed);
      color: #ffffff;
      border-top-right-radius: 4px;
    }

    /* Markdown anchors inside bubbles */
    ::ng-deep .message-bubble a {
      color: #3b82f6;
      font-weight: 700;
      text-decoration: underline;
      transition: color 0.2s;
    }
    ::ng-deep .message-bubble.user a {
      color: #fff;
    }
    ::ng-deep .message-bubble a:hover {
      color: #1d4ed8;
    }

    /* Form & Input controls */
    .chat-input {
      border: 1px solid var(--color-outline-variant);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .chat-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
    }
    .chat-send-btn {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      transition: transform 0.2s, background 0.2s;
    }
    .chat-send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      background: #7c3aed;
    }
    .chat-send-btn:disabled {
      background: var(--color-outline-variant);
      cursor: not-allowed;
    }

    /* Suggestion Pills */
    .suggestion-btn {
      transition: all 0.2s;
    }
    .suggestion-btn:hover {
      background: var(--color-primary-fixed-dim);
      border-color: var(--color-primary);
      color: var(--color-primary);
      transform: translateY(-1px);
    }

    /* Bouncing typing indicators */
    .dot-bounce {
      width: 6px; height: 6px;
      background: var(--color-outline);
      border-radius: 50%;
      animation: bounce 1.2s infinite ease-in-out;
    }
    .delay-150 { animation-delay: 0.15s; }
    .delay-300 { animation-delay: 0.3s; }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
  `],
})
export class AiChatWidgetComponent implements AfterViewChecked {
  private readonly chatService = inject(ChatService);
  private readonly router = inject(Router);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef;

  protected readonly isOpen = signal<boolean>(false);
  protected readonly isThinking = signal<boolean>(false);
  protected readonly messages = signal<ChatMessage[]>([]);

  protected readonly suggestions = [
    { label: '🏦 Banques à Brazzaville', text: 'Quelles sont les banques enregistrées à Brazzaville ?' },
    { label: '✨ Badge Vérifié ?', text: 'Comment obtenir le badge vérifié sur ma fiche ?' },
    { label: '⭐ Trust Score ?', text: "Qu'est-ce que le Trust Score et comment est-il calculé ?" },
    { label: '💼 Enregistrer ma fiche', text: 'Comment enregistrer mon entreprise sur la plateforme ?' }
  ];

  toggleChat(): void {
    this.isOpen.update(val => !val);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        const element = this.scrollContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      } catch (err) {
        console.error('Scroll error', err);
      }
    }
  }

  sendSuggestion(text: string): void {
    this.executeMessageSend(text);
  }

  sendMessage(event: Event): void {
    event.preventDefault();
    if (!this.chatInput) return;

    const inputEl = this.chatInput.nativeElement as HTMLInputElement;
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    this.executeMessageSend(text);
  }

  private executeMessageSend(text: string): void {
    // 1. Append user message
    const userMsg: ChatMessage = { role: 'user', content: text };
    this.messages.update(curr => [...curr, userMsg]);

    // 2. Trigger bot thinking
    this.isThinking.set(true);

    // 3. Make API request carrying history context
    this.chatService.sendChatMessage(text, this.messages()).subscribe({
      next: (res) => {
        const botMsg: ChatMessage = { role: 'assistant', content: res.response };
        this.messages.update(curr => [...curr, botMsg]);
        this.isThinking.set(false);
      },
      error: (err) => {
        console.error(err);
        const errorMsg: ChatMessage = { 
          role: 'assistant', 
          content: "Désolé, je rencontre une difficulté technique pour me connecter à mon serveur. Veuillez réessayer." 
        };
        this.messages.update(curr => [...curr, errorMsg]);
        this.isThinking.set(false);
      }
    });
  }

  formatContent(content: string): string {
    if (!content) return '';
    try {
      let html = String(content);
      // Double asterisks to Bold
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');
      // Markdown links: [Text](url)
      html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="chat-deep-link">$1</a>');
      // Format simple newlines to linebreaks
      html = html.replace(/\n/g, '<br />');
      return html;
    } catch (e) {
      console.error(e);
      return content;
    }
  }

  handleMessageClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (href && href.startsWith('/')) {
        event.preventDefault();
        // Dynamic router navigation
        this.router.navigateByUrl(href);
        // Soft close chat overlay on routing
        this.isOpen.set(false);
      }
    }
  }
}
