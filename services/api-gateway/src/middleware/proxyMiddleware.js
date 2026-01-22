const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

/**
 * Create proxy middleware for a service
 */
function createServiceProxy(serviceName, targetUrl) {
  console.log(`[Proxy] Creating proxy middleware for ${serviceName} → ${targetUrl}`);

  // Create the proxy middleware
  const proxyMiddleware = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    timeout: 30000,
    pathRewrite: (path, req) => {
      const fullPath = req.originalUrl || req.url;
      console.log(`[Proxy PathRewrite] path: ${path}, originalUrl: ${req.originalUrl} → forwarding: ${fullPath}`);
      return fullPath;
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`[Proxy onProxyReq] ✅ Proxy request being sent to ${serviceName}!`);
        console.log(`[Proxy onProxyReq] ${req.method} ${req.originalUrl} → ${targetUrl}${proxyReq.path}`);
        console.log(`[Proxy onProxyReq] req.user:`, req.user ? 'SET' : 'NOT SET');

        // Log ALL headers being sent
        console.log(`[Proxy onProxyReq] Headers being sent to ${serviceName}:`);
        const headersToSend = {};
        proxyReq.getHeaders && Object.keys(proxyReq.getHeaders()).forEach(key => {
          headersToSend[key] = proxyReq.getHeader(key);
        });
        console.log(JSON.stringify(headersToSend, null, 2));

        // Log request body if available
        if (req.body && Object.keys(req.body).length > 0) {
          console.log(`[Proxy onProxyReq] Request body being sent:`);
          console.log(JSON.stringify(req.body, null, 2));
        }

        // Forward user info as headers for downstream services
        if (req.user) {
          console.log(`[Proxy onProxyReq] ✅ Setting user headers: userId=${req.user.userId}, email=${req.user.email}`);
          proxyReq.setHeader('X-User-Id', req.user.userId);
          proxyReq.setHeader('X-User-Email', req.user.email);
        } else {
          console.log(`[Proxy onProxyReq] ⚠️ req.user is not set! Cannot forward user info.`);
          console.log(`[Proxy onProxyReq] ⚠️ This means authenticateToken middleware did NOT run!`);
        }

        // Forward original headers
        if (req.headers['content-type']) {
          proxyReq.setHeader('Content-Type', req.headers['content-type']);
        }

        // FIX: Re-stream the body if it was already parsed by express.json()
        if (req.body && Object.keys(req.body).length > 0) {
          console.log(`[Proxy onProxyReq] 🔄 Re-streaming parsed body...`);
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }

        // Log final headers after setting user headers
        console.log(`[Proxy onProxyReq] Final headers after setting user info:`);
        const finalHeaders = {};
        proxyReq.getHeaders && Object.keys(proxyReq.getHeaders()).forEach(key => {
          finalHeaders[key] = proxyReq.getHeader(key);
        });
        console.log(JSON.stringify(finalHeaders, null, 2));
        console.log(`${'='.repeat(80)}\n`);
      },
      error: (err, req, res) => {
        console.error(`[Proxy Error] ${serviceName}:`, err.message);
        if (!res.headersSent) {
          res.status(503).json({
            success: false,
            message: `${services[serviceName]?.name || serviceName} is unavailable`,
            error: 'SERVICE_UNAVAILABLE',
            details: err.message,
          });
        }
      },
      proxyRes: (proxyRes, req, res) => {
        console.log(`[Proxy onProxyRes] ✅ Response received! Status: ${proxyRes.statusCode}`);
      },
    }
  });

  // Wrap the proxy to ensure it only runs after middleware chain
  return (req, res, next) => {
    console.log(`[Proxy Wrapper] ${serviceName} - About to proxy, req.user:`, req.user ? `SET (${req.user.userId})` : 'NOT SET');
    // Call the proxy middleware
    proxyMiddleware(req, res, next);
  };
}

module.exports = createServiceProxy;
