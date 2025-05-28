import { queryAsync } from '../app/database/database.utils';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import {
  Notification,
  NotificationSettings,
  NotificationTemplate,
  NotificationType,
  RelatedType,
  CreateNotificationData,
  NotificationListQuery,
  NotificationListResponse,
  UpdateNotificationSettingsData,
  NotificationContext
} from './notification.model';

/**
 * 创建通知
 * @param data 通知数据
 * @returns 创建的通知ID
 */
export const createNotification = async (
  data: CreateNotificationData
): Promise<number> => {
  try {
    // 检查接收者的通知设置
    const settings = await getUserNotificationSettings(data.recipient_id);
    if (!settings) {
      // 如果没有设置，创建默认设置
      await createDefaultNotificationSettings(data.recipient_id);
    }

    // 检查是否应该发送此类型的通知
    const shouldSend = await shouldSendNotification(
      data.recipient_id,
      data.type
    );
    if (!shouldSend) {
      return 0; // 不发送通知
    }

    // 获取通知内容
    const { title, content } = await generateNotificationContent(data);

    // 插入通知记录
    const result = (await queryAsync(
      `INSERT INTO notifications
       (recipient_id, sender_id, type, title, content, related_id, related_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.recipient_id,
        data.sender_id,
        data.type,
        title,
        content,
        data.related_id,
        data.related_type
      ]
    )) as ResultSetHeader;

    return result.insertId;
  } catch (error) {
    throw new Error(`创建通知失败: ${error.message}`);
  }
};

/**
 * 获取用户通知列表
 * @param userId 用户ID
 * @param query 查询参数
 * @returns 通知列表响应
 */
export const getUserNotifications = async (
  userId: number,
  query: NotificationListQuery
): Promise<NotificationListResponse> => {
  try {
    const { page = 1, limit = 20, type, is_read } = query;
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereClause = 'WHERE n.recipient_id = ?';
    const queryParams: any[] = [userId];

    if (type) {
      whereClause += ' AND n.type = ?';
      queryParams.push(type);
    }

    if (is_read !== undefined) {
      whereClause += ' AND n.is_read = ?';
      queryParams.push(is_read ? 1 : 0);
    }

    // 获取通知列表
    const notifications = (await queryAsync(
      `SELECT
         n.id,
         n.recipient_id,
         n.sender_id,
         n.type,
         n.title,
         n.content,
         n.related_id,
         n.related_type,
         n.is_read,
         n.created_at,
         n.read_at,
         u.nickname as sender_name,
         u.avatar_url as sender_avatar
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    )) as (Notification & RowDataPacket)[];

    // 获取总数
    const totalResult = (await queryAsync(
      `SELECT COUNT(*) as total FROM notifications n ${whereClause}`,
      queryParams
    )) as { total: number }[];

    // 获取未读数量
    const unreadResult = (await queryAsync(
      'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND is_read = 0',
      [userId]
    )) as { count: number }[];

    const total = totalResult[0].total;
    const unread_count = unreadResult[0].count;
    const total_pages = Math.ceil(total / limit);

    return {
      notifications,
      total,
      unread_count,
      current_page: page,
      total_pages
    };
  } catch (error) {
    throw new Error(`获取通知列表失败: ${error.message}`);
  }
};

/**
 * 标记通知为已读
 * @param notificationId 通知ID
 * @param userId 用户ID
 * @returns 是否成功
 */
export const markNotificationAsRead = async (
  notificationId: number,
  userId: number
): Promise<boolean> => {
  try {
    const result = (await queryAsync(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND recipient_id = ?',
      [notificationId, userId]
    )) as ResultSetHeader;

    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`标记通知已读失败: ${error.message}`);
  }
};

/**
 * 批量标记所有通知为已读
 * @param userId 用户ID
 * @returns 是否成功
 */
export const markAllNotificationsAsRead = async (
  userId: number
): Promise<boolean> => {
  try {
    const result = (await queryAsync(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE recipient_id = ? AND is_read = 0',
      [userId]
    )) as ResultSetHeader;

    return true;
  } catch (error) {
    throw new Error(`批量标记已读失败: ${error.message}`);
  }
};

/**
 * 获取未读通知数量
 * @param userId 用户ID
 * @returns 未读数量
 */
export const getUnreadNotificationCount = async (
  userId: number
): Promise<number> => {
  try {
    const result = (await queryAsync(
      'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND is_read = 0',
      [userId]
    )) as { count: number }[];

    return result[0].count;
  } catch (error) {
    throw new Error(`获取未读通知数量失败: ${error.message}`);
  }
};

/**
 * 获取用户通知设置
 * @param userId 用户ID
 * @returns 通知设置
 */
export const getUserNotificationSettings = async (
  userId: number
): Promise<NotificationSettings | null> => {
  try {
    const result = (await queryAsync(
      'SELECT * FROM user_notification_settings WHERE user_id = ?',
      [userId]
    )) as (NotificationSettings & RowDataPacket)[];

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    throw new Error(`获取通知设置失败: ${error.message}`);
  }
};

/**
 * 更新用户通知设置
 * @param userId 用户ID
 * @param data 更新数据
 * @returns 是否成功
 */
export const updateUserNotificationSettings = async (
  userId: number,
  data: UpdateNotificationSettingsData
): Promise<boolean> => {
  try {
    // 检查设置是否存在
    const existing = await getUserNotificationSettings(userId);

    if (!existing) {
      // 创建新设置
      await createDefaultNotificationSettings(userId);
    }

    // 构建更新字段
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return true;
    }

    updateValues.push(userId);

    const result = (await queryAsync(
      `UPDATE user_notification_settings SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    )) as ResultSetHeader;

    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`更新通知设置失败: ${error.message}`);
  }
};

/**
 * 创建默认通知设置
 * @param userId 用户ID
 * @returns 是否成功
 */
export const createDefaultNotificationSettings = async (
  userId: number
): Promise<boolean> => {
  try {
    await queryAsync(
      'INSERT INTO user_notification_settings (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = user_id',
      [userId]
    );
    return true;
  } catch (error) {
    throw new Error(`创建默认通知设置失败: ${error.message}`);
  }
};

/**
 * 检查是否应该发送通知
 * @param userId 用户ID
 * @param type 通知类型
 * @returns 是否应该发送
 */
const shouldSendNotification = async (
  userId: number,
  type: NotificationType
): Promise<boolean> => {
  try {
    const settings = await getUserNotificationSettings(userId);
    if (!settings) {
      return true; // 默认发送
    }

    switch (type) {
      case NotificationType.POST_LIKE:
        return settings.post_like_enabled;
      case NotificationType.POST_COMMENT:
        return settings.post_comment_enabled;
      case NotificationType.COMMENT_REPLY:
        return settings.comment_reply_enabled;
      default:
        return true;
    }
  } catch (error) {
    return true; // 出错时默认发送
  }
};

/**
 * 生成通知内容
 * @param data 通知数据
 * @returns 标题和内容
 */
const generateNotificationContent = async (
  data: CreateNotificationData
): Promise<{ title: string; content: string }> => {
  try {
    // 如果已提供标题和内容，直接返回
    if (data.title && data.content) {
      return { title: data.title, content: data.content };
    }

    // 获取通知模板
    const template = await getNotificationTemplate(data.type);
    if (!template) {
      return getDefaultNotificationContent(data.type);
    }

    // 获取上下文数据
    const context = await getNotificationContext(data);

    // 替换模板变量
    const title = replaceTemplateVariables(template.title_template, context);
    const content = replaceTemplateVariables(
      template.content_template,
      context
    );

    return { title, content };
  } catch (error) {
    return getDefaultNotificationContent(data.type);
  }
};

/**
 * 获取通知模板
 * @param type 通知类型
 * @param language 语言
 * @returns 通知模板
 */
const getNotificationTemplate = async (
  type: NotificationType,
  language: string = 'zh-CN'
): Promise<NotificationTemplate | null> => {
  try {
    const result = (await queryAsync(
      'SELECT * FROM notification_templates WHERE type = ? AND language = ? AND is_active = 1',
      [type, language]
    )) as (NotificationTemplate & RowDataPacket)[];

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    return null;
  }
};

/**
 * 获取通知上下文数据
 * @param data 通知数据
 * @returns 上下文数据
 */
const getNotificationContext = async (
  data: CreateNotificationData
): Promise<NotificationContext> => {
  try {
    // 获取发送者信息
    const senderResult = (await queryAsync(
      'SELECT nickname, avatar_url FROM users WHERE id = ?',
      [data.sender_id]
    )) as { nickname: string; avatar_url: string }[];

    const context: NotificationContext = {
      sender_name: senderResult[0]?.nickname || '未知用户',
      sender_avatar: senderResult[0]?.avatar_url
    };

    // 根据关联类型获取相关数据
    if (data.related_type === RelatedType.POST) {
      const postResult = (await queryAsync(
        'SELECT title FROM posts WHERE id = ?',
        [data.related_id]
      )) as { title: string }[];

      context.post_title = postResult[0]?.title || '未知帖子';
    } else if (data.related_type === RelatedType.COMMENT) {
      const commentResult = (await queryAsync(
        'SELECT content FROM post_comments WHERE id = ?',
        [data.related_id]
      )) as { content: string }[];

      const content = commentResult[0]?.content || '未知评论';
      context.comment_content =
        content.length > 50 ? content.substring(0, 50) + '...' : content;
      context.reply_content = context.comment_content;
    }

    return context;
  } catch (error) {
    return {
      sender_name: '未知用户'
    };
  }
};

/**
 * 替换模板变量
 * @param template 模板字符串
 * @param context 上下文数据
 * @returns 替换后的字符串
 */
const replaceTemplateVariables = (
  template: string,
  context: NotificationContext
): string => {
  let result = template;

  Object.entries(context).forEach(([key, value]) => {
    if (value) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
  });

  return result;
};

/**
 * 获取默认通知内容
 * @param type 通知类型
 * @returns 默认标题和内容
 */
const getDefaultNotificationContent = (
  type: NotificationType
): { title: string; content: string } => {
  switch (type) {
    case NotificationType.POST_LIKE:
      return {
        title: '你的帖子收到了点赞',
        content: '有用户点赞了你的帖子'
      };
    case NotificationType.POST_COMMENT:
      return {
        title: '你的帖子收到了评论',
        content: '有用户评论了你的帖子'
      };
    case NotificationType.COMMENT_REPLY:
      return {
        title: '你的评论收到了回复',
        content: '有用户回复了你的评论'
      };
    default:
      return {
        title: '新通知',
        content: '你有一条新通知'
      };
  }
};
