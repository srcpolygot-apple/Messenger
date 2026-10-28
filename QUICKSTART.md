# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Two terminals for running client and server

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for both server and client in the root, as well as their respective workspaces.

### 2. Configure Environment

```bash
cp server/.env.example server/.env
```

Update `server/.env` if needed. Default values work for local development:
```
NODEJS_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production
DB_PATH=./messenger.db
```

### 3. Start the Development Servers

**Terminal 1 - Backend:**
```bash
npm run server
```

Server will run on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
npm run client
```

Frontend will run on `http://localhost:5173`

### 4. Open in Browser

Navigate to `http://localhost:5173` and start using the app!

## Create Test Users

1. Click "Sign Up" 
2. Enter a phone number (e.g., +1 (555) 000-0001)
3. Enter a username (e.g., alice)
4. Enter a password
5. Click "Sign Up"

Repeat for a second user with different phone and username.

## Add Contacts

1. Login with first user
2. Click the "➕" button in the sidebar
3. Search for the second user by phone number or username
4. Click to add as contact

## Start Messaging

1. Select the contact from the chat list
2. Type a message and press Enter or click the send button
3. Messages appear in real-time

## Features to Try

- **Online Status**: See when contacts are online (green dot)
- **Typing Indicators**: Watch "typing..." appear when someone types
- **Message Status**: See if messages are sent, delivered, or read
- **Contact Management**: Rename, search, or delete contacts
- **Groups**: Create group chats and manage members (click menu button)

## Building for Production

```bash
npm run build
```

Creates:
- `server/dist` - Compiled Node.js backend
- `client/dist` - Optimized frontend bundle (ready for Vercel)

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Create project on Vercel dashboard
3. Connect your GitHub repository
4. Add environment variables:
   - `JWT_SECRET`: Use a strong random string
   - `NODEJS_ENV`: `production`
5. Deploy!

### Deploy Backend Separately (Optional)

You can deploy the backend to:
- Vercel (as serverless functions)
- Railway.app (recommended for Node.js)
- Heroku
- DigitalOcean
- AWS, Azure, GCP, etc.

## Troubleshooting

### Cannot connect to server
- Ensure backend is running on port 3000
- Check `CLIENT_URL` in server `.env`
- Check browser console for WebSocket errors

### Database errors
- Delete `server/messenger.db` and restart
- Database will be recreated automatically

### Build fails
```bash
rm -rf node_modules
npm install
npm run build
```

### Port already in use
Change `PORT` in `server/.env` or `server/vite.config.ts` for client

## Project Structure

```
Messenger/
├── server/                 # Backend (Express + Socket.io)
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   ├── routes/        # API endpoints
│   │   ├── models/        # Database models
│   │   ├── middlewares/   # Auth & rate limiting
│   │   └── utils/         # Helpers
│   └── messenger.db       # SQLite database
├── client/                # Frontend (TypeScript + HTML/CSS)
│   ├── src/
│   │   ├── main.ts        # App entry point
│   │   ├── pages/         # UI pages
│   │   ├── utils/         # API & Socket clients
│   │   └── styles/        # CSS
│   └── dist/              # Built app (production)
└── package.json           # Root workspace
```

## Next Steps

- Add voice/video calling with WebRTC
- Implement message reactions/emojis
- Add media upload (images, videos)
- Implement end-to-end encryption
- Create mobile app (React Native)
- Add dark mode
- Improve message search
- Add backups feature

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review GitHub Issues
3. Check browser console for errors
4. Check server logs for backend errors

Happy messaging! 🎉
