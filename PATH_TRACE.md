# Path Flow Analysis: Client → Gateway → Shipment Service

## Client Request
```
POST http://localhost:3000/api/v1/shipments
```

## API Gateway Flow

### Step 1: Gateway App (app.js:26)
```javascript
app.use('/api/v1', gatewayRoutes)
```
- **Client sends:** `/api/v1/shipments`
- **Express strips:** `/api/v1` 
- **Result:** `req.path = /shipments`
- **Preserved:** `req.originalUrl = /api/v1/shipments`

### Step 2: Gateway Routes (gatewayRoutes.js:34)
```javascript
router.use('/shipments', middleware1, authenticateToken, middleware2, proxy)
```
- **Matches:** `/shipments` (after `/api/v1` was stripped)
- **Express strips:** `/shipments`
- **Result:** `req.path = /` (for middleware chain)
- **Preserved:** `req.originalUrl = /api/v1/shipments`

### Step 3: Proxy Middleware (proxyMiddleware.js:20)
```javascript
pathRewrite: (path, req) => {
  // path = "/" (what Express sees after stripping /shipments)
  // req.originalUrl = "/api/v1/shipments" (full original path)
  return req.originalUrl; // Returns: "/api/v1/shipments"
}
```
- **Input path:** `/` (from Express after route matching)
- **originalUrl:** `/api/v1/shipments`
- **Returns:** `/api/v1/shipments`
- **Forwards to:** `http://shipment-service:3002/api/v1/shipments`

## Shipment Service Expects

### Step 1: Shipment App (app.js:23,26)
```javascript
app.use('/api/v1/shipments', extractUserFromHeaders)
app.use('/api/v1/shipments', shipmentRoutes)
```
- **Expects:** `/api/v1/shipments`

### Step 2: Shipment Routes (shipmentRoutes.js:21)
```javascript
router.post('/', createShipment)
```
- **Full path:** `/api/v1/shipments` + `/` = `/api/v1/shipments`

## Summary

✅ **Gateway forwards:** `/api/v1/shipments`
✅ **Shipment service expects:** `/api/v1/shipments`
✅ **PATHS MATCH!**

## The Real Issue

The problem is NOT the path - it's that:
1. The shipment route middleware (`[Shipments Route] ✅✅✅ ROUTE MATCHED!`) is NOT running
2. The `authenticateToken` middleware is NOT running
3. Therefore `req.user` is NOT set
4. The `onProxyReq` callback is NOT being called (so headers aren't set)
5. Shipment service receives request WITHOUT `X-User-Id` header
6. Shipment service returns 401 "User information not found in request"

## Root Cause

The `http-proxy-middleware` is being called, but the middleware chain BEFORE it is NOT executing. This suggests the proxy middleware might be consuming the request before the route middleware can run, OR there's an issue with how Express is matching the route.
