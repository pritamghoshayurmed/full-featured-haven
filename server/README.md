# Healthcare App Backend

This is the backend API for the Healthcare App with features for doctor authentication, appointment management, earnings tracking, and patient health records.

## Features

- **Authentication**: Secure JWT-based authentication for doctors, patients, and admins
- **Appointment Management**: Create, view, update, and cancel appointments
- **Earnings Tracking**: Track doctor earnings from appointments and consultations
- **Patient Health Records**: Store and retrieve patient health information
- **Real-time Chat**: Socket.io integration for doctor-patient communication

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **TypeScript**: Typed JavaScript
- **Socket.io**: Real-time bidirectional event-based communication
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing

## Prerequisites

- Node.js >= 14.x
- MongoDB Atlas account

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   cd full-featured-haven/server
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the server root directory
   - Use the `.env.example` file as a template
   - Fill in your MongoDB Atlas connection string (format: `mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority`)
   - Set a secure JWT secret

4. Seed the database with sample data:
   ```bash
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. For production:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (doctor/patient)
- `POST /api/auth/login` - Authenticate user and get token
- `GET /api/auth/me` - Get current user profile

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get specific doctor
- `PUT /api/doctors/profile` - Update doctor profile
- `PUT /api/doctors/availability` - Update doctor availability
- `PUT /api/doctors/toggle-availability` - Toggle doctor availability status
- `GET /api/doctors/dashboard/stats` - Get doctor dashboard statistics

### Appointments
- `POST /api/appointments` - Create a new appointment
- `GET /api/appointments` - Get filtered appointments
- `GET /api/appointments/:id` - Get specific appointment
- `PUT /api/appointments/:id/status` - Update appointment status
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment

### Patients
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile
- `GET /api/patients/medical-records` - Get patient medical records
- `GET /api/patients/:id` - Get patient by ID (for doctors)

### Chats
- `GET /api/chats` - Get all user chats
- `POST /api/chats` - Create or get chat with user
- `GET /api/chats/:id` - Get specific chat with messages
- `POST /api/chats/:id/messages` - Send message in chat
- `GET /api/chats/unread` - Get unread message count

### Earnings
- `GET /api/earnings` - Get doctor earnings
- `GET /api/earnings/stats` - Get earnings statistics
- `GET /api/earnings/:id` - Get specific earning

## Socket Events

### Client Events
- `userConnected` - User connects with their ID
- `sendMessage` - Send a new message
- `typing` - User is typing
- `stopTyping` - User stopped typing
- `disconnect` - User disconnects

### Server Events
- `usersOnline` - List of online users
- `receiveMessage` - Receive a new message
- `userTyping` - User is typing in a chat
- `userStopTyping` - User stopped typing in a chat

## License

This project is licensed under the ISC License. 