declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      JWT_SECRET: string;
      JWT_ISSUER: string;
      JWT_AUDIENCE: string;
      S3_ACCESS_KEY: string;
      S3_SECRET_KEY: string;
      S3_ENDPOINT: string;
      S3_BUCKET_NAME: string;
      S3_REGION: string;
      COMMUNICATION_EMAIL_DOMAIN: string;
    }
  }
}
export {}; // Export an empty object to ensure this file is treated as a module
