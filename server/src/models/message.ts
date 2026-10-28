import { randomUUID } from 'crypto';
import { db } from '../database';

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

export function createMessage(
  senderId: string,
  receiverId: string,
  content: string,
  messageType = 'text',
  mediaUrl?: string
): Message | null {
  try {
    const messageId = randomUUID();
    const chatId = [senderId, receiverId].sort().join('-');

    const stmt = db.prepare(`
      INSERT INTO messages (
        id, sender_id, receiver_id, chat_id, content, message_type, media_url, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'sent')
    `);

    stmt.run(messageId, senderId, receiverId, chatId, content || null, messageType, mediaUrl || null);

    return getMessageById(messageId);
  } catch (error) {
    console.error('Error creating message:', error);
    return null;
  }
}

export function getMessageById(messageId: string): Message | null {
  const stmt = db.prepare(`
    SELECT id, sender_id, receiver_id, chat_id, content, message_type, media_url, status, created_at, edited_at, deleted_at
    FROM messages
    WHERE id = ?
  `);

  return stmt.get(messageId) as Message | null;
}

export function getDirectMessages(
  userId1: string,
  userId2: string,
  limit = 50,
  offset = 0
): Message[] {
  try {
    const stmt = db.prepare(`
      SELECT id, sender_id, receiver_id, chat_id, content, message_type, media_url, status, created_at, edited_at, deleted_at
      FROM messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    return stmt.all(userId1, userId2, userId2, userId1, limit, offset) as Message[];
  } catch (error) {
    console.error('Error getting direct messages:', error);
    return [];
  }
}

export function updateMessageStatus(
  messageId: string,
  status: 'sent' | 'delivered' | 'read'
): Message | null {
  try {
    const stmt = db.prepare(`
      UPDATE messages
      SET status = ?
      WHERE id = ?
    `);

    stmt.run(status, messageId);
    return getMessageById(messageId);
  } catch (error) {
    console.error('Error updating message status:', error);
    return null;
  }
}

export function editMessage(messageId: string, newContent: string): Message | null {
  try {
    const stmt = db.prepare(`
      UPDATE messages
      SET content = ?, edited_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(newContent, messageId);
    return getMessageById(messageId);
  } catch (error) {
    console.error('Error editing message:', error);
    return null;
  }
}

export function deleteMessage(messageId: string): boolean {
  try {
    const stmt = db.prepare(`
      UPDATE messages
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(messageId);
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

export function searchMessages(userId: string, query: string, limit = 50): Message[] {
  try {
    const stmt = db.prepare(`
      SELECT id, sender_id, receiver_id, chat_id, content, message_type, media_url, status, created_at, edited_at, deleted_at
      FROM messages
      WHERE (sender_id = ? OR receiver_id = ?)
      AND content LIKE ?
      AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ?
    `);

    return stmt.all(userId, userId, `%${query}%`, limit) as Message[];
  } catch (error) {
    console.error('Error searching messages:', error);
    return [];
  }
}
