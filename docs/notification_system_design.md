# 消息通知系统设计文档

## 1. 系统概述

本文档描述了运动社交App中帖子点赞、评论消息通知功能的整体设计方案。该系统旨在为用户提供实时的互动反馈，提升用户体验和活跃度。

## 2. 功能需求

### 2.1 核心功能

- 当用户的帖子被点赞时，向帖子作者发送通知
- 当用户的帖子被评论时，向帖子作者发送通知
- 当用户的评论被回复时，向评论作者发送通知
- 支持通知的已读/未读状态管理
- 支持通知历史记录查询
- 支持通知设置（用户可选择接收哪些类型的通知）

### 2.2 非功能需求

- 通知发送的实时性（秒级延迟）
- 系统高可用性和稳定性
- 支持大量并发用户
- 数据一致性保证

## 3. 技术架构设计

### 3.1 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter App   │    │   Node.js API   │    │   MySQL DB      │
│                 │    │                 │    │                 │
│ - 通知列表页面   │◄──►│ - 通知API接口    │◄──►│ - 通知数据表     │
│ - 实时通知显示   │    │ - WebSocket服务  │    │ - 用户设置表     │
│ - 通知设置页面   │    │ - 通知业务逻辑   │    │ - 关联业务表     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 3.2 通知流程设计

```
用户A点赞/评论帖子 → 触发通知事件 → 检查通知设置 → 创建通知记录 → 实时推送给用户B
```

## 4. 数据库设计

### 4.1 通知表 (notifications)

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
    INDEX idx_notifications_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 用户通知设置表 (user_notification_settings)

```sql
CREATE TABLE user_notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    post_like_enabled TINYINT(1) DEFAULT 1 COMMENT '是否接收帖子点赞通知',
    post_comment_enabled TINYINT(1) DEFAULT 1 COMMENT '是否接收帖子评论通知',
    comment_reply_enabled TINYINT(1) DEFAULT 1 COMMENT '是否接收评论回复通知',
    push_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用推送通知',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY (user_id),
    INDEX idx_user_notification_settings_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 5. API接口设计

### 5.1 通知相关接口

#### 获取通知列表

```
GET /api/notifications
Query Parameters:
- page: 页码 (默认1)
- limit: 每页数量 (默认20)
- type: 通知类型过滤 (可选)
- is_read: 已读状态过滤 (可选)

Response:
{
  "success": true,
  "data": {
    "notifications": [...],
    "total": 100,
    "unread_count": 5
  }
}
```

#### 标记通知为已读

```
PUT /api/notifications/:id/read
Response:
{
  "success": true,
  "message": "通知已标记为已读"
}
```

#### 批量标记已读

```
PUT /api/notifications/mark-all-read
Response:
{
  "success": true,
  "message": "所有通知已标记为已读"
}
```

#### 获取未读通知数量

```
GET /api/notifications/unread-count
Response:
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

#### 获取通知设置

```
GET /api/notifications/settings
Response:
{
  "success": true,
  "data": {
    "post_like_enabled": true,
    "post_comment_enabled": true,
    "comment_reply_enabled": true,
    "push_enabled": true
  }
}
```

#### 更新通知设置

```
PUT /api/notifications/settings
Body:
{
  "post_like_enabled": true,
  "post_comment_enabled": false,
  "comment_reply_enabled": true,
  "push_enabled": true
}
```

## 6. 客户端设计

### 6.1 页面结构

```
lib/features/notifications/
├── models/
│   ├── notification.dart
│   └── notification_settings.dart
├── services/
│   └── notification_service.dart
├── providers/
│   └── notification_provider.dart
├── widgets/
│   ├── notification_item.dart
│   ├── notification_list.dart
│   └── notification_settings_form.dart
└── pages/
    ├── notifications_page.dart
    └── notification_settings_page.dart
```

### 6.2 状态管理

使用Provider模式管理通知状态：

- NotificationProvider: 管理通知列表、未读数量等状态
- 支持下拉刷新、上拉加载更多
- 实时更新未读数量

### 6.3 实时通知

- 使用WebSocket连接实现实时通知推送
- 在应用前台时显示应用内通知
- 支持本地推送通知（应用在后台时）

## 7. 服务端设计

### 7.1 通知服务模块

```
src/notification/
├── notification.model.ts      # 数据模型定义
├── notification.service.ts    # 业务逻辑服务
├── notification.controller.ts # 控制器
├── notification.router.ts     # 路由定义
└── websocket.service.ts       # WebSocket服务
```

### 7.2 通知触发机制

在现有的点赞、评论功能中集成通知触发：

- 点赞帖子时触发通知
- 评论帖子时触发通知
- 回复评论时触发通知

### 7.3 WebSocket实现

- 用户连接时建立WebSocket连接
- 维护用户连接映射关系
- 实时推送通知消息

## 8. 实现优先级

### Phase 1: 基础功能

1. 数据库表创建
2. 基础API接口实现
3. 通知触发机制集成
4. 客户端通知列表页面

### Phase 2: 增强功能

1. WebSocket实时推送
2. 通知设置功能
3. 批量操作功能
4. 性能优化

### Phase 3: 高级功能

1. 推送通知集成
2. 通知模板系统
3. 统计分析功能
4. 多语言支持

## 9. 性能考虑

### 9.1 数据库优化

- 合理的索引设计
- 分页查询优化
- 定期清理过期通知

### 9.2 缓存策略

- Redis缓存未读通知数量
- 缓存用户通知设置
- WebSocket连接状态缓存

### 9.3 并发处理

- 使用数据库事务保证一致性
- 异步处理通知发送
- 限流防止通知轰炸

## 10. 安全考虑

### 10.1 权限控制

- 用户只能查看自己的通知
- 通知设置只能由用户本人修改
- API接口需要身份验证

### 10.2 数据验证

- 输入参数验证
- 防止SQL注入
- XSS防护

## 11. 测试策略

### 11.1 单元测试

- 通知服务逻辑测试
- API接口测试
- 数据模型测试

### 11.2 集成测试

- 端到端通知流程测试
- WebSocket连接测试
- 数据库操作测试

### 11.3 性能测试

- 大量通知并发处理测试
- WebSocket连接压力测试
- 数据库查询性能测试
