import { randomUUID } from 'crypto';
import { db } from '../database';
import bcryptjs from 'bcryptjs';

export interface User {
  id: string;
  phone_number: string;
  username: string;
  profile_picture?: string;
  status?: string;
  is_online: boolean;
  last_seen?: string;
  created_at: string;
}

export function createUser(
  phoneNumber: string,
  username: string,
  password: string
): User | null {
  try {
    const passwordHash = bcryptjs.hashSync(password, 10);
    const userId = randomUUID();

    const stmt = db.prepare(`
      INSERT INTO users (id, phone_number, username, password_hash)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(userId, phoneNumber, username, passwordHash);

    return getUserById(userId);
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export function getUserById(userId: string): User | null {
  const stmt = db.prepare(`
    SELECT id, phone_number, username, profile_picture, status, is_online, last_seen, created_at
    FROM users
    WHERE id = ?
  `);

  return stmt.get(userId) as User | null;
}

export function getUserByPhone(phoneNumber: string): User | null {
  const stmt = db.prepare(`
    SELECT id, phone_number, username, profile_picture, status, is_online, last_seen, created_at
    FROM users
    WHERE phone_number = ?
  `);

  return stmt.get(phoneNumber) as User | null;
}

export function getUserByUsername(username: string): User | null {
  const stmt = db.prepare(`
    SELECT id, phone_number, username, profile_picture, status, is_online, last_seen, created_at
    FROM users
    WHERE username = ?
  `);

  return stmt.get(username) as User | null;
}

export function verifyPassword(
  phoneNumber: string,
  password: string
): { user: User; valid: boolean } | null {
  const stmt = db.prepare(`
    SELECT id, phone_number, username, profile_picture, status, is_online, last_seen, created_at, password_hash
    FROM users
    WHERE phone_number = ?
  `);

  const row = stmt.get(phoneNumber) as any;
  if (!row) return null;

  const valid = bcryptjs.compareSync(password, row.password_hash);
  const user: User = {
    id: row.id,
    phone_number: row.phone_number,
    username: row.username,
    profile_picture: row.profile_picture,
    status: row.status,
    is_online: row.is_online,
    last_seen: row.last_seen,
    created_at: row.created_at,
  };

  return { user, valid };
}

export function updateUserProfile(
  userId: string,
  updates: Partial<{
    username: string;
    profile_picture: string;
    status: string;
  }>
): User | null {
  try {
    const updates_list: string[] = [];
    const values: any[] = [];

    if (updates.username !== undefined) {
      updates_list.push('username = ?');
      values.push(updates.username);
    }
    if (updates.profile_picture !== undefined) {
      updates_list.push('profile_picture = ?');
      values.push(updates.profile_picture);
    }
    if (updates.status !== undefined) {
      updates_list.push('status = ?');
      values.push(updates.status);
    }

    if (updates_list.length === 0) return getUserById(userId);

    values.push(userId);
    updates_list.push('updated_at = CURRENT_TIMESTAMP');

    const stmt = db.prepare(`
      UPDATE users
      SET ${updates_list.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return getUserById(userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

export function setUserOnlineStatus(userId: string, isOnline: boolean): void {
  try {
    const stmt = db.prepare(`
      UPDATE users
      SET is_online = ?, last_seen = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(isOnline ? 1 : 0, userId);
  } catch (error) {
    console.error('Error setting user online status:', error);
  }
}

export function searchUsers(query: string, limit = 10): User[] {
  try {
    const stmt = db.prepare(`
      SELECT id, phone_number, username, profile_picture, status, is_online, last_seen, created_at
      FROM users
      WHERE phone_number LIKE ? OR username LIKE ?
      LIMIT ?
    `);

    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, limit) as User[];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}
