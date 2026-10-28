import { randomUUID } from 'crypto';
import { db } from '../database';

export interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string;
  display_name?: string;
  created_at: string;
}

export function addContact(
  userId: string,
  contactUserId: string,
  displayName?: string
): Contact | null {
  try {
    const contactId = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO contacts (id, user_id, contact_user_id, display_name)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(contactId, userId, contactUserId, displayName || null);

    return getContactById(contactId);
  } catch (error) {
    console.error('Error adding contact:', error);
    return null;
  }
}

export function getContactById(contactId: string): Contact | null {
  const stmt = db.prepare(`
    SELECT id, user_id, contact_user_id, display_name, created_at
    FROM contacts
    WHERE id = ?
  `);

  return stmt.get(contactId) as Contact | null;
}

export function getUserContacts(userId: string): Contact[] {
  try {
    const stmt = db.prepare(`
      SELECT id, user_id, contact_user_id, display_name, created_at
      FROM contacts
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);

    return stmt.all(userId) as Contact[];
  } catch (error) {
    console.error('Error getting user contacts:', error);
    return [];
  }
}

export function deleteContact(userId: string, contactId: string): boolean {
  try {
    const stmt = db.prepare(`
      DELETE FROM contacts
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(contactId, userId);
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting contact:', error);
    return false;
  }
}

export function updateContact(
  userId: string,
  contactId: string,
  displayName: string
): Contact | null {
  try {
    const stmt = db.prepare(`
      UPDATE contacts
      SET display_name = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(displayName, contactId, userId);

    return getContactById(contactId);
  } catch (error) {
    console.error('Error updating contact:', error);
    return null;
  }
}

export function isContact(userId: string, contactUserId: string): boolean {
  try {
    const stmt = db.prepare(`
      SELECT id FROM contacts
      WHERE user_id = ? AND contact_user_id = ?
    `);

    return stmt.get(userId, contactUserId) !== undefined;
  } catch (error) {
    return false;
  }
}
