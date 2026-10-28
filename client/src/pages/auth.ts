// Authentication page component
export class AuthPage {
  static render(container: HTMLElement): void {
    let isSignup = false;

    const html = `
      <div class="auth-container">
        <div class="auth-card">
          <h1>Messenger</h1>
          <p>${isSignup ? 'Create your account' : 'Welcome back'}</p>
          
          <div id="auth-error" class="auth-error" style="display: none;"></div>
          
          <form class="auth-form" id="auth-form">
            ${
              isSignup
                ? `
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" placeholder="+1 (555) 000-0000" required />
              </div>
              <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" placeholder="Choose a username" required />
              </div>
            `
                : `
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" placeholder="+1 (555) 000-0000" required />
              </div>
            `
            }
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" placeholder="Enter your password" required />
            </div>
            <button type="submit" class="auth-button" id="auth-submit">
              ${isSignup ? 'Sign Up' : 'Login'}
            </button>
          </form>
          
          <div class="auth-toggle">
            <span>${isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
            <button type="button" id="toggle-auth" class="auth-toggle-btn">
              ${isSignup ? 'Login' : 'Sign Up'}
            </button>
          </div>
          
          <div id="auth-loading" class="auth-loading" style="display: none;">
            <div class="spinner"></div>
            <p>Please wait...</p>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    AuthPage.attachEventListeners(isSignup);
  }

  static attachEventListeners(initialIsSignup: boolean): void {
    let isSignup = initialIsSignup;

    const form = document.getElementById('auth-form') as HTMLFormElement;
    const toggleBtn = document.getElementById('toggle-auth') as HTMLButtonElement;
    const errorDiv = document.getElementById('auth-error') as HTMLElement;
    const loadingDiv = document.getElementById('auth-loading') as HTMLElement;

    toggleBtn.addEventListener('click', () => {
      isSignup = !isSignup;
      AuthPage.render(document.getElementById('app') || document.body);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const phoneInput = document.getElementById('phone') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const usernameInput = document.getElementById('username') as HTMLInputElement;

      errorDiv.style.display = 'none';
      loadingDiv.style.display = 'flex';

      try {
        if (isSignup) {
          document.dispatchEvent(
            new CustomEvent('auth:signup', {
              detail: {
                phoneNumber: phoneInput.value,
                username: usernameInput.value,
                password: passwordInput.value,
              },
            })
          );
        } else {
          document.dispatchEvent(
            new CustomEvent('auth:login', {
              detail: {
                phoneNumber: phoneInput.value,
                password: passwordInput.value,
              },
            })
          );
        }
      } catch (error) {
        console.error('Auth error:', error);
        errorDiv.textContent = 'An error occurred. Please try again.';
        errorDiv.style.display = 'block';
        loadingDiv.style.display = 'none';
      }
    });

    document.addEventListener('auth:error', (event: Event) => {
      const customEvent = event as CustomEvent;
      errorDiv.textContent = customEvent.detail.error;
      errorDiv.style.display = 'block';
      loadingDiv.style.display = 'none';
    });
  }
}
