import express from 'express';
import * as emailController from './email.controller';

const router = express.Router();

/**
 * 验证邮箱
 */
router.get('/api/email/verify', emailController.verifyEmail);

/**
 * 密码重置邮件
 */
router.post('/api/email/password/reset', emailController.passwordResetEmail);

/**
 * 欢迎邮件
 */
router.post('/api/email/welcome', emailController.welcomeEmail);

/**
 * 导出路由
 */
export default router;
