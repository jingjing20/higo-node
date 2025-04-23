import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request } from 'express';
import { JwtCustomPayload } from './types';

// JWT密钥 - 实际生产环境应该放在环境变量中
const JWT_SECRET = 'your-jwt-secret-key';

/**
 * 生成JWT令牌
 */
export const generateToken = (userId: number) => {
  const payload = { id: userId };

  // 生成访问令牌 后续上线了换成1小时
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '300d' });

  // 生成刷新令牌，有效期7天
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

/**
 * 验证JWT令牌
 */
export const verifyToken = (token: string): JwtCustomPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtCustomPayload;
  } catch (error) {
    return null;
  }
};

/**
 * 从请求中获取令牌
 */
export const getTokenFromRequest = (request: Request) => {
  const authorization = request.header('Authorization');
  if (!authorization) return null;

  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
};

/**
 * 生成随机验证令牌
 */
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * 生成过期时间
 */
export const generateExpiryDate = (hours: number) => {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + hours);
  return expiryDate;
};

/**
 * 判断是否过期
 */
export const isExpired = (expiryDate: Date) => {
  return expiryDate < new Date();
};
