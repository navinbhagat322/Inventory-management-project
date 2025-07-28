# Inventory Management System
https://github.com/user-attachments/assets/cbe04f8c-e2af-4b26-a3f4-23b30ee2b7b6
This is a full-stack inventory management system designed to manage products and user authentication for a small business. It exposes REST APIs for user login, product management, and inventory tracking, with an optional admin portal and analytics. The application is built using React for the frontend, Node.js with Express for the backend, and MongoDB for the database, all containerized with Docker.

## Features
- User authentication with JWT (Login).
- Product addition, editing, and deletion.
- Product quantity updates.
- Paginated product listing with search.
- Analytics for most added products, top expensive products, and total inventory value.
- Admin portal for management (stretch goal).
- Responsive dashboard (stretch goal).

## Tech Stack
- **Frontend**: React, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Containerization**: Docker, Docker Compose
- **API Documentation**: OpenAPI(via backend integration)
- **Testing**: Postman collection included
- **Build Tools**: npm

## Prerequisites
- **Docker**: Ensure Docker and Docker Compose are installed on your system.
  - [Install Docker](https://docs.docker.com/get-docker/)
  - [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Git**: To clone the repository.
  - [Install Git](https://git-scm.com/downloads)
- **Node.js** (optional, for local development if not using Docker).
  - [Install Node.js](https://nodejs.org/)
- **MongoDB** (optional, for local development if not using Docker).
  - [Install MongoDB](https://www.mongodb.com/try/download/community)

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/navinbhagat322/Inventory-management-project.git
   cd Inventory_management
   ```

2. **Configure Environment Variables**
   - Create a `.env` file in the `backend` directory with the following variables:
     ```
     JWT_SECRET=your-secret-key
     MONGO_URI=mongodb://mongo:27017/inventory
     PORT=5000
     ```
   - Replace `your-secret-key` with a secure random string for JWT authentication.

3. **Build and Run with Docker**
   - Use Docker Compose to build and start the application:
     ```bash
     docker-compose build
     docker-compose up -d
     ```
   - The `-d` flag runs the containers in detached mode.

4. **Verify the Application**
   - Open your browser and navigate to:
     - `http://localhost:3000` for the frontend (dashboard).
     - `http://localhost:5000` for the backend API (optional, for testing).
   - The admin portal will be available at `http://localhost:3000/admin` after logging in as an admin.

## Usage
- **Login**: Initially, no users are set up. Modify the backend (`backend/src/routes/auth.js`) to include a default admin user or implement a registration endpoint. Use the POST `/login` endpoint with:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
  - Success: Returns a JWT token.
  - Failure: Returns an error message.
- **Dashboard**: View product lists and analytics.
- **Admin Portal**: Manage products (add, edit, delete) with search and pagination.

## API Endpoints
- **POST /login**: Authenticate user and return JWT token.
- **POST /products**: Add a new product.
  - Payload:
    ```json
    {
      "name": "string",
      "type": "string",
      "sku": "string",
      "image_url": "string",
      "description": "string",
      "quantity": integer,
      "price": number
    }
    ```
  - Response: Product ID and confirmation.
- **PUT /products/{id}/quantity**: Update product quantity.
  - Payload:
    ```json
    {
      "quantity": integer
    }
    ```
  - Response: Updated product details or confirmation.
- **GET /products**: Retrieve paginated product list.
  - Parameters: `page`, `limit`, `name` (search).
  - Response: List of products with pagination metadata.

**Note**: All endpoints require JWT authentication in the `Authorization` header.

## Development
- **Frontend**: Located in the `frontend` directory. Run `npm install` and `npm start` if developing locally without Docker.
- **Backend**: Located in the `backend` directory. Run `npm install` and `node index.js` after setting up MongoDB locally.
- Use `docker-compose logs <service>` (e.g., `backend` or `frontend`) to debug issues.

## Scripts
- **Rebuild**: `docker-compose build`
- **Restart**: `docker-compose up -d`
- **Stop**: `docker-compose down`
- **Logs**: `docker-compose logs`

## Database Schema
- **Collection**: `products`
  - `_id`: ObjectId (auto-generated)
  - `name`: String
  - `type`: String
  - `sku`: String (unique)
  - `image_url`: String
  - `description`: String
  - `quantity`: Number
  - `price`: Number
  - `createdAt`: Date
  - `updatedAt`: Date
- **Collection**: `users` (for authentication)
  - `_id`: ObjectId (auto-generated)
  - `username`: String (unique)
  - `password`: String (hashed)
  - `role`: String (e.g., "admin")

**Initialization**: The schema is created automatically by MongoDB when data is inserted. No separate script is required.

## API Documentation
- OpenAPI documentation is integrated into the backend. Access it at `http://localhost:5000/api-docs` after running the application.

## Testing
- A sample Postman collection is included in the `postman` directory. Import it into Postman to test the APIs.
- Test script example (run in backend directory):
  ```javascript
  const axios = require('axios');
  const assert = require('assert');

  async function testApi() {
    try {
      // Test login
      const loginResponse = await axios.post('http://localhost:5000/login', {
        username: 'admin',
        password: 'password'
      });
      const token = loginResponse.data.token;
      assert(token, 'Login failed');

      // Test add product
      const addResponse = await axios.post('http://localhost:5000/products', {
        name: 'Test Product',
        type: 'Test Type',
        sku: 'TEST123',
        quantity: 10,
        price: 99.99
      }, { headers: { Authorization: `Bearer ${token}` } });
      const productId = addResponse.data.id;
      assert(productId, 'Product addition failed');

      // Test update quantity
      const updateResponse = await axios.put(`http://localhost:5000/products/${productId}/quantity`, {
        quantity: 15
      }, { headers: { Authorization: `Bearer ${token}` } });
      assert(updateResponse.data.quantity === 15, 'Quantity update failed');

      // Test get products
      const getResponse = await axios.get('http://localhost:5000/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      assert(getResponse.data.products.length > 0, 'Get products failed');

      console.log('All tests passed!');
    } catch (err) {
      console.error('Test failed:', err.message);
    }
  }

  testApi();
  ```

## Contact
For questions or support, open an issue or contact [navinbhagat322@gmail.com](mailto:navinbhagat322@gmail.com).
