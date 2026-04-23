// ─── Chat Service ──────────────────────────────────────────────────────────────
// Mirrors: src/modules/chat/services/ in React project
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GraphQLService } from '../../../lib/graphql.service';
import { ChatConversation, ChatMessage, SendMessageInput } from '../../../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly _graphql = inject(GraphQLService);

  // ── Get Conversations ──────────────────────────────────────────────────────
  getConversations(): Observable<ChatConversation[]> {
    // Mock data — replace with actual GraphQL subscription / query
    return of([
      {
        conversationId: 'conv-001',
        participants: [
          { userId: 'u-001', name: 'Alice Johnson', email: 'alice@example.com', isOnline: true },
          { userId: 'u-002', name: 'Bob Smith', email: 'bob@example.com', isOnline: false },
        ],
        lastMessage: {
          messageId: 'msg-010',
          conversationId: 'conv-001',
          senderId: 'u-001',
          senderName: 'Alice Johnson',
          content: 'Hey, how is the project going?',
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        unreadCount: 3,
        createdAt: new Date().toISOString(),
      },
      {
        conversationId: 'conv-002',
        isGroup: true,
        groupName: 'Dev Team',
        participants: [
          { userId: 'u-001', name: 'Alice Johnson', email: 'alice@example.com', isOnline: true },
          { userId: 'u-003', name: 'Carol White', email: 'carol@example.com', isOnline: true },
          { userId: 'u-004', name: 'David Brown', email: 'david@example.com', isOnline: false },
        ],
        lastMessage: {
          messageId: 'msg-020',
          conversationId: 'conv-002',
          senderId: 'u-003',
          senderName: 'Carol White',
          content: 'Stand-up in 10 minutes!',
          isRead: true,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      },
      {
        conversationId: 'conv-003',
        participants: [
          { userId: 'u-001', name: 'Alice Johnson', email: 'alice@example.com', isOnline: true },
          { userId: 'u-005', name: 'Eve Davis', email: 'eve@example.com', isOnline: false, lastSeen: '2024-06-16T18:00:00Z' },
        ],
        lastMessage: {
          messageId: 'msg-030',
          conversationId: 'conv-003',
          senderId: 'u-005',
          senderName: 'Eve Davis',
          content: 'Please review the PR when you get a chance.',
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  // ── Get Messages ───────────────────────────────────────────────────────────
  getMessages(conversationId: string): Observable<ChatMessage[]> {
    const messages: ChatMessage[] = [
      {
        messageId: 'msg-001',
        conversationId,
        senderId: 'u-002',
        senderName: 'Bob Smith',
        content: 'Good morning! Ready for the sprint?',
        isRead: true,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        messageId: 'msg-002',
        conversationId,
        senderId: 'u-001',
        senderName: 'Alice Johnson',
        content: 'Yes! Let me pull the latest code first.',
        isRead: true,
        createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      },
      {
        messageId: 'msg-003',
        conversationId,
        senderId: 'u-002',
        senderName: 'Bob Smith',
        content: 'Sure, take your time. I already have the tickets queued up.',
        isRead: true,
        createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      },
      {
        messageId: 'msg-004',
        conversationId,
        senderId: 'u-001',
        senderName: 'Alice Johnson',
        content: 'Hey, how is the project going?',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ];
    return of(messages);
  }

  // ── Send Message ───────────────────────────────────────────────────────────
  sendMessage(input: SendMessageInput): Observable<ChatMessage> {
    const message: ChatMessage = {
      messageId: `msg-${Date.now()}`,
      conversationId: input.conversationId,
      senderId: 'u-001', // current user
      senderName: 'Alice Johnson', // current user
      content: input.content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    return of(message);
  }
}
