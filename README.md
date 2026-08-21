# E-Commerce Web Application

A full-stack e-commerce application built with React, Node.js, Express and MongoDB.

## Features
- User registration and JWT login
- Role-based access: User/Admin
- Product catalog
- Search and category filtering
- Add/remove/update cart
- Checkout and order creation
- User order history and order tracking
- Admin product CRUD
- Admin order management
- REST API
- Responsive UI

## Requirements
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection

## Setup

### 1. Backend
```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

For macOS/Linux:
```bash
cp .env.example .env
```

Backend runs on `http://localhost:5000`.

### 2. Frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Hosting

Deploy the three parts separately:

1. **MongoDB Atlas**: create a cluster and database user, then use its connection string as the backend `MONGO_URI`.
2. **Render or Railway**: deploy the `backend` folder with start command `npm start`. Set `PORT`, `MONGO_URI`, and a long random `JWT_SECRET`. Run `npm run seed` once after deployment.
3. **Vercel or Netlify**: deploy `frontend` and `admin` as separate Vite projects. In both projects, set `VITE_API_URL` to the deployed API URL ending with `/api`, such as `https://your-api.onrender.com/api`.

The frontend and admin apps use the local API automatically during development and the `VITE_API_URL` value after hosting.

## Demo Admin
After running the seed command:
- Email: admin@gmail.com
- Password: admin@123

## Demo User
- Email: user@example.com
- Password: User@123

Change these credentials before using the application publicly.
