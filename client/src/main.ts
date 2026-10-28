// Main application entry point
import { AuthPage } from './pages/auth';
import { ChatPage } from './pages/chat';
import { getToken, setToken, setUser } from './utils/auth';
import { socketService } from './utils/socket';
import { appState } from './utils/state';
import { post, get } from './utils/api';

let currentPage: 'auth' | 'chat' = 'auth';

async function initApp(): Promise<void> {
  const token = getToken();

  if (token) {
    // Try to verify token by fetching user profile
    try {
      const response = await get('/api/auth/me', token);
      if (response.data) {
        appState.setCurrentUser(response.data);
        socketService.connect();
        showChatPage();
        return;
      }
    } catch (error) {
      // Token is invalid
    }
  }

  showAuthPage();
}

export function showAuthPage(): void {
  currentPage = 'auth';
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = '';
  AuthPage.render(app);

  // Handle auth events
  document.addEventListener('auth:signup', handleAuthSignup);
  document.addEventListener('auth:login', handleAuthLogin);
}

export function showChatPage(): void {
  currentPage = 'chat';
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = '';
  ChatPage.render(app);
}

async function handleAuthSignup(event: Event): Promise<void> {
  const customEvent = event as CustomEvent;
  const { phoneNumber, username, password } = customEvent.detail;

  try {
    const response = await post('/api/auth/signup', {
      phoneNumber,
      username,
      password,
    });

    if (response.error) {
      document.dispatchEvent(
        new CustomEvent('auth:error', {
          detail: { error: response.error },
        })
      );
      return;
    }

    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    appState.setCurrentUser(user);
    socketService.connect();
    showChatPage();
  } catch (error) {
    console.error('Signup error:', error);
    document.dispatchEvent(
      new CustomEvent('auth:error', {
        detail: { error: 'An error occurred during signup' },
      })
    );
  }
}

async function handleAuthLogin(event: Event): Promise<void> {
  const customEvent = event as CustomEvent;
  const { phoneNumber, password } = customEvent.detail;

  try {
    const response = await post('/api/auth/login', {
      phoneNumber,
      password,
    });

    if (response.error) {
      document.dispatchEvent(
        new CustomEvent('auth:error', {
          detail: { error: response.error },
        })
      );
      return;
    }

    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    appState.setCurrentUser(user);
    socketService.connect();
    showChatPage();
  } catch (error) {
    console.error('Login error:', error);
    document.dispatchEvent(
      new CustomEvent('auth:error', {
        detail: { error: 'An error occurred during login' },
      })
    );
  }
}

// Start the application
initApp();
