// Application state management
export interface User {
  id: string;
  phone_number: string;
  username: string;
  profile_picture?: string;
  status?: string;
  is_online: boolean;
  last_seen?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  chat_id: string;
  content?: string;
  message_type: string;
  media_url?: string;
  status: string;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
}

export interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string;
  display_name?: string;
  created_at: string;
}

export interface Group {
  id: string;
  group_name: string;
  group_picture?: string;
  description?: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export class AppState {
  private static instance: AppState;
  private currentUser: User | null = null;
  private contacts: Contact[] = [];
  private groups: Group[] = [];
  private messages: Map<string, Message[]> = new Map();
  private onlineUsers: Set<string> = new Set();
  private typingUsers: Map<string, Set<string>> = new Map();

  private constructor() {}

  static getInstance(): AppState {
    if (!AppState.instance) {
      AppState.instance = new AppState();
    }
    return AppState.instance;
  }

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setContacts(contacts: Contact[]): void {
    this.contacts = contacts;
  }

  getContacts(): Contact[] {
    return this.contacts;
  }

  addContact(contact: Contact): void {
    this.contacts.push(contact);
  }

  removeContact(contactId: string): void {
    this.contacts = this.contacts.filter((c) => c.id !== contactId);
  }

  setGroups(groups: Group[]): void {
    this.groups = groups;
  }

  getGroups(): Group[] {
    return this.groups;
  }

  addMessage(chatId: string, message: Message): void {
    if (!this.messages.has(chatId)) {
      this.messages.set(chatId, []);
    }
    this.messages.get(chatId)!.push(message);
  }

  getMessages(chatId: string): Message[] {
    return this.messages.get(chatId) || [];
  }

  setMessages(chatId: string, messages: Message[]): void {
    this.messages.set(chatId, messages);
  }

  setOnlineUsers(users: Set<string>): void {
    this.onlineUsers = users;
  }

  addOnlineUser(userId: string): void {
    this.onlineUsers.add(userId);
  }

  removeOnlineUser(userId: string): void {
    this.onlineUsers.delete(userId);
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  setTypingUsers(chatId: string, users: string[]): void {
    this.typingUsers.set(chatId, new Set(users));
  }

  getTypingUsers(chatId: string): string[] {
    return Array.from(this.typingUsers.get(chatId) || []);
  }
}

export const appState = AppState.getInstance();
