import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import * as emailService from '../email/email.service';

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

      response.status(200).send({ success: true, data: publicUser });
    } else {
      throw new Error(`${result.message}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 验证码登录/注册
 */
export const verifyCodeLogin = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { email, code, nickname, password } = request.body;

  try {
    // 验证验证码
    const verifyResult = await emailService.verifyCode(email, code);

    if (!verifyResult.success || !verifyResult.isValid) {
      return response.status(400).send({
        success: false,
        message: verifyResult.message
      });
    }

    // 检查邮箱是否已注册
    const userExists = await userService.checkUserExists(email);

    if (userExists) {
      // 邮箱已注册，执行登录
      const loginResult = await userService.loginUser({ email, password });

      if (loginResult.success) {
        response.status(200).send(loginResult);
      } else {
        response.status(400).send(loginResult);
      }
    } else {
      // 邮箱未注册，执行注册
      const registerResult = await userService.createUserWithVerifiedEmail({
        email,
        password,
        nickname
      });

      if (registerResult.success) {
        // 注册成功，自动登录
        const loginResult = await userService.loginUser({ email, password });

        if (loginResult.success) {
          response.status(200).send(loginResult);
        } else {
          // 注册成功但登录失败，仍然返回成功
          response.status(200).send({
            success: true,
            message: '注册成功，请登录',
            userId: registerResult.userId
          });
        }
      } else {
        response.status(400).send(registerResult);
      }
    }
  } catch (error) {
    next(error);
  }
};
