import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';

/**
 * 注册创建用户
 */
export const register = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { email, password } = request.body;

  // 创建用户
  try {
    const result = await userService.createUser({ email, password });
    if (result.success) {
      response.status(200).send(result);
    } else {
      throw new Error(`${result.message}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 用户登录
 */
export const login = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { email, password } = request.body;

  // 用户登录
  try {
    const result = await userService.loginUser({ email, password });
    if (result.success) {
      response.status(200).send(result);
    } else {
      throw new Error(`${result.message}`);
    }
  } catch (error) {
    next(error);
  }
};
