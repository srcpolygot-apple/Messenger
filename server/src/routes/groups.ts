import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middlewares/auth';
import {
  createGroup,
  getUserGroups,
  addGroupMember,
  getGroupMembers,
  removeGroupMember,
  updateGroup,
  getGroupById,
  updateGroupMemberRole,
} from '../models/group';
import { getUserById } from '../models/user';

export const groupRouter = Router();

// Create group
groupRouter.post('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { groupName, description, memberIds } = req.body;

    if (!groupName) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }

    const group = createGroup(req.userId!, groupName, description);

    if (!group) {
      res.status(500).json({ error: 'Failed to create group' });
      return;
    }

    // Add members
    if (memberIds && Array.isArray(memberIds)) {
      for (const memberId of memberIds) {
        addGroupMember(group.id, memberId);
      }
    }

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user groups
groupRouter.get('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    const groups = getUserGroups(req.userId!);
    res.json(groups);
  } catch (error) {
    console.error('Error getting groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get group details
groupRouter.get('/:groupId', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;

    const group = getGroupById(groupId);

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    res.json(group);
  } catch (error) {
    console.error('Error getting group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get group members
groupRouter.get('/:groupId/members', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;

    const members = getGroupMembers(groupId);

    res.json(members);
  } catch (error) {
    console.error('Error getting group members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add member to group
groupRouter.post('/:groupId/members', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const member = addGroupMember(groupId, userId);

    if (!member) {
      res.status(500).json({ error: 'Failed to add member' });
      return;
    }

    res.status(201).json(member);
  } catch (error) {
    console.error('Error adding group member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update group member role
groupRouter.put('/:groupId/members/:userId/role', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { groupId, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      res.status(400).json({ error: 'Role is required' });
      return;
    }

    const success = updateGroupMemberRole(groupId, userId, role);

    if (!success) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove member from group
groupRouter.delete('/:groupId/members/:userId', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { groupId, userId } = req.params;

    const success = removeGroupMember(groupId, userId);

    if (!success) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update group
groupRouter.put('/:groupId', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;
    const { groupName, groupPicture, description } = req.body;

    const updates: any = {};
    if (groupName) updates.group_name = groupName;
    if (groupPicture) updates.group_picture = groupPicture;
    if (description !== undefined) updates.description = description;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No updates provided' });
      return;
    }

    const group = updateGroup(groupId, updates);

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
