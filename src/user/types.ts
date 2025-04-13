import { JwtPayload } from 'jsonwebtoken';

export interface JwtCustomPayload extends JwtPayload {
  id: number;
}

// 扩展Express的Request类型
declare namespace Express {
  export interface Request {
    user?: {
      id: number;
    };
  }
}
