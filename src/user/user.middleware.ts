import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import { getTokenFromRequest, verifyToken } from './auth.util';

/**
 * HASH 密码
 */
export const hashPassword = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { password } = request.body;

  if (!password) {
    return next(new Error('密码不能为空'));
  }

  // HASH 密码
  request.body.password = await bcrypt.hash(password, 10);

  // 下一步
  next();
};

/**
 * 验证Token
 */
export const authGuard = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    // 获取Token
    const token = getTokenFromRequest(request);

    if (!token) {
      return response.status(401).send({ message: '请先登录' });
    }

    // 验证Token
    const decoded = verifyToken(token);

    if (!decoded) {
      return response.status(401).send({ message: '登录已过期，请重新登录' });
    }

    // 设置用户ID
    request.user = { id: decoded.id };

    // 下一步
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 验证用户数据
 */
export const validateUserData = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { email, password, nickname } = request.body;

  // 验证电子邮箱
  if (!email) {
    return next(new Error('电子邮箱不能为空'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new Error('请提供有效的电子邮箱'));
  }

  // 验证密码
  if (password && password.length < 6) {
    return next(new Error('密码至少需要6个字符'));
  }

  // 验证昵称
  if (nickname && (nickname.length < 2 || nickname.length > 20)) {
    return next(new Error('昵称长度必须在2-20个字符之间'));
  }

  // 下一步
  next();
};
