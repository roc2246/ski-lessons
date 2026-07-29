declare global {
  namespace NodeJS {
    interface ProcessEnv {
      URI?: string;
      LOCAL_ADMIN_USERNAME?: string;
      LOCAL_ADMIN_PASSWORD?: string;
      JWT_SECRET?: string;
      SMTP_USER?: string;
      APP_PASSWORD?: string;
      NODE_ENV?: string;
    }
  }
}

export {};
