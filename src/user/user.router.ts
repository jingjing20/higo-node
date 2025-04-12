import express from 'express';
import * as userController from './user.controller';

const router = express.Router();

/**
 * 注册
 */
router.post('/api/register', userController.register);

/**
 * 登录
 */
router.post('/api/login', userController.login);

/**
 * 导出路由
 */
export default router;
