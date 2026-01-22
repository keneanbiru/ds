# How Token/User Info Flows: Login → Shipment Creation

## Important: Shipment Service Does NOT Get a Token!

The shipment service **does NOT receive a JWT token**. Instead, it receives **user information via headers** that the API Gateway sets after validating the token.

## Complete Flow

### Step 1: Login (Client → Auth Service via Gateway)
```
Client Request:
  POST /api/v1/auth/login
  Body: { "email": "user@example.com", "password": "password123" }

Gateway:
  → Proxies to Auth Service (no auth required)

Auth Service:
  → Validates credentials
  → Generates JWT token containing: { userId: "uuid", email: "user@example.com" }
  → Returns: { token: "eyJhbGciOiJIUzI1NiIs..." }

Client:
  → Receives JWT token
```

### Step 2: Create Shipment (Client → Gateway → Shipment Service)

```
Client Request:
  POST /api/v1/shipments
  Headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..." }
  Body: { "origin": "NYC", "destination": "LA", "weight_kg": 10 }

API Gateway Processing:
  1. Route matches: router.use('/shipments', ...)
  2. authenticateToken middleware runs:
     - Extracts token from Authorization header
     - Verifies JWT using JWT_SECRET
     - Decodes token to get: { userId: "uuid", email: "user@example.com" }
     - Sets req.user = { userId: "uuid", email: "user@example.com" }
  3. Proxy middleware runs (onProxyReq callback):
     - Checks if req.user exists
     - Sets headers on proxied request:
       X-User-Id: "uuid"
       X-User-Email: "user@example.com"
     - Proxies request to shipment service

Shipment Service Receives:
  POST /api/v1/shipments
  Headers: {
    X-User-Id: "uuid"           ← User ID from decoded JWT
    X-User-Email: "user@example.com"  ← Email from decoded JWT
    Content-Type: "application/json"
  }
  Body: { "origin": "NYC", "destination": "LA", "weight_kg": 10 }

Shipment Service Processing:
  1. extractUserFromHeaders middleware:
     - Reads X-User-Id header
     - Reads X-User-Email header
     - Sets req.user = { userId: "uuid", email: "user@example.com" }
  2. Controller uses req.user.userId to create shipment
```

## Key Points

1. **JWT Token is ONLY validated at Gateway level**
   - Gateway validates token and extracts user info
   - Token is NOT forwarded to shipment service

2. **User info is forwarded via custom headers**
   - `X-User-Id`: The user's UUID
   - `X-User-Email`: The user's email
   - These are set by Gateway's proxy middleware

3. **Shipment service trusts the Gateway**
   - Shipment service doesn't validate JWT
   - It trusts that Gateway has already validated the token
   - It just reads the user info from headers

## Current Problem

The shipment service is getting 401 "User information not found in request" because:
- The Gateway's `authenticateToken` middleware is NOT running (route middleware not executing)
- Therefore `req.user` is NOT set
- Therefore `onProxyReq` callback cannot set `X-User-Id` and `X-User-Email` headers
- Shipment service receives request WITHOUT these headers
- Shipment service returns 401

## Solution

Ensure the middleware chain runs in order:
1. Route middleware (logs route match)
2. authenticateToken (validates JWT, sets req.user)
3. Proxy middleware (forwards req.user as headers)
