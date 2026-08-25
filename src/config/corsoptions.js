import allowedOrigins from "./allowOrigins.js";

export const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow non-browser requests (Postman, mobile, curl, same-origin)
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.toLowerCase().replace(/\/+$/, "");

    // 2. Exact match in allowedOrigins list
    if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. Regex match for any *.admiresoftech.com subdomain or root domain
    if (/^https?:\/\/([a-z0-9-]+\.)*admiresoftech\.com$/i.test(cleanOrigin)) {
      return callback(null, true);
    }

    // 4. Regex match for localhost / 127.0.0.1 on any port
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(cleanOrigin)) {
      return callback(null, true);
    }

    // 5. Safely reject unknown origins without throwing an error that crashes Express
    console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "x-refresh-token",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
