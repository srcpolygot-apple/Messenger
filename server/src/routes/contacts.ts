import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middlewares/auth';
import {
  addContact,
  getUserContacts,
  deleteContact,
  updateContact,
} from '../models/contact';
import { getUserByPhone } from '../models/user';

export const contactRouter = Router();

// Add contact by phone number
contactRouter.post('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { phoneNumber, displayName } = req.body;

    if (!phoneNumber) {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }

    const contactUser = getUserByPhone(phoneNumber);
    if (!contactUser) {
      res.status(404).json({ error: 'User with this phone number not found' });
      return;
    }

    if (contactUser.id === req.userId) {
      res.status(400).json({ error: 'Cannot add yourself as a contact' });
      return;
    }

    const contact = addContact(req.userId!, contactUser.id, displayName);

    if (!contact) {
      res.status(500).json({ error: 'Failed to add contact' });
      return;
    }

    res.status(201).json(contact);
  } catch (error) {
    if ((error as any).message?.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Contact already exists' });
    } else {
      console.error('Error adding contact:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Get all contacts
contactRouter.get('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    const contacts = getUserContacts(req.userId!);
    res.json(contacts);
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact display name
contactRouter.put('/:contactId', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { contactId } = req.params;
    const { displayName } = req.body;

    if (!displayName) {
      res.status(400).json({ error: 'Display name is required' });
      return;
    }

    const contact = updateContact(req.userId!, contactId, displayName);

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact
contactRouter.delete('/:contactId', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { contactId } = req.params;

    const success = deleteContact(req.userId!, contactId);

    if (!success) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
