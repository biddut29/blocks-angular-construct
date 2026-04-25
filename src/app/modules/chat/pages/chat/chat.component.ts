// ─── Chat Component ────────────────────────────────────────────────────────────
// Mirrors: src/modules/chat/pages/ChatPage.tsx in React project
import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ElementRef,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSend,
  lucideSearch,
  lucideMessageSquare,
  lucideCircle,
  lucidePaperclip,
  lucideSmile,
} from '@ng-icons/lucide';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import { ChatService } from '../../services/chat.service';
import { ChatConversation, ChatMessage } from '../../../../models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, NgIconComponent, HlmInput, HlmButton],
  viewProviders: [
    provideIcons({
      lucideSend,
      lucideSearch,
      lucideMessageSquare,
      lucideCircle,
      lucidePaperclip,
      lucideSmile,
    }),
  ],
  template: `
    <div
      class="flex h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm m-6"
    >
      <!-- ── Left Panel: Conversation List ─────────────────────── -->
      <div class="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <!-- Header -->
        <div class="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Messages</h2>
          <div class="relative">
            <ng-icon
              name="lucideSearch"
              size="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            ></ng-icon>
            <input
              hlmInput
              [(ngModel)]="searchQuery"
              placeholder="Search conversations..."
              class="w-full pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>

        <!-- Conversations -->
        <div class="flex-1 overflow-y-auto">
          @for (conv of filteredConversations(); track conv.conversationId) {
            <button
              (click)="selectConversation(conv)"
              class="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50 text-left"
              [class.bg-indigo-50]="activeConversation()?.conversationId === conv.conversationId"
              [class.dark:bg-indigo-900/20]="
                activeConversation()?.conversationId === conv.conversationId
              "
            >
              <!-- Avatar -->
              <div class="relative flex-shrink-0">
                <div
                  class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm"
                >
                  {{ getInitials(conv) }}
                </div>
                @if (isOnline(conv)) {
                  <span
                    class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"
                  ></span>
                }
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-900 dark:text-white truncate">{{
                    getConvName(conv)
                  }}</span>
                  @if (conv.lastMessage) {
                    <span class="text-xs text-gray-400 flex-shrink-0 ml-2">{{
                      conv.lastMessage.createdAt | date: 'shortTime'
                    }}</span>
                  }
                </div>
                @if (conv.lastMessage) {
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {{ conv.lastMessage.content }}
                  </p>
                }
              </div>

              <!-- Unread Badge -->
              @if (conv.unreadCount > 0) {
                <span
                  class="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center"
                >
                  {{ conv.unreadCount }}
                </span>
              }
            </button>
          }
        </div>
      </div>

      <!-- ── Right Panel: Message Thread ───────────────────────── -->
      <div class="flex-1 flex flex-col min-w-0">
        @if (activeConversation()) {
          <!-- Thread Header -->
          <div
            class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3"
          >
            <div class="relative">
              <div
                class="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm"
              >
                {{ getInitials(activeConversation()!) }}
              </div>
              @if (isOnline(activeConversation()!)) {
                <span
                  class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"
                ></span>
              }
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ getConvName(activeConversation()!) }}
              </p>
              <p class="text-xs text-gray-400">
                {{ isOnline(activeConversation()!) ? 'Online' : 'Offline' }}
              </p>
            </div>
          </div>

          <!-- Messages -->
          <div #messageList class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            @for (msg of messages(); track msg.messageId) {
              <div class="flex gap-3" [class.flex-row-reverse]="msg.senderId === currentUserId">
                <div
                  class="w-8 h-8 rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  {{ msg.senderName.charAt(0) }}
                </div>
                <div
                  class="max-w-[70%] space-y-1"
                  [class.items-end]="msg.senderId === currentUserId"
                >
                  <div
                    class="px-4 py-2.5 rounded-2xl text-sm"
                    [class.bg-indigo-600]="msg.senderId === currentUserId"
                    [class.text-white]="msg.senderId === currentUserId"
                    [class.bg-gray-100]="msg.senderId !== currentUserId"
                    [class.dark:bg-gray-700]="msg.senderId !== currentUserId"
                    [class.text-gray-900]="msg.senderId !== currentUserId"
                    [class.dark:text-white]="msg.senderId !== currentUserId"
                    [class.rounded-br-sm]="msg.senderId === currentUserId"
                    [class.rounded-bl-sm]="msg.senderId !== currentUserId"
                  >
                    {{ msg.content }}
                  </div>
                  <p class="text-xs text-gray-400 px-1">{{ msg.createdAt | date: 'shortTime' }}</p>
                </div>
              </div>
            }
          </div>

          <!-- Compose Area -->
          <div
            class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20"
          >
            <div class="flex items-end gap-2">
              <button hlmBtn variant="ghost" size="icon" class="flex-shrink-0 mb-0.5">
                <ng-icon name="lucidePaperclip" size="18"></ng-icon>
              </button>
              <div class="flex-1">
                <textarea
                  hlmInput
                  [(ngModel)]="messageText"
                  (keydown.enter)="onEnterKey($event)"
                  placeholder="Type a message..."
                  rows="1"
                  class="w-full resize-none text-sm py-2.5 leading-relaxed min-h-[42px] max-h-32 overflow-y-auto"
                >
                </textarea>
              </div>
              <button
                hlmBtn
                size="icon"
                class="flex-shrink-0 mb-0.5"
                (click)="sendMessage()"
                [disabled]="!messageText.trim()"
              >
                <ng-icon name="lucideSend" size="18"></ng-icon>
              </button>
            </div>
          </div>
        } @else {
          <!-- Empty State -->
          <div class="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div
              class="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4"
            >
              <ng-icon name="lucideMessageSquare" size="28" class="text-indigo-400"></ng-icon>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              No conversation selected
            </h3>
            <p class="text-sm text-gray-400">
              Choose a conversation from the left panel to start chatting.
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageList') private messageList!: ElementRef<HTMLDivElement>;

  private readonly chatService = inject(ChatService);

  // ── State ──────────────────────────────────────────────────────────────────
  readonly currentUserId = 'u-001';
  readonly conversations = signal<ChatConversation[]>([]);
  readonly activeConversation = signal<ChatConversation | null>(null);
  readonly messages = signal<ChatMessage[]>([]);
  searchQuery = '';
  messageText = '';
  private _shouldScroll = false;

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly filteredConversations = computed(() => {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.conversations();
    return this.conversations().filter(
      (c) =>
        this.getConvName(c).toLowerCase().includes(q) ||
        c.lastMessage?.content.toLowerCase().includes(q)
    );
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.chatService.getConversations().subscribe((data) => {
      this.conversations.set(data);
      if (data.length > 0) this.selectConversation(data[0]);
    });
  }

  ngAfterViewChecked(): void {
    if (this._shouldScroll) {
      this._scrollToBottom();
      this._shouldScroll = false;
    }
  }

  // ── Select Conversation ────────────────────────────────────────────────────
  selectConversation(conv: ChatConversation): void {
    this.activeConversation.set(conv);
    this.chatService.getMessages(conv.conversationId).subscribe((msgs) => {
      this.messages.set(msgs);
      this._shouldScroll = true;
    });
  }

  // ── Send Message ───────────────────────────────────────────────────────────
  sendMessage(): void {
    const text = this.messageText.trim();
    if (!text || !this.activeConversation()) return;
    this.chatService
      .sendMessage({ conversationId: this.activeConversation()!.conversationId, content: text })
      .subscribe((msg) => {
        this.messages.update((list) => [...list, msg]);
        this.messageText = '';
        this._shouldScroll = true;
      });
  }

  // ── Enter Key Handler ──────────────────────────────────────────────────────
  onEnterKey(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.sendMessage();
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getConvName(conv: ChatConversation): string {
    if (conv.isGroup) return conv.groupName ?? 'Group';
    return conv.participants.find((p) => p.userId !== this.currentUserId)?.name ?? 'Unknown';
  }

  getInitials(conv: ChatConversation): string {
    return this.getConvName(conv).charAt(0).toUpperCase();
  }

  isOnline(conv: ChatConversation): boolean {
    return conv.participants.some((p) => p.userId !== this.currentUserId && p.isOnline);
  }

  private _scrollToBottom(): void {
    try {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    } catch {
      void 0; // Scroll container may not be ready yet (e.g. first paint).
    }
  }
}
