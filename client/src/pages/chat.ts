// Chat page component
import { appState, Message, Contact } from '../utils/state';
import { getToken } from '../utils/auth';
import { socketService } from '../utils/socket';
import { get, post } from '../utils/api';

export class ChatPage {
  static render(container: HTMLElement): void {
    const user = appState.getCurrentUser();
    if (!user) return;

    const html = `
      <div class="app-container">
        <!-- Sidebar -->
        <div class="sidebar">
          <div class="sidebar-header">
            <h1>Chats</h1>
            <div class="sidebar-actions">
              <button class="icon-button" id="new-chat-btn" title="New Chat">➕</button>
              <button class="icon-button" id="menu-btn" title="Menu">⋮</button>
            </div>
          </div>
          
          <div class="search-box">
            <input type="text" id="search-input" placeholder="Search chats..." />
          </div>
          
          <div class="chats-list" id="chats-list">
            <div class="empty-state">
              <div class="empty-state-icon">💬</div>
              <div class="empty-state-text">No chats yet. Start a conversation!</div>
            </div>
          </div>
        </div>
        
        <!-- Chat Area -->
        <div class="chat-area">
          <div id="chat-content">
            <div class="empty-state">
              <div class="empty-state-icon">👋</div>
              <div class="empty-state-text">Select a chat to get started</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modals -->
      <div class="modal" id="new-chat-modal">
        <div class="modal-content">
          <div class="modal-header">Start a New Chat</div>
          <div class="form-group">
            <label for="contact-search">Phone Number or Username</label>
            <input type="text" id="contact-search" placeholder="Search..." />
          </div>
          <div id="search-results" style="margin-top: 15px; max-height: 300px; overflow-y: auto;"></div>
          <div class="modal-actions">
            <button class="modal-button secondary" id="close-modal">Cancel</button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    ChatPage.attachEventListeners();
    ChatPage.loadChats();
    ChatPage.setupSocket();
  }

  static attachEventListeners(): void {
    const newChatBtn = document.getElementById('new-chat-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const searchInput = document.getElementById('contact-search');
    const modal = document.getElementById('new-chat-modal');

    newChatBtn?.addEventListener('click', () => {
      modal?.classList.add('active');
    });

    closeModalBtn?.addEventListener('click', () => {
      modal?.classList.remove('active');
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    searchInput?.addEventListener('input', async (e) => {
      const query = (e.target as HTMLInputElement).value;
      if (query.length < 2) {
        document.getElementById('search-results')!.innerHTML = '';
        return;
      }

      const token = getToken();
      const response = await get(`/api/auth/search?q=${query}`, token!);

      if (response.data) {
        const resultsHtml = (response.data as any[])
          .map(
            (user) => `
            <div class="chat-item" onclick="window.startChat('${user.id}', '${user.username}')">
              <div class="chat-avatar">${user.username.charAt(0).toUpperCase()}</div>
              <div class="chat-info">
                <div class="chat-name">${user.username}</div>
                <div class="chat-preview">${user.phone_number}</div>
              </div>
            </div>
          `
          )
          .join('');

        document.getElementById('search-results')!.innerHTML = resultsHtml;
      }
    });
  }

  static async loadChats(): Promise<void> {
    const token = getToken();
    const response = await get('/api/contacts', token!);

    if (response.data) {
      const contacts = response.data as Contact[];
      const chatsList = document.getElementById('chats-list');

      if (contacts.length === 0) {
        chatsList!.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <div class="empty-state-text">No contacts yet. Add one to start chatting!</div>
          </div>
        `;
      } else {
        chatsList!.innerHTML = contacts
          .map(
            (contact) => `
            <div class="chat-item" onclick="window.selectChat('${contact.contact_user_id}', '${contact.display_name || 'Unknown'}')">
              <div class="chat-avatar">${(contact.display_name || 'U').charAt(0).toUpperCase()}</div>
              <div class="chat-info">
                <div class="chat-name">${contact.display_name || 'Unknown'}</div>
                <div class="chat-preview">Tap to open chat</div>
              </div>
            </div>
          `
          )
          .join('');
      }
    }
  }

  static setupSocket(): void {
    socketService.on('message:receive', (message: Message) => {
      appState.addMessage(message.chat_id, message);
      ChatPage.updateMessagesDisplay();
    });

    socketService.on('user:online', (data) => {
      appState.addOnlineUser(data.userId);
      ChatPage.updateChatsDisplay();
    });

    socketService.on('user:offline', (data) => {
      appState.removeOnlineUser(data.userId);
      ChatPage.updateChatsDisplay();
    });

    socketService.on('typing:users', (data) => {
      appState.setTypingUsers(data.chatId, data.users);
      ChatPage.updateMessagesDisplay();
    });
  }

  static updateMessagesDisplay(): void {
    const chatContent = document.getElementById('chat-content');
    if (!chatContent) return;
    // Re-render current chat if open
  }

  static updateChatsDisplay(): void {
    // Re-render chats list
  }
}

// Global functions for onclick handlers
(window as any).selectChat = async (userId: string, displayName: string) => {
  const token = getToken();
  const response = await get(`/api/messages/direct/${userId}?limit=50&offset=0`, token!);

  if (response.data) {
    const messages = response.data as Message[];
    appState.setMessages(userId, messages);
    ChatPage.renderChat(userId, displayName, messages);
  }
};

(window as any).startChat = async (userId: string, username: string) => {
  const token = getToken();

  // Add contact
  await post(
    '/api/contacts',
    {
      phoneNumber: username,
      displayName: username,
    },
    token!
  );

  // Close modal
  const modal = document.getElementById('new-chat-modal');
  modal?.classList.remove('active');

  // Load and display chat
  (window as any).selectChat(userId, username);
};

ChatPage.renderChat = (userId: string, displayName: string, messages: Message[]) => {
  const chatContent = document.getElementById('chat-content');
  if (!chatContent) return;

  const currentUser = appState.getCurrentUser();

  const messagesHtml = messages
    .map((msg) => {
      const isOwn = msg.sender_id === currentUser?.id;
      const date = new Date(msg.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      return `
        <div class="message-group ${isOwn ? 'sent' : 'received'}">
          <div class="message-bubble ${isOwn ? 'sent' : 'received'}">
            ${msg.content || '[Media]'}
            <div class="message-time">${date}</div>
          </div>
        </div>
      `;
    })
    .join('');

  chatContent.innerHTML = `
    <div class="chat-header">
      <div class="chat-header-info">
        <div class="chat-avatar">${displayName.charAt(0).toUpperCase()}</div>
        <div>
          <div class="chat-header-title">${displayName}</div>
          <div class="chat-header-subtitle">
            ${appState.isUserOnline(userId) ? '🟢 Active now' : 'Offline'}
          </div>
        </div>
      </div>
    </div>
    
    <div class="messages-container" id="messages">
      ${messagesHtml}
    </div>
    
    <div class="input-area">
      <div class="input-field">
        <input 
          type="text" 
          id="message-input" 
          placeholder="Message..."
          onkeypress="if(event.key === 'Enter') window.sendMessage('${userId}')"
        />
      </div>
      <button class="send-button" onclick="window.sendMessage('${userId}')">
        ➤
      </button>
    </div>
  `;

  // Scroll to bottom
  const messagesContainer = document.getElementById('messages');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
};

(window as any).sendMessage = (receiverId: string) => {
  const input = document.getElementById('message-input') as HTMLInputElement;
  const content = input.value.trim();

  if (!content) return;

  socketService.emit('message:send', {
    receiverId,
    content,
    messageType: 'text',
  });

  input.value = '';
  input.focus();
};
