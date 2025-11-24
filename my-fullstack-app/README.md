# Life Connect - Medical Donation Platform

A full-stack web application for managing blood donations, medical supplies, and connecting donors with those in need.

## Features

- User authentication (JWT-based)
- Multiple user roles (donor, hospital, NGO, pharmacy, blood bank, volunteer, government)
- Blood donation tracking
- Medical supply requests
- Blood donation camps management
- Real-time donation history

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React
- TypeScript
- Vite
- React Router
- Context API for state management

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Donations
- `GET /api/donations` - Get user donations (Protected)
- `POST /api/donations` - Create donation record (Protected)

### Camps
- `GET /api/camps` - Get all blood donation camps
- `POST /api/camps` - Create a new camp (Protected)

### Requests
- `GET /api/requests` - Get all medical requests
- `POST /api/requests` - Create a new request (Protected)

## Project Structure

```
my-fullstack-app/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── campController.js
│   │   ├── donationController.js
│   │   └── requestController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Camp.js
│   │   ├── Donation.js
│   │   └── Request.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── campRoutes.js
│   │   ├── donationRoutes.js
│   │   └── requestRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   └── App.tsx
    ├── package.json
    └── vite.config.ts
```

## Recent Updates

- Fixed authentication middleware logic error
- Improved error handling across all controllers
- Added MongoDB Atlas integration
- Enhanced API responses with populated data
- Added better logging for debugging

## License

MIT

## Contributors

- Romit
- Team Life Connect
