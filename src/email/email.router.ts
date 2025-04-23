import express from 'express';
import * as emailController from './email.controller';

const router = express.Router();

/**
 * 发送验证码
 */
router.post(
  '/api/email/verification-code',
  emailController.sendVerificationCode
);

/**
 * 欢迎邮件
 */
router.post('/api/email/welcome', emailController.welcomeEmail);

/**
 * 导出路由
 */
export default router;
