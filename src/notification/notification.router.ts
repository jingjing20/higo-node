import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getNotificationSettings,
  updateNotificationSettings
} from './notification.controller';
import { authGuard } from '../user/user.middleware';

const router = express.Router();

// 所有通知相关路由都需要身份验证
router.use(authGuard);

/**
 * @route GET /api/notifications
 * @desc 获取用户通知列表
 * @access Private
 * @query page - 页码 (可选，默认1)
 * @query limit - 每页数量 (可选，默认20)
 * @query type - 通知类型过滤 (可选)
 * @query is_read - 已读状态过滤 (可选)
 */
router.get('/api/notifications', getNotifications);

/**
 * @route PUT /api/notifications/:id/read
 * @desc 标记指定通知为已读
 * @access Private
 * @param id - 通知ID
 */
router.put('/api/notifications/:id/read', markAsRead);

/**
 * @route PUT /api/notifications/mark-all-read
 * @desc 批量标记所有通知为已读
 * @access Private
 */
router.put('/api/notifications/mark-all-read', markAllAsRead);

/**
 * @route GET /api/notifications/unread-count
 * @desc 获取未读通知数量
 * @access Private
 */
router.get('/api/notifications/unread-count', getUnreadCount);

/**
 * @route GET /api/notifications/settings
 * @desc 获取用户通知设置
 * @access Private
 */
router.get('/api/notifications/settings', getNotificationSettings);

/**
 * @route PUT /api/notifications/settings
 * @desc 更新用户通知设置
 * @access Private
 * @body post_like_enabled - 是否接收帖子点赞通知 (可选)
 * @body post_comment_enabled - 是否接收帖子评论通知 (可选)
 * @body comment_reply_enabled - 是否接收评论回复通知 (可选)
 * @body push_enabled - 是否启用推送通知 (可选)
 * @body email_enabled - 是否启用邮件通知 (可选)
 * @body quiet_hours_start - 免打扰开始时间 (可选)
 * @body quiet_hours_end - 免打扰结束时间 (可选)
 */
router.put('/api/notifications/settings', updateNotificationSettings);

export default router;
