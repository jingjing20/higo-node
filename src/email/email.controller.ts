import { Request, Response, NextFunction } from 'express';
import * as emailService from './email.service';

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

/**
 * 发送验证码
 */
export const sendVerificationCode = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { email } = request.body;
  const ipAddress = request.ip;
  const userAgent = request.headers['user-agent'];

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return response.status(400).send({
      success: false,
      message: '请提供有效的邮箱地址'
    });
  }

  try {
    // 检查是否可以发送验证码
    const canSendResult = await emailService.canSendVerificationCode(email);
    if (!canSendResult.canSend) {
      return response.status(429).send({
        success: false,
        message: canSendResult.message
      });
    }

    // 生成验证码
    const code = emailService.generateVerificationCode();

    // 保存验证码记录
    const createResult = await emailService.createVerificationCode(
      email,
      code,
      ipAddress,
      userAgent
    );

    if (!createResult.success) {
      return response.status(500).send({
        success: false,
        message: '生成验证码失败'
      });
    }

    // 发送验证码邮件
    const sendResult = await emailService.sendVerificationCode(email, code);

    if (sendResult.success) {
      response.status(200).send({
        success: true,
        message: '验证码已发送，请查收邮件'
      });
    } else {
      response.status(500).send({
        success: false,
        message: '发送验证码失败'
      });
    }
  } catch (error) {
    next(error);
  }
};
