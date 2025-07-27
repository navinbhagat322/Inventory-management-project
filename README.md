# Inventory Management System

## Setup Instructions

1. **Prerequisites**
   - Docker and Docker Compose
   - Node.js (optional for local development)

2. **Environment Setup**
   - Copy `backend/.env.example` to `backend/.env`
   - Update `JWT_SECRET` with a secure key

3. **Running with Docker**
   ```bash
   docker-compose up --build
   ```

4. **Running Locally**
   ```bash
   # Backend
   cd backend
   npm install
   npm start

   # Frontend
   cd frontend
   npm install
   npm start
   ```

5. **Accessing the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Swagger Docs: http://localhost:5000/api-docs

6. **Default Admin Credentials**
   - Username: admin
   - Password: admin123
   (Create this user in MongoDB after first run)

## API Endpoints
- POST /api/auth/login - User authentication
- POST /api/products - Create product (admin only)
- PUT /api/products/:id/quantity - Update product quantity (admin only)
- GET /api/products - List products (paginated)

## Testing
- Import `postman_collection.json` into Postman for API testing
- Use Swagger UI at `/api-docs` for interactive API documentation

## Features
- JWT-based authentication
- Role-based access control (user/admin)
- Product management (CRUD)
- Pagination for product listing
- Responsive frontend with Tailwind CSS
- Admin portal for product management