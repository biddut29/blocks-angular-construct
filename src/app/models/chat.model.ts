// ─── Chat Models ───────────────────────────────────────────────────────────────
// Mirrors: src/modules/chat/types/ in React project

export interface ChatParticipant {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatConversation {
  conversationId: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isGroup?: boolean;
  groupName?: string;
  groupAvatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  attachments?: File[];
}
