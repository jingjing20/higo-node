declare namespace Express {
  export interface Request {
    user: { id?: number; email?: string; nickname?: string };
    fileMetaData: { width?: number; height?: number; metadata?: {} };
    sort: string;
  }
}
