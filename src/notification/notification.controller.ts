import { Request, Response } from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  getUserNotificationSettings,
  updateUserNotificationSettings,
  createDefaultNotificationSettings
} from './notification.service';
import {
  NotificationListQuery,
  UpdateNotificationSettingsData
} from './notification.model';

/**
 * 获取用户通知列表
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未登录'
      });
    }

    const query: NotificationListQuery = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      type: req.query.type as any,
      is_read: req.query.is_read ? req.query.is_read === 'true' : undefined
    };

    const result = await getUserNotifications(userId, query);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取通知列表失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取通知列表失败'
    });
  }
};

/**
 * 标记通知为已读
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未登录'
      });
    }

    const notificationId = parseInt(req.params.id);
    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: '通知ID无效'
      });
    }

    const success = await markNotificationAsRead(notificationId, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: '通知不存在或无权限'
      });
    }

    res.json({
      success: true,
      message: '通知已标记为已读'
    });
  } catch (error) {
    console.error('标记通知已读失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '标记通知已读失败'
    });
  }
};

/**
 * 批量标记所有通知为已读
 */
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未登录'
      });
    }

    await markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      message: '所有通知已标记为已读'
    });
  } catch (error) {
    console.error('批量标记已读失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '批量标记已读失败'
    });
  }
};

/**
 * 获取未读通知数量
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未登录'
      });
    }

    const count = await getUnreadNotificationCount(userId);

    res.json({
      success: true,
      data: {
        count
      }
    });
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取未读通知数量失败'
    });
  }
};

/**
 * 获取通知设置
 */
export const getNotificationSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未登录'
      });
    }

    let settings = await getUserNotificationSettings(userId);

    // 如果用户没有设置，创建默认设置
    if (!settings) {
      await createDefaultNotificationSettings(userId);
      settings = await getUserNotificationSettings(userId);
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('获取通知设置失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取通知设置失败'
    });
  }
};

/**
 * 更新通知设置
 */
export const updateNotificationSettings = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未登录'
      });
    }

    const data: UpdateNotificationSettingsData = req.body;

    // 验证输入数据
    const validFields = [
      'post_like_enabled',
      'post_comment_enabled',
      'comment_reply_enabled',
      'push_enabled',
      'email_enabled',
      'quiet_hours_start',
      'quiet_hours_end'
    ];

    const updateData: UpdateNotificationSettingsData = {};
    Object.keys(data).forEach((key) => {
      if (validFields.includes(key)) {
        updateData[key] = data[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有有效的更新字段'
      });
    }

    const success = await updateUserNotificationSettings(userId, updateData);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: '更新通知设置失败'
      });
    }

    res.json({
      success: true,
      message: '通知设置已更新'
    });
  } catch (error) {
    console.error('更新通知设置失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '更新通知设置失败'
    });
  }
};
