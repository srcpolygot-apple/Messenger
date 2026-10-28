// Socket.io service
import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

export class SocketService {
  private socket: Socket | null = null;

  connect(url: string = 'http://localhost:3000'): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(url, {
      auth: {
        token: getToken(),
      },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.authenticate();
    });

    return this.socket;
  }

  private authenticate(): void {
    if (this.socket) {
      const token = getToken();
      if (token) {
        this.socket.emit('auth', token);
      }
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
