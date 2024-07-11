export const envconfig = () => ({
  port: parseInt(process.env.PORT, 10) || 3600,
  baseUrl: process.env.BASE_URL,
  frontUrl: process.env.BASE_FRONT_URL,
  encrytKey: process.env.ENCRYPTION_KEY,
  comapny: process.env.COMPANY_NAME,
  baseapi: process.env.BASE_API,
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  mail: {
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    port: parseInt(process.env.EMAIL_PORT),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refresh: process.env.JWT_REFRESH,
  },
  cloudinary: {
    name: process.env.CLOUD_NAME,
    publicKey: process.env.CLOUD_API_KEY,
    privateKey: process.env.CLOUD_API_SECRET,
    folder: process.env.CLOUD_MAIN_FOLDER,
  },
});

// create the type from the config
export type EnvConfig = ReturnType<typeof envconfig>;
export type dbconfig = EnvConfig['database'];
export type mailconfig = EnvConfig['mail'];
export type cloudinaryconfig = EnvConfig['cloudinary'];
export type jwtconfig = EnvConfig['jwt'];
