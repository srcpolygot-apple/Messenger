# Messenger - WhatsApp-like Messaging Application

A full-stack messaging application built with Node.js, Express, TypeScript, HTML, and CSS. Features real-time messaging, contact management, and group chats - all WhatsApp features except linked devices.

## Features

- **User Authentication**: Sign up and login with phone number
- **Contact Management**: Add contacts by phone number
- **Direct Messaging**: Send and receive real-time messages
- **Message Status**: Track message delivery and read status
- **Typing Indicators**: See when someone is typing
- **User Presence**: Online/offline status and last seen
- **Group Chats**: Create and manage group conversations
- **Message History**: Search through message history
- **Profile Management**: Update profile picture, status, and username
- **Media Sharing**: (Prepared for future implementation)

## Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **TypeScript** - Type-safe JavaScript
- **Socket.io Client** - Real-time communication
- **Vite** - Next-generation build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **SQLite** - Lightweight database
- **TypeScript** - Type safety
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Project Structure

```
.
├── server/                 # Backend application
│   ├── src/
│   │   ├── index.ts       # Main server file with Socket.io setup
│   │   ├── database.ts    # SQLite database initialization
│   │   ├── models/        # Data models (user, message, contact, group)
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Authentication middleware
│   │   └── utils/         # JWT and utilities
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── client/                # Frontend application
│   ├── src/
│   │   ├── main.ts        # Application entry point
│   │   ├── index.html     # HTML entry point
│   │   ├── pages/         # Page components
│   │   ├── utils/         # API, Socket, State management
│   │   └── styles/        # CSS stylesheets
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── package.json           # Root package
├── tsconfig.json          # TypeScript configuration
├── vercel.json           # Vercel deployment config
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Messenger
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Server configuration
cp server/.env.example server/.env
# Edit server/.env with your settings
```

4. **Start development servers**

Open two terminals:

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run client
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

This creates:
- `server/dist` - Compiled backend
- `client/dist` - Optimized frontend bundle

## Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Create Vercel project**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Set environment variables in Vercel dashboard

3. **Environment Variables needed**:
   - `JWT_SECRET`: Secret key for JWT signing
   - `NODE_ENV`: Set to `production`

### Environment Variables

**Server (.env)**:
```
NODEJS_ENV=production
PORT=3000
CLIENT_URL=https://your-domain.com
JWT_SECRET=your-secret-key-min-32-chars
DB_PATH=./messenger.db
```

## API Documentation

### Authentication

**POST /api/auth/signup**
- Create new user account
- Request: `{ phoneNumber, username, password }`
- Response: `{ token, user }`

**POST /api/auth/login**
- Login with phone and password
- Request: `{ phoneNumber, password }`
- Response: `{ token, user }`

### Contacts

**GET /api/contacts**
- Get all user contacts
- Headers: `Authorization: ******

**POST /api/contacts**
- Add new contact
- Request: `{ phoneNumber, displayName? }`

**PUT /api/contacts/:contactId**
- Update contact display name

**DELETE /api/contacts/:contactId**
- Delete contact

### Messages

**GET /api/messages/direct/:userId**
- Get direct message history with user

**PUT /api/messages/:messageId/status**
- Update message status (sent, delivered, read)

**PUT /api/messages/:messageId**
- Edit message

**DELETE /api/messages/:messageId**
- Delete message

## WebSocket Events

### Client -> Server

- `auth`: Authenticate with token
- `message:send`: Send direct message
- `typing:start`: User started typing
- `typing:stop`: User stopped typing
- `message:status`: Update message status

### Server -> Client

- `auth:success`: Authentication successful
- `message:receive`: New message received
- `user:online`: User came online
- `user:offline`: User went offline
- `typing:users`: List of users typing in chat
- `message:status`: Message status update

## Future Enhancements

- [ ] Voice/Video calls using WebRTC
- [ ] Media upload (images, videos, files)
- [ ] Message reactions/emojis
- [ ] Message forwarding
- [ ] Backup and restore
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] End-to-end encryption
- [ ] Message search improvements
- [ ] Stickers and animated emojis

## Security Considerations

- JWT tokens expire after 7 days
- Passwords are hashed with bcryptjs
- SQL injection protection via parameterized queries
- CORS enabled for secure cross-origin requests
- Environment variables for sensitive data

## Performance

- SQLite for lightweight, file-based database
- Socket.io for efficient real-time communication
- Lazy loading of messages
- Optimized CSS and minimal JavaScript
- Vite for fast build times and development

## Troubleshooting

### Database already exists error
Delete `messenger.db` file and restart the server

### Socket.io connection issues
- Check that both client and server are running
- Verify `CLIENT_URL` in server `.env` matches frontend URL
- Check browser console for errors

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf client/.vite`

## License

MIT

## Support

For issues, questions, or contributions, please open an issue on GitHub.