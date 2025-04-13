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
  const { email, password, nickname } = request.body;

  // 创建用户
  try {
    const result = await userService.createUser({ email, password, nickname });
    if (result.success) {
      response.status(201).send(result);
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

/**
 * 用户登出
 */
export const logout = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 客户端应该清除令牌，服务端不需要处理
  response.status(200).send({ success: true, message: '登出成功' });
};

/**
 * 验证邮箱
 */
export const verifyEmail = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { token } = request.body;

  // 验证邮箱
  try {
    const result = await userService.verifyEmail(token);
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
 * 忘记密码
 */
export const forgotPassword = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { email } = request.body;

  // 处理忘记密码
  try {
    const result = await userService.forgotPassword(email);
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
 * 重置密码
 */
export const resetPassword = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { token, newPassword } = request.body;

  // 重置密码
  try {
    const result = await userService.resetPassword(token, newPassword);
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
 * 刷新令牌
 */
export const refreshUserToken = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { refreshToken } = request.body;

  // 刷新令牌
  try {
    const result = await userService.refreshToken(refreshToken);
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
 * 获取当前用户信息
 */
export const getCurrentUser = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const userId = request.user.id;

  // 获取用户信息
  try {
    const result = await userService.getUserProfile(userId);
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
 * 更新用户个人信息
 */
export const updateProfile = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const userId = request.user.id;
  const { nickname, bio, gender, location } = request.body;

  // 更新用户信息
  try {
    const result = await userService.updateUserProfile(userId, {
      nickname,
      bio,
      gender,
      location
    });
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
 * 上传/更新头像
 */
export const updateAvatar = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const userId = request.user.id;
  const { avatarUrl } = request.body;

  // 更新头像
  try {
    const result = await userService.updateUserAvatar(userId, avatarUrl);
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
 * 获取指定用户公开信息
 */
export const getUserById = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { userId } = request.params;

  // 获取用户信息
  try {
    const result = await userService.getUserProfile(parseInt(userId, 10));
    if (result.success) {
      // 只返回公开信息
      const { user } = result;
      const publicUser = {
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        bio: user.bio,
        gender: user.gender,
        location: user.location
      };

      response.status(200).send({ success: true, user: publicUser });
    } else {
      throw new Error(`${result.message}`);
    }
  } catch (error) {
    next(error);
  }
};
