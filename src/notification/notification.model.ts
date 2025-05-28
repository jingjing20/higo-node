/**
 * 通知系统数据模型定义
 */

export interface Notification {
  id: number;
  recipient_id: number;
  sender_id: number;
  type: NotificationType;
  title: string;
  content: string;
  related_id: number;
  related_type: RelatedType;
  is_read: boolean;
  created_at: Date;
  read_at?: Date;
  // 关联数据
  sender_name?: string;
  sender_avatar?: string;
}

export interface NotificationSettings {
  id: number;
  user_id: number;
  post_like_enabled: boolean;
  post_comment_enabled: boolean;
  comment_reply_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationTemplate {
  id: number;
  type: NotificationType;
  language: string;
  title_template: string;
  content_template: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export enum NotificationType {
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  COMMENT_REPLY = 'comment_reply'
}

export enum RelatedType {
  POST = 'post',
  COMMENT = 'comment'
}

export interface CreateNotificationData {
  recipient_id: number;
  sender_id: number;
  type: NotificationType;
  related_id: number;
  related_type: RelatedType;
  title?: string;
  content?: string;
}

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  type?: NotificationType;
  is_read?: boolean;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  current_page: number;
  total_pages: number;
}

export interface UpdateNotificationSettingsData {
  post_like_enabled?: boolean;
  post_comment_enabled?: boolean;
  comment_reply_enabled?: boolean;
  push_enabled?: boolean;
  email_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface NotificationContext {
  sender_name: string;
  sender_avatar?: string;
  post_title?: string;
  comment_content?: string;
  reply_content?: string;
}
