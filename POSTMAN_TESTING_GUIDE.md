# 🧪 Postman Testing Guide for DLMS

This guide will help you test the Distributed Logistics Management System using Postman.

## 📋 Prerequisites

1. **Postman** installed (Desktop or Web version)
2. **Services Running**: Make sure all services are up:
   ```bash
   docker-compose ps
   ```
   You should see:
   - `dlms-postgres` (healthy)
   - `dlms-rabbitmq` (healthy)
   - `dlms-auth-service` (healthy)
   - `dlms-api-gateway` (healthy)

## 🔗 Base URLs

- **API Gateway**: `http://localhost:3000`
- **Auth Service (Direct)**: `http://localhost:3001` (for testing)

---

## 🚀 Quick Start: Testing Flow

### Step 1: Health Check

**Request:**
```
GET http://localhost:3000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API Gateway is healthy",
  "timestamp": "2026-01-22T..."
}
```

---

### Step 2: Register a New User

**Request:**
```
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "createdAt": "2026-01-22T..."
    }
  }
}
```

**Test Duplicate Email:**
Try registering the same email again - should return **409 Conflict**:
```json
{
  "success": false,
  "message": "Email already exists",
  "error": "DUPLICATE_EMAIL"
}
```

---

### Step 3: Login and Get JWT Token

**Request:**
```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "email": "john.doe@example.com",
      "name": "John Doe"
    }
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` value - you'll need it for protected endpoints!

---

### Step 4: Test Invalid Login

**Request:**
```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "WrongPassword"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "error": "INVALID_CREDENTIALS"
}
```

---

### Step 5: Test Protected Endpoint (Without Token)

**Request:**
```
GET http://localhost:3000/api/v1/shipments
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Access token required",
  "error": "MISSING_TOKEN"
}
```

---

### Step 6: Test Protected Endpoint (With Invalid Token)

**Request:**
```
GET http://localhost:3000/api/v1/shipments
Authorization: Bearer invalid-token-here
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid or malformed token",
  "error": "INVALID_TOKEN"
}
```

---

### Step 7: Test Protected Endpoint (With Valid Token)

**Request:**
```
GET http://localhost:3000/api/v1/shipments
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Note:** Since Shipment Service isn't built yet, you'll get a **503 Service Unavailable**:
```json
{
  "success": false,
  "message": "Shipment Service is unavailable",
  "error": "SERVICE_UNAVAILABLE"
}
```

This is **expected** - it means the Gateway is working correctly and trying to route to the service!

---

## 📝 Postman Collection Setup

### Create a Postman Collection

1. **Create New Collection**: "DLMS API Tests"

2. **Add Environment Variables**:
   - Create a new Environment: "DLMS Local"
   - Add variable: `base_url` = `http://localhost:3000`
   - Add variable: `token` = (leave empty, will be set after login)

3. **Create Requests**:

#### Request 1: Health Check
- **Method**: GET
- **URL**: `{{base_url}}/health`
- **No headers needed**

#### Request 2: Register User
- **Method**: POST
- **URL**: `{{base_url}}/api/v1/auth/register`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User"
  }
  ```

#### Request 3: Login
- **Method**: POST
- **URL**: `{{base_url}}/api/v1/auth/login`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "Test1234"
  }
  ```
- **Tests Tab** (to auto-save token):
  ```javascript
  if (pm.response.code === 200) {
      var jsonData = pm.response.json();
      pm.environment.set("token", jsonData.data.token);
      console.log("Token saved:", jsonData.data.token);
  }
  ```

#### Request 4: Get Shipments (Protected)
- **Method**: GET
- **URL**: `{{base_url}}/api/v1/shipments`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Request 5: Test Without Token
- **Method**: GET
- **URL**: `{{base_url}}/api/v1/shipments`
- **No Authorization header**

---

## 🧪 Test Scenarios Checklist

### ✅ Authentication Tests

- [ ] **Health Check** - Returns 200 OK
- [ ] **Register New User** - Returns 201 Created
- [ ] **Register Duplicate Email** - Returns 409 Conflict
- [ ] **Login with Valid Credentials** - Returns 200 OK with JWT token
- [ ] **Login with Invalid Email** - Returns 401 Unauthorized
- [ ] **Login with Invalid Password** - Returns 401 Unauthorized
- [ ] **Access Protected Route Without Token** - Returns 401 Unauthorized
- [ ] **Access Protected Route With Invalid Token** - Returns 401 Unauthorized
- [ ] **Access Protected Route With Valid Token** - Returns 503 (service not built yet, but Gateway works!)

---

## 🔍 Troubleshooting

### Issue: "Request Timeout"
- **Solution**: Check if services are running:
  ```bash
  docker-compose ps
  ```
- Make sure all services show "healthy" status

### Issue: "Connection Refused"
- **Solution**: Verify services are listening:
  ```bash
  docker logs dlms-api-gateway
  docker logs dlms-auth-service
  ```

### Issue: "401 Unauthorized" with valid token
- **Solution**: 
  - Check JWT_SECRET matches in both Gateway and Auth Service
  - Verify token hasn't expired (24h default)
  - Make sure token is in format: `Bearer <token>`

### Issue: "503 Service Unavailable"
- **Solution**: This is expected for services not yet built (Shipment, Warehouse, Tracking)
- The Gateway is working correctly - it's trying to route but the service doesn't exist yet

---

## 📊 Expected Status Codes

| Endpoint | Method | Auth Required | Expected Status |
|----------|--------|---------------|-----------------|
| `/health` | GET | No | 200 OK |
| `/api/v1/auth/register` | POST | No | 201 Created |
| `/api/v1/auth/login` | POST | No | 200 OK |
| `/api/v1/shipments` | GET | Yes | 503 (service not built) |
| `/api/v1/warehouse` | GET | Yes | 503 (service not built) |
| `/api/v1/tracking` | GET | Yes | 503 (service not built) |

---

## 🎯 Next Steps

Once you've verified all tests pass:
1. ✅ **Milestone 1**: Infrastructure ✅ Complete
2. ✅ **Milestone 2**: Auth Service ✅ Complete
3. ✅ **Milestone 3**: API Gateway ✅ Complete
4. ⬜ **Milestone 4**: Shipment Service (Next)

---

## 💡 Tips

1. **Save Token Automatically**: Use Postman's "Tests" tab to save the JWT token to an environment variable after login
2. **Use Environments**: Create separate environments for local, staging, production
3. **Export Collection**: Save your collection to share with team
4. **Use Pre-request Scripts**: Automatically add Authorization header if token exists

---

**Happy Testing! 🚀**
