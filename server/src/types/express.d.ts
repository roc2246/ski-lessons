declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username?: string;
        admin?: boolean;
      };
      token?: string;
    }
  }
}

export {};