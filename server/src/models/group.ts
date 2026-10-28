import { randomUUID } from 'crypto';
import { db } from '../database';

export interface Group {
  id: string;
  group_name: string;
  group_picture?: string;
  description?: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export function createGroup(
  creatorId: string,
  groupName: string,
  description?: string
): Group | null {
  try {
    const groupId = randomUUID();

    const stmt = db.prepare(`
      INSERT INTO groups (id, group_name, description, creator_id)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(groupId, groupName, description || null, creatorId);

    // Add creator as admin member
    const memberStmt = db.prepare(`
      INSERT INTO group_members (id, group_id, user_id, role)
      VALUES (?, ?, ?, 'admin')
    `);

    memberStmt.run(randomUUID(), groupId, creatorId);

    return getGroupById(groupId);
  } catch (error) {
    console.error('Error creating group:', error);
    return null;
  }
}

export function getGroupById(groupId: string): Group | null {
  const stmt = db.prepare(`
    SELECT id, group_name, group_picture, description, creator_id, created_at, updated_at
    FROM groups
    WHERE id = ?
  `);

  return stmt.get(groupId) as Group | null;
}

export function getUserGroups(userId: string): Group[] {
  try {
    const stmt = db.prepare(`
      SELECT g.id, g.group_name, g.group_picture, g.description, g.creator_id, g.created_at, g.updated_at
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.updated_at DESC
    `);

    return stmt.all(userId) as Group[];
  } catch (error) {
    console.error('Error getting user groups:', error);
    return [];
  }
}

export function addGroupMember(
  groupId: string,
  userId: string,
  role = 'member'
): GroupMember | null {
  try {
    const memberId = randomUUID();

    const stmt = db.prepare(`
      INSERT INTO group_members (id, group_id, user_id, role)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(memberId, groupId, userId, role);

    return getGroupMemberById(memberId);
  } catch (error) {
    console.error('Error adding group member:', error);
    return null;
  }
}

export function getGroupMemberById(memberId: string): GroupMember | null {
  const stmt = db.prepare(`
    SELECT id, group_id, user_id, role, joined_at
    FROM group_members
    WHERE id = ?
  `);

  return stmt.get(memberId) as GroupMember | null;
}

export function getGroupMembers(groupId: string): GroupMember[] {
  try {
    const stmt = db.prepare(`
      SELECT id, group_id, user_id, role, joined_at
      FROM group_members
      WHERE group_id = ?
      ORDER BY joined_at ASC
    `);

    return stmt.all(groupId) as GroupMember[];
  } catch (error) {
    console.error('Error getting group members:', error);
    return [];
  }
}

export function removeGroupMember(groupId: string, userId: string): boolean {
  try {
    const stmt = db.prepare(`
      DELETE FROM group_members
      WHERE group_id = ? AND user_id = ?
    `);

    const result = stmt.run(groupId, userId);
    return result.changes > 0;
  } catch (error) {
    console.error('Error removing group member:', error);
    return false;
  }
}

export function updateGroupMemberRole(
  groupId: string,
  userId: string,
  role: string
): boolean {
  try {
    const stmt = db.prepare(`
      UPDATE group_members
      SET role = ?
      WHERE group_id = ? AND user_id = ?
    `);

    const result = stmt.run(role, groupId, userId);
    return result.changes > 0;
  } catch (error) {
    console.error('Error updating group member role:', error);
    return false;
  }
}

export function updateGroup(
  groupId: string,
  updates: Partial<{
    group_name: string;
    group_picture: string;
    description: string;
  }>
): Group | null {
  try {
    const updates_list: string[] = [];
    const values: any[] = [];

    if (updates.group_name !== undefined) {
      updates_list.push('group_name = ?');
      values.push(updates.group_name);
    }
    if (updates.group_picture !== undefined) {
      updates_list.push('group_picture = ?');
      values.push(updates.group_picture);
    }
    if (updates.description !== undefined) {
      updates_list.push('description = ?');
      values.push(updates.description);
    }

    if (updates_list.length === 0) return getGroupById(groupId);

    values.push(groupId);
    updates_list.push('updated_at = CURRENT_TIMESTAMP');

    const stmt = db.prepare(`
      UPDATE groups
      SET ${updates_list.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return getGroupById(groupId);
  } catch (error) {
    console.error('Error updating group:', error);
    return null;
  }
}
