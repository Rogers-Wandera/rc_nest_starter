export const envconfig = () => ({
  port: parseInt(process.env.PORT, 10) || 3600,
  baseUrl: process.env.BASE_URL,
  frontUrl: process.env.BASE_FRONT_URL,
  encrytKey: process.env.ENCRYPTION_KEY,
  company: process.env.COMPANY_NAME,
  baseapi: process.env.BASE_API,
  rabbitmqurl: process.env.RMQ_URL,
  socketurl: process.env.SOCKET_URL,
  sockettoken: process.env.SOCKET_TOKEN,
  cloudinary: {
    name: process.env.CLOUD_NAME,
    publicKey: process.env.CLOUD_API_KEY,
    privateKey: process.env.CLOUD_API_SECRET,
    folder: process.env.CLOUD_MAIN_FOLDER,
  },
});

// create the type from the config
export type EnvConfig = ReturnType<typeof envconfig>;
export type cloudinaryconfig = EnvConfig['cloudinary'];
