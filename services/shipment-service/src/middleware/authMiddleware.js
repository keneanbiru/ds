const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Extract user info from JWT token OR headers set by API Gateway
 * Supports both:
 * 1. Direct token validation (when called directly on port 3002)
 * 2. Header-based user info (when called via Gateway)
 */
function extractUserFromHeaders(req, res, next) {
  console.log(`[extractUserFromHeaders] Checking for user info...`);
  console.log(`[extractUserFromHeaders] Headers:`, JSON.stringify(req.headers, null, 2));
  
  // First, try to get user info from headers (Gateway sets these)
  let userId = req.headers['x-user-id'];
  let userEmail = req.headers['x-user-email'];
  
  // If headers not found, try to extract from JWT token
  if (!userId) {
    console.log(`[extractUserFromHeaders] X-User-Id header not found, trying JWT token...`);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (token) {
      try {
        console.log(`[extractUserFromHeaders] Validating JWT token...`);
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
        userEmail = decoded.email;
        console.log(`[extractUserFromHeaders] ✅ Token validated! userId=${userId}, email=${userEmail}`);
      } catch (error) {
        console.log(`[extractUserFromHeaders] ❌ Token validation failed:`, error.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          error: 'INVALID_TOKEN',
        });
      }
    } else {
      console.log(`[extractUserFromHeaders] ❌ No token found in Authorization header`);
      return res.status(401).json({
        success: false,
        message: 'User information not found in request. Provide either X-User-Id header or valid JWT token.',
        error: 'MISSING_USER_INFO',
      });
    }
  }
  
  // Ensure userId is a string (not an array)
  const userIdString = Array.isArray(userId) ? userId[0] : (userId || '').toString().trim();
  const userEmailString = Array.isArray(userEmail) ? userEmail[0] : (userEmail || '').toString().trim();

  if (!userIdString) {
    console.log(`[extractUserFromHeaders] ❌ ERROR: userId is empty!`);
    return res.status(401).json({
      success: false,
      message: 'User information not found in request',
      error: 'MISSING_USER_INFO',
    });
  }

  // Attach user info to request
  req.user = {
    userId: userIdString,
    email: userEmailString,
  };
  
  console.log(`[extractUserFromHeaders] ✅ User info set: userId=${req.user.userId}, email=${req.user.email}`);

  next();
}

module.exports = extractUserFromHeaders;
