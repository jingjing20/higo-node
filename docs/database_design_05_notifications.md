# 运动社交App数据库设计文档 - 通知系统 (第五部分)

本文档是《运动社交App数据库设计文档 - MySQL版》的第五部分，专门描述消息通知系统相关表结构设计。

## 设计原则

1. **实时性优先**：通知数据结构设计优化查询性能，支持实时推送
2. **可扩展性**：支持多种通知类型的扩展
3. **用户体验**：支持已读/未读状态管理和个性化设置
4. **数据完整性**：保证通知数据的准确性和一致性
5. **性能优化**：合理的索引设计，支持高并发场景

## V1.0 通知系统数据库设计

### 通知系统相关表

#### 1. `notifications` 表 - 通知记录

```sql
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL COMMENT '接收通知的用户ID',
    sender_id INT NOT NULL COMMENT '触发通知的用户ID',
    type VARCHAR(50) NOT NULL COMMENT '通知类型：post_like, post_comment, comment_reply',
    title VARCHAR(255) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    related_id INT NOT NULL COMMENT '关联的业务ID（帖子ID或评论ID）',
    related_type VARCHAR(50) NOT NULL COMMENT '关联类型：post, comment',
    is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    read_at DATETIME NULL COMMENT '阅读时间',
    INDEX idx_notifications_recipient_id (recipient_id),
    INDEX idx_notifications_sender_id (sender_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_created_at (created_at),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_recipient_read (recipient_id, is_read),
    INDEX idx_notifications_related (related_type, related_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**字段说明：**

- `recipient_id`: 接收通知的用户ID，关联users表
- `sender_id`: 触发通知的用户ID，关联users表
- `type`: 通知类型枚举值
  - `post_like`: 帖子被点赞
  - `post_comment`: 帖子被评论
  - `comment_reply`: 评论被回复
- `title`: 通知标题，用于显示在通知列表
- `content`: 通知详细内容
- `related_id`: 关联的业务数据ID
- `related_type`: 关联的业务类型（post或comment）
- `is_read`: 是否已读标识
- `read_at`: 阅读时间，用于统计和分析

**示例数据：**

```sql
INSERT INTO notifications (recipient_id, sender_id, type, title, content, related_id, related_type, is_read) VALUES
(1, 2, 'post_like', '你的帖子收到了点赞', '用户"运动达人"点赞了你的帖子"周末爬山活动召集"', 1, 'post', 0),
(1, 3, 'post_comment', '你的帖子收到了评论', '用户"健身小白"评论了你的帖子"周末爬山活动召集"：这次活动时间安排如何？', 1, 'post', 1),
(2, 1, 'comment_reply', '你的评论收到了回复', '用户"户外领队"回复了你的评论：计划是上午9点出发，下午4点左右结束', 1, 'comment', 0),
(3, 4, 'post_like', '你的帖子收到了点赞', '用户"羽球爱好者"点赞了你的帖子"足球训练技巧分享"', 3, 'post', 0),
(2, 5, 'post_comment', '你的帖子收到了评论', '用户"新手小白"评论了你的帖子"求推荐性价比高的羽毛球拍"', 2, 'post', 1);
```

#### 2. `user_notification_settings` 表 - 用户通知设置

```sql
CREATE TABLE user_notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    post_like_enabled TINYINT(1) DEFAULT 1 COMMENT '是否接收帖子点赞通知',
    post_comment_enabled TINYINT(1) DEFAULT 1 COMMENT '是否接收帖子评论通知',
    comment_reply_enabled TINYINT(1) DEFAULT 1 COMMENT '是否接收评论回复通知',
    push_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用推送通知',
    email_enabled TINYINT(1) DEFAULT 0 COMMENT '是否启用邮件通知',
    quiet_hours_start TIME DEFAULT '22:00:00' COMMENT '免打扰开始时间',
    quiet_hours_end TIME DEFAULT '08:00:00' COMMENT '免打扰结束时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY (user_id),
    INDEX idx_user_notification_settings_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**字段说明：**

- `user_id`: 用户ID，关联users表
- `post_like_enabled`: 是否接收帖子点赞通知
- `post_comment_enabled`: 是否接收帖子评论通知
- `comment_reply_enabled`: 是否接收评论回复通知
- `push_enabled`: 是否启用推送通知
- `email_enabled`: 是否启用邮件通知（预留功能）
- `quiet_hours_start/end`: 免打扰时间段设置

**示例数据：**

```sql
INSERT INTO user_notification_settings (user_id, post_like_enabled, post_comment_enabled, comment_reply_enabled, push_enabled, email_enabled) VALUES
(1, 1, 1, 1, 1, 0),
(2, 1, 1, 0, 1, 1),
(3, 0, 1, 1, 1, 0),
(4, 1, 1, 1, 0, 0),
(5, 1, 0, 1, 1, 1);
```

#### 3. `notification_templates` 表 - 通知模板 (可选扩展)

```sql
CREATE TABLE notification_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL COMMENT '通知类型',
    language VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言代码',
    title_template VARCHAR(255) NOT NULL COMMENT '标题模板',
    content_template TEXT NOT NULL COMMENT '内容模板',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY (type, language),
    INDEX idx_notification_templates_type (type),
    INDEX idx_notification_templates_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO notification_templates (type, language, title_template, content_template) VALUES
('post_like', 'zh-CN', '你的帖子收到了点赞', '用户"{sender_name}"点赞了你的帖子"{post_title}"'),
('post_comment', 'zh-CN', '你的帖子收到了评论', '用户"{sender_name}"评论了你的帖子"{post_title}"：{comment_content}'),
('comment_reply', 'zh-CN', '你的评论收到了回复', '用户"{sender_name}"回复了你的评论：{reply_content}'),
('post_like', 'en-US', 'Your post received a like', 'User "{sender_name}" liked your post "{post_title}"'),
('post_comment', 'en-US', 'Your post received a comment', 'User "{sender_name}" commented on your post "{post_title}": {comment_content}'),
('comment_reply', 'en-US', 'Your comment received a reply', 'User "{sender_name}" replied to your comment: {reply_content}');
```

## 索引优化说明

### 1. 查询性能优化

- `idx_notifications_recipient_id`: 优化用户通知列表查询
- `idx_notifications_recipient_read`: 复合索引，优化未读通知查询
- `idx_notifications_created_at`: 优化按时间排序查询
- `idx_notifications_related`: 优化关联业务数据查询

### 2. 常用查询模式

```sql
-- 获取用户未读通知数量
SELECT COUNT(*) FROM notifications
WHERE recipient_id = ? AND is_read = 0;

-- 获取用户通知列表（分页）
SELECT * FROM notifications
WHERE recipient_id = ?
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- 标记通知为已读
UPDATE notifications
SET is_read = 1, read_at = NOW()
WHERE id = ? AND recipient_id = ?;
```

## 数据清理策略

### 1. 定期清理过期通知

```sql
-- 删除6个月前的已读通知
DELETE FROM notifications
WHERE is_read = 1
AND created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- 删除1年前的所有通知
DELETE FROM notifications
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### 2. 数据归档

对于重要的通知数据，可以考虑归档到历史表而不是直接删除。

## 扩展性考虑

### 1. 通知类型扩展

系统设计支持轻松添加新的通知类型：

- 关注用户发布新帖子
- 活动报名成功
- 系统公告通知
- 私信通知

### 2. 多媒体通知

预留字段支持富文本通知：

- 图片通知
- 链接跳转
- 自定义动作

### 3. 批量通知

支持系统级批量通知功能：

- 活动推广
- 系统维护通知
- 版本更新提醒

## 性能监控

### 1. 关键指标

- 通知发送成功率
- 通知查询响应时间
- 未读通知数量统计
- 用户通知设置分布

### 2. 监控查询

```sql
-- 每日通知发送量统计
SELECT DATE(created_at) as date, type, COUNT(*) as count
FROM notifications
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at), type;

-- 用户活跃度统计（基于通知阅读）
SELECT recipient_id, COUNT(*) as total_notifications,
       SUM(is_read) as read_notifications,
       (SUM(is_read) / COUNT(*)) * 100 as read_rate
FROM notifications
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY recipient_id;
```
