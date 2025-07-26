# Centivo API Documentation

This document provides detailed information about the Centivo API endpoints, request/response formats, and error handling.

## Base URL

```
http://localhost:3000
```

For production:
```
https://api.example.com
```

## Authentication

Authentication is not implemented in this version of the API.

## Common Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": [Object or Array],
  "message": "Operation successful message",
  "count": 10,        // (Optional) Number of items returned
  "totalCount": 100   // (Optional) Total number of items available
}
```

### Error Response

```json
{
  "error": true,
  "message": "Error description"
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - The request was successful |
| 201 | Created - A new resource was successfully created |
| 400 | Bad Request - The request was invalid or cannot be served |
| 404 | Not Found - The requested resource does not exist |
| 500 | Internal Server Error - Something went wrong on the server |

## API Endpoints

### Health Check

#### GET /health

Check the health status of the API and its connection to the database.

**Response:**

```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2023-07-26T12:34:56.789Z",
  "database": {
    "status": "connected"
  }
}
```

If the database is not connected:

```json
{
  "status": "degraded",
  "uptime": 123.45,
  "timestamp": "2023-07-26T12:34:56.789Z",
  "database": {
    "status": "disconnected"
  }
}
```

### User Endpoints

#### GET /users/:id

Retrieve a user by their ID. Only returns users with age > 21.

**Parameters:**

| Name | Type | In | Description |
|------|------|-------|------------|
| id | string | path | MongoDB ObjectId of the user |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  },
  "message": "User retrieved successfully"
}
```

**Error Responses:**

- 400 Bad Request - If the ID format is invalid
- 404 Not Found - If the user doesn't exist or has age <= 21

#### GET /users

Get a list of users with optional age filtering.

**Query Parameters:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|------------|
| minAge | number | No | 21 | Minimum age filter |
| limit | number | No | 10 | Maximum number of results (1-100) |

**Success Response (200):**

```json
{
  "success": true,
  "count": 2,
  "totalCount": 5,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30
    },
    {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "age": 25
    }
  ],
  "message": "Retrieved 2 users with age > 21"
}
```

**Error Responses:**

- 400 Bad Request - If the query parameters are invalid

#### POST /users

Create a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

**Required Fields:**

| Name | Type | Description |
|------|------|-------------|
| name | string | User's full name |
| email | string | User's email address (must be unique) |
| age | number | User's age |

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  },
  "message": "User created successfully"
}
```

**Error Responses:**

- 400 Bad Request - If the request body is invalid or email already exists

## Rate Limiting

The API implements rate limiting to prevent abuse. Clients are limited to:

- 100 requests per minute per IP address
- 1000 requests per hour per IP address

When the rate limit is exceeded, the API will respond with a 429 Too Many Requests status code.

## Database Indexes

The API uses the following MongoDB indexes for optimal performance:

- `users.age`: Index on the age field for efficient filtering
- `users.email`: Unique index on the email field to prevent duplicates

## Pagination

Currently, the API supports basic pagination through the `limit` parameter. Future versions will include more advanced pagination features.

## Versioning

The current API version is v1. The version is not included in the URL path but may be in future releases.

## Support

For support or questions about the API, please contact support@example.com.
