import { Server, Socket } from 'socket.io';

interface UserSocket {
  userId: string;
  socketId: string;
}

// Store connected users
let connectedUsers: UserSocket[] = [];

// Setup socket.io handlers
export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user login
    socket.on('userConnected', (userId: string) => {
      // Add user to connected users
      addUser(userId, socket.id);
      io.emit('usersOnline', getOnlineUsers());
      console.log(`User ${userId} is now online`);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      // Remove user from connected users
      removeUser(socket.id);
      io.emit('usersOnline', getOnlineUsers());
      console.log(`User disconnected: ${socket.id}`);
    });

    // Handle sending messages
    socket.on('sendMessage', ({ senderId, receiverId, content, chatId }) => {
      const receiver = connectedUsers.find(user => user.userId === receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('receiveMessage', {
          senderId,
          content,
          chatId,
          createdAt: new Date()
        });
      }
    });

    // Handle typing status
    socket.on('typing', ({ chatId, userId }) => {
      // Broadcast typing status to all connected users in the chat
      socket.broadcast.emit('userTyping', { chatId, userId });
    });

    // Handle stop typing
    socket.on('stopTyping', ({ chatId }) => {
      socket.broadcast.emit('userStopTyping', { chatId });
    });
  });
};

// Helper functions for managing connected users

// Add a user to connected users
const addUser = (userId: string, socketId: string) => {
  // Check if user is already in the list to avoid duplicates
  if (!connectedUsers.some(user => user.userId === userId)) {
    connectedUsers.push({ userId, socketId });
  } else {
    // Update socket ID if user is already connected
    connectedUsers = connectedUsers.map(user => 
      user.userId === userId ? { ...user, socketId } : user
    );
  }
};

// Remove a user from connected users
const removeUser = (socketId: string) => {
  connectedUsers = connectedUsers.filter(user => user.socketId !== socketId);
};

// Get online users
const getOnlineUsers = () => {
  return connectedUsers.map(user => user.userId);
}; 