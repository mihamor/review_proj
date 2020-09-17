

const config = {
  apiPort: process.env.API_PORT,
  databaseUrl: process.env.DATABASE_URL,
  serviceUrl: process.env.SERVICE_URL,
  reviewsSecret: process.env.SECRET,
};

console.log(config);
export default config;