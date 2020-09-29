type AppConfig = {
  googleApiKey: string,
};

const config: AppConfig = {
  googleApiKey: process.env.GOOGLE_API_KEY || '',
};


export default config;