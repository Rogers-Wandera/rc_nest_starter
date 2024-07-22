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
  firebase_web: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  },
  firebaseServiceAccount: {
    type: process.env.FIREBASE_SERVICE_TYPE,
    project_id: process.env.FIREBASE_SERVICE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_SERVICE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_SERVICE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_SERVICE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_SERVICE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_SERVICE_AUTH_URI,
    token_uri: process.env.FIREBASE_SERVICE_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_SERVICE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_SERVICE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_SERVICE_UNIVERSE_DOMAIN,
  },
  firebase_vapid: process.env.FIREBASE_VAPID,
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
export type cloudinaryconfig = EnvConfig['cloudinary'];
export type jwtconfig = EnvConfig['jwt'];
export type firebase_web_config = EnvConfig['firebase_web'];
export type firebase_account = EnvConfig['firebaseServiceAccount'];
