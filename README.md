# Centivo Node.js API with MongoDB

A robust RESTful API built with Node.js, Express, and MongoDB for the Centivo take-home assessment.

## 📋 Features

- **User Management**: Create and retrieve users with age filtering
- **Data Validation**: Comprehensive input validation including MongoDB ObjectId validation
- **Error Handling**: Centralized error handling with custom error classes
- **Health Check**: API health monitoring endpoint with database connection status
- **Testing**: Comprehensive test suite with Jest and Supertest
- **CI/CD Pipeline**: Automated testing, security scanning, and deployment

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- MongoDB (v5.x or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/centivo-api.git
   cd centivo-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/centivo
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm start
   ```

## 🔍 API Endpoints

### Health Check
- `GET /health` - Check API and database health

### User Endpoints
- `GET /users/:id` - Get a user by ID (only returns users with age > 21)
- `GET /users` - Get users with optional age filtering
  - Query Parameters:
    - `minAge` (optional, default: 21) - Minimum age filter
    - `limit` (optional, default: 10) - Maximum number of results
- `POST /users` - Create a new user
  - Request Body:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30
    }
    ```

## 🧪 Testing

The project includes a comprehensive test suite covering all API endpoints, database operations, and error handling.

Run tests with:
```bash
npm test
```

Run tests with coverage report:
```bash
npm run test:coverage
```

### Test Structure
- Unit tests for models and utilities
- Integration tests for API endpoints
- Database connection and initialization tests
- Validation and error handling tests

## 🔧 Project Structure

```
centivo-api/
├── src/
│   ├── config/
│   │   ├── database.js     # MongoDB connection setup
│   │   └── dbInit.js       # Database initialization
│   ├── controllers/
│   │   └── userController.js # User API controllers
│   ├── middleware/
│   │   └── validation.js   # Request validation middleware
│   ├── models/
│   │   └── userModel.js    # User data model
│   ├── routes/
│   │   └── userRoutes.js   # API route definitions
│   ├── utils/
│   │   └── errorHandler.js # Error handling utilities
│   └── index.js            # Application entry point
├── test/
│   ├── database.test.js    # Database connection tests
│   ├── errorHandler.test.js # Error handling tests
│   ├── health.test.js      # Health endpoint tests
│   ├── setup.js            # Global test setup
│   ├── userApi.test.js     # User API endpoint tests
│   ├── userModel.test.js   # User model tests
│   └── validation.test.js  # Validation middleware tests
├── .env                    # Environment variables
├── .github/
│   └── workflows/          # CI/CD workflow definitions
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## 🛡️ Security Features

- Input validation for all API endpoints
- MongoDB ObjectId validation
- Helmet for secure HTTP headers
- Rate limiting for API endpoints
- Error handling that doesn't expose sensitive information

## 📈 Testing

The project includes comprehensive testing:

1. Unit tests for all components
2. Integration tests for API endpoints
3. Tests run on multiple Node.js versions (16, 18, 20)
4. Tests run on multiple MongoDB versions (5, 6, 7)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Centivo for the opportunity to demonstrate my skills
- The Node.js, Express, and MongoDB communities for their excellent documentation
