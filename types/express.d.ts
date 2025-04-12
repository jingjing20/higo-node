declare namespace Express {
  export interface Request {
    user: any;
    fileMetaData: { width?: number; height?: number; metadata?: {} };
    sort: string;
  }
}
