export const config = {
  port: parseInt(process.env.PORT || '4000'),
  host: process.env.HOST || '0.0.0.0',

  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '5'),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
    cache: parseInt(process.env.RATE_LIMIT_CACHE || '100')
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880')
  },

  auth: {
    verifyToken: process.env.BG_VERIFY_TOKEN
  },

  server: {
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
    bodyLimit: parseInt(process.env.BODY_LIMIT || '5242880')
  }
};
