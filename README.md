# TransitOps

**TransitOps** is a full-stack fleet management platform designed to help organizations efficiently manage vehicles, drivers, trips, maintenance, expenses, and operational analytics from a centralized dashboard.

## Features

- User Registration and Login
- JWT Authentication and Role-Based Authorization
- Vehicle Fleet Management
- Driver Management
- Trip Management
- Vehicle Maintenance Tracking
- Expense and Fuel Management
- Reports and Analytics
- Vehicle Search and Filtering
- Responsive Dashboard
## Live demo-
### Vercel- https://oddo-hackathon-zeta.vercel.app/

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- CSS Modules
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcrypt
- CORS

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## Project Structure

```text
transitops/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── router.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── index.js
│   └── package.json
│
└── README.md
```

## Getting Started

### Clone the Repository

```bash
git clone <your-repository-url>
cd transitops
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file inside the `backend` directory:

```env
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
PORT=8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

## API Modules

- `/api/users`
- `/api/vehicles`
- `/api/drivers`
- `/api/trips`
- `/api/expenses`
- `/api/fuel-logs`
- `/api/maintenance`
- `/api/reports`
- `/api/dashboard`

Protected APIs require a JWT token:

```text
Authorization: Bearer <token>
```

## User Roles

TransitOps supports role-based access for:

- Fleet Manager
- Driver
- Safety Officer
- Financial Analyst

Each role has different permissions for accessing and managing fleet resources.

## Security

- Password hashing using bcrypt
- JWT-based authentication
- Role-based authorization
- Protected API routes
- Environment variables for sensitive credentials

> Never commit `.env` files, JWT secrets, or database credentials to GitHub.

## Future Improvements

- Real-time vehicle tracking
- Advanced fleet analytics
- Automated maintenance reminders
- Route optimization
- Exportable reports
- Driver performance analytics

## Contributing

Contributions are welcome. Create a separate branch for your feature or bug fix and submit a pull request after testing your changes.

## License

This project was developed for educational and hackathon purposes.
