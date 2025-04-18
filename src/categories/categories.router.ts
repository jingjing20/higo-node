import express from 'express';
import * as categoryController from './categories.controller';
import { authGuard } from '../user/user.middleware';
import { validateCategoryExists } from './categories.middleware';

const router = express.Router();

/**
 * 运动类别 API
 */
// 获取所有运动类别
router.get('/api/categories', categoryController.getAllCategories);

// 批量获取指定类别
router.get('/api/categories/batch', categoryController.getBatchCategories);

// 创建运动类别（管理员API）
router.post(
  '/api/admin/categories',
  authGuard,
  // TODO: 添加管理员权限验证中间件
  categoryController.createCategory
);

// 更新运动类别（管理员API）
router.put(
  '/api/admin/categories/:categoryId',
  authGuard,
  // TODO: 添加管理员权限验证中间件
  validateCategoryExists,
  categoryController.updateCategory
);

// 关注运动类别
router.post(
  '/api/users/me/categories',
  authGuard,
  validateCategoryExists,
  categoryController.followCategory
);

// 批量关注运动类别
router.post(
  '/api/users/me/categories/batch',
  authGuard,
  categoryController.followBatchCategories
);

// 取消关注运动类别
router.delete(
  '/api/users/me/categories/:categoryId',
  authGuard,
  validateCategoryExists,
  categoryController.unfollowCategory
);

// 获取用户关注的类别
router.get(
  '/api/users/me/categories',
  authGuard,
  categoryController.getUserCategories
);

/**
 * 导出路由
 */
export default router;
