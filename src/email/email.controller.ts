import { Request, Response, NextFunction } from 'express';
import * as emailService from './email.service';
import { EMAIL_CONFIG, SENDER } from './email.config';

/**
 * 验证邮箱
 */
export const verifyEmail = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据 - 从查询参数获取token
  const token = request.query.token as string;

  if (!token) {
    return response
      .status(400)
      .send({ success: false, message: '缺少验证令牌' });
  }

  // 验证邮箱
  try {
    const result = await emailService.verifyEmail(token);
    if (result.success) {
      // 验证成功后重定向到前端成功页面
      return response.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/email-verified?success=true`
      );
    } else {
      // 验证失败后重定向到前端失败页面
      return response.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/email-verified?success=false&message=${encodeURIComponent(result.message)}`
      );
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 发送验证邮件
 */
export const verificationEmail = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { email, token, nickname } = request.body;

  try {
    const result = await emailService.sendVerificationEmail(
      email,
      token,
      nickname
    );
    if (result.success) {
      response.status(200).send(result);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 重置密码邮件
 */
export const passwordResetEmail = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { email, token, nickname } = request.body;

  try {
    const result = await emailService.sendPasswordResetEmail(
      email,
      token,
      nickname
    );
    if (result.success) {
      response.status(200).send(result);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 发送欢迎邮件
 */
export const welcomeEmail = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { email, nickname } = request.body;

  try {
    const result = await emailService.sendWelcomeEmail(email, nickname);
    if (result.success) {
      response.status(200).send(result);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    next(error);
  }
};
