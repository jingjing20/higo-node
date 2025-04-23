import express from 'express';
import * as userController from './user.controller';
import * as userMiddleware from './user.middleware';

const router = express.Router();

// 用户登录
router.post('/api/auth/login', userController.login);

// 验证码注册登录
router.post(
  '/api/auth/verify-code/register',
  userMiddleware.validateUserData,
  userController.verifyCodeLogin
);

// 用户登出
router.post('/api/auth/logout', userController.logout);

// 刷新令牌
router.post('/api/auth/refresh', userController.refreshUserToken);

/**
 * 用户信息 API
 */
// 获取当前用户信息
router.get(
  '/api/users/me',
  userMiddleware.authGuard,
  userController.getCurrentUser
);

// 更新用户个人信息
router.put(
  '/api/users/me',
  userMiddleware.authGuard,
  userController.updateProfile
);

// 上传/更新头像
router.post(
  '/api/users/avatar',
  userMiddleware.authGuard,
  userController.updateAvatar
);

// 获取指定用户公开信息
router.get('/api/users/:userId', userController.getUserById);

/**
 * 导出路由
 */
export default router;
