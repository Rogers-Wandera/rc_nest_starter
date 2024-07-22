export const envconfig = () => ({
  company: 'RTECH',
  mail: {
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    port: parseInt(process.env.EMAIL_PORT),
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    number: process.env.TWILIO_PHONE_NUMBER,
  },
  pahappa: {
    password: process.env.PAHAPPA_PASSWORD,
    username: process.env.PAHAPPA_USER_NAME,
    senderid: process.env.PAHAPPA_SENDER_ID,
  },
});

// create the type from the config
export type EnvConfig = ReturnType<typeof envconfig>;
export type mailconfig = EnvConfig['mail'];
export type twilioconfig = EnvConfig['twilio'];
export type pahappaconfig = EnvConfig['pahappa'];
