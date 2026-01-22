# Postman Testing Guide for Shipment Service

## Step 1: Login to Get JWT Token

### Request
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "fulltest@example.com",
    "password": "Test1234"
  }
  ```

### Expected Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "email": "fulltest@example.com",
      "name": "Full Test"
    }
  }
}
```

**Copy the `token` value from the response!**

---

## Step 2: Create Shipment (Through Gateway)

### Request
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/shipments`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <PASTE_TOKEN_FROM_STEP_1>
  ```
  Example:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Body (raw JSON):**
  ```json
  {
    "origin": "New York",
    "destination": "Los Angeles",
    "weight_kg": 25.5
  }
  ```

### Expected Response (Success)
```json
{
  "success": true,
  "message": "Shipment created successfully",
  "data": {
    "shipment": {
      "id": "uuid-here",
      "user_id": "uuid-here",
      "origin": "New York",
      "destination": "Los Angeles",
      "status": "pending",
      "weight_kg": "25.50",
      "created_at": "2026-01-22T...",
      "updated_at": "2026-01-22T..."
    }
  }
}
```

### Expected Response (Current Error)
```json
{
  "success": false,
  "message": "User information not found in request",
  "error": "MISSING_USER_INFO"
}
```

---

## Step 3: Check Gateway Logs

After making the shipment request, check the gateway logs to see:
1. If route middleware ran
2. If authenticateToken ran
3. If onProxyReq callback ran
4. What headers were sent to shipment service

**Command:**
```powershell
docker logs dlms-api-gateway --tail 50
```

---

## Step 4: Check Shipment Service Logs

Check what the shipment service received:

**Command:**
```powershell
docker logs dlms-shipment-service --tail 50
```

Look for:
- `[DEBUG] Headers:` - Shows all headers received
- `[DEBUG] Body:` - Shows request body
- `[extractUserFromHeaders]` - Shows if X-User-Id header was found

---

## Quick Test Collection

### Collection Variables (Set in Postman)
1. `base_url` = `http://localhost:3000`
2. `token` = (set automatically from login response)

### Pre-request Script for Shipment Request
```javascript
// Auto-set token from environment variable
if (pm.environment.get("token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("token")
    });
}
```

### Tests Script for Login Request
```javascript
// Save token to environment variable
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set("token", jsonData.data.token);
        console.log("Token saved:", jsonData.data.token);
    }
}
```
