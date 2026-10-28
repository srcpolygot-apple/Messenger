// Local storage utilities
export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  localStorage.removeItem('token');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function setUser(user: any): void {
  localStorage.setItem('user', JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem('user');
}

export function clearAuth(): void {
  removeToken();
  removeUser();
}
