# 运动社交App数据库设计文档 - MySQL版 (第三部分)

本文档是《运动社交App数据库设计文档 - MySQL版》的第三部分，描述社交功能和通知系统相关表结构设计。

## V1.1 社交版数据库设计（续）

### 帖子系统增强

#### 1. `post_favorites` 表 - 用户收藏帖子

```sql
CREATE TABLE post_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL COMMENT '帖子ID',
    user_id INT NOT NULL COMMENT '用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    UNIQUE KEY (post_id, user_id),
    INDEX idx_post_favorites_post_id (post_id),
    INDEX idx_post_favorites_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO post_favorites (post_id, user_id) VALUES
(1, 2), (1, 5),
(2, 3), (2, 5),
(3, 1), (3, 2), (3, 4),
(4, 1), (4, 2), (4, 3), (4, 5),
(5, 3), (5, 4),
(6, 5);
```

#### 2. `post_shares` 表 - 用户分享帖子记录

```sql
CREATE TABLE post_shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL COMMENT '帖子ID',
    user_id INT NOT NULL COMMENT '分享用户ID',
    platform VARCHAR(20) COMMENT '分享平台:wechat, weibo, etc.',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '分享时间',
    INDEX idx_post_shares_post_id (post_id),
    INDEX idx_post_shares_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO post_shares (post_id, user_id, platform) VALUES
(1, 2, 'wechat'),
(1, 3, 'weibo'),
(3, 1, 'wechat'),
(3, 4, 'weibo'),
(4, 2, 'wechat'),
(4, 5, 'wechat'),
(4, 1, 'weibo'),
(6, 2, 'wechat');
```

#### 3. `user_mentions` 表 - 用户被提及记录

```sql
CREATE TABLE user_mentions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_type VARCHAR(20) NOT NULL COMMENT '来源类型:post, comment',
    source_id INT NOT NULL COMMENT '来源ID',
    mentioned_user_id INT NOT NULL COMMENT '被提及用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_mentions_source (source_type, source_id),
    INDEX idx_user_mentions_mentioned_user_id (mentioned_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO user_mentions (source_type, source_id, mentioned_user_id) VALUES
('comment', 3, 3),
('comment', 8, 4),
('comment', 11, 2),
('comment', 15, 2),
('post', 6, 3);
```

### 消息通知中心

#### 4. `notifications` 表 - 用户通知

```sql
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '接收通知的用户ID',
    type VARCHAR(30) NOT NULL COMMENT '通知类型:like, comment, follow, system, etc.',
    title VARCHAR(100) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    source_type VARCHAR(20) COMMENT '来源类型:post, comment, user, system',
    source_id INT COMMENT '来源ID',
    is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO notifications (user_id, type, title, content, source_type, source_id, is_read) VALUES
(1, 'like', '点赞通知', '李娜点赞了你的帖子', 'post', 1, 1),
(1, 'comment', '评论通知', '王飞评论了你的帖子', 'post', 1, 1),
(1, 'follow', '关注通知', '李娜关注了你', 'user', 2, 1),
(2, 'like', '点赞通知', '张伟点赞了你的帖子', 'post', 2, 1),
(2, 'comment', '评论通知', '王飞评论了你的帖子', 'post', 2, 0),
(2, 'follow', '关注通知', '张伟关注了你', 'user', 1, 1),
(3, 'like', '点赞通知', '张伟点赞了你的帖子', 'post', 3, 1),
(3, 'comment', '评论通知', '张伟评论了你的帖子', 'post', 3, 0),
(3, 'mention', '@提及通知', '张伟在评论中提到了你', 'comment', 3, 0),
(4, 'like', '点赞通知', '张伟点赞了你的帖子', 'post', 4, 1),
(4, 'follow', '关注通知', '王飞关注了你', 'user', 3, 0),
(4, 'mention', '@提及通知', '王飞在评论中提到了你', 'comment', 8, 0),
(5, 'like', '点赞通知', '张伟点赞了你的帖子', 'post', 5, 1),
(5, 'system', '系统通知', '恭喜您连续签到4天，获得额外积分奖励！', 'system', NULL, 0),
(1, 'system', '系统通知', '您的场地信息已被审核通过', 'venue', 1, 0);
```

#### 5. `notification_settings` 表 - 通知设置

```sql
CREATE TABLE notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    like_notify TINYINT(1) DEFAULT 1 COMMENT '是否接收点赞通知',
    comment_notify TINYINT(1) DEFAULT 1 COMMENT '是否接收评论通知',
    follow_notify TINYINT(1) DEFAULT 1 COMMENT '是否接收关注通知',
    mention_notify TINYINT(1) DEFAULT 1 COMMENT '是否接收提及通知',
    system_notify TINYINT(1) DEFAULT 1 COMMENT '是否接收系统通知',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_notification_settings_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO notification_settings (user_id, like_notify, comment_notify, follow_notify, mention_notify, system_notify) VALUES
(1, 1, 1, 1, 1, 1),
(2, 1, 1, 1, 1, 1),
(3, 0, 1, 1, 1, 1),
(4, 1, 0, 1, 1, 1),
(5, 1, 1, 1, 1, 0);
```

### 举报系统

#### 6. `reports` 表 - 内容举报

```sql
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT COMMENT '举报者用户ID',
    target_type VARCHAR(20) NOT NULL COMMENT '举报目标类型:post, comment, user',
    target_id INT NOT NULL COMMENT '举报目标ID',
    reason VARCHAR(50) NOT NULL COMMENT '举报原因',
    details TEXT COMMENT '举报详情',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '处理状态:pending, approved, rejected',
    handled_by INT COMMENT '处理人ID',
    handled_at DATETIME COMMENT '处理时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_reports_reporter_id (reporter_id),
    INDEX idx_reports_target (target_type, target_id),
    INDEX idx_reports_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO reports (reporter_id, target_type, target_id, reason, details, status, handled_by, handled_at) VALUES
(2, 'post', 6, 'inappropriate_content', '内容包含不适当的广告信息', 'approved', 2, '2023-06-12 15:30:00'),
(3, 'comment', 5, 'spam', '该评论是垃圾信息', 'rejected', 2, '2023-06-12 16:15:00'),
(4, 'user', 6, 'fake_account', '疑似虚假账号，大量发布广告内容', 'approved', 3, '2023-06-12 14:45:00'),
(5, 'post', 7, 'offensive_content', '内容包含攻击性言论', 'pending', NULL, NULL);
```

## V1.2 增强版数据库设计

### 场地系统升级

#### 7. `venue_ratings` 表 - 场地评分

```sql
CREATE TABLE venue_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL COMMENT '场地ID',
    user_id INT COMMENT '用户ID',
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5) COMMENT '评分(1-5分)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY (venue_id, user_id),
    INDEX idx_venue_ratings_venue_id (venue_id),
    INDEX idx_venue_ratings_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO venue_ratings (venue_id, user_id, rating) VALUES
(1, 2, 5),
(1, 3, 4),
(1, 5, 4),
(2, 1, 4),
(2, 3, 5),
(2, 5, 4),
(3, 1, 3),
(3, 2, 4),
(3, 4, 4),
(4, 1, 5),
(4, 2, 5),
(4, 3, 4),
(5, 1, 4),
(5, 3, 3),
(5, 4, 4);
```

#### 8. `venue_reviews` 表 - 场地评价

```sql
CREATE TABLE venue_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL COMMENT '场地ID',
    user_id INT COMMENT '用户ID',
    content TEXT NOT NULL COMMENT '评价内容',
    likes_count INT DEFAULT 0 COMMENT '点赞数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_venue_reviews_venue_id (venue_id),
    INDEX idx_venue_reviews_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO venue_reviews (venue_id, user_id, content, likes_count) VALUES
(1, 2, '场地很不错，灯光明亮，地板也很干净。周末人不多，性价比高。', 8),
(1, 3, '交通很方便，地铁直达。设施也还行，就是更衣室有点小。', 5),
(2, 1, '羽毛球馆环境很好，场地很多，不用排队。就是价格略贵。', 6),
(2, 5, '周末人比较多，建议提前预约。场地质量很好，灯光充足。', 7),
(3, 1, '足球场草皮质量一般，但整体还可以。淋浴设施很赞。', 3),
(4, 2, '华山风景绝美，适合摄影爱好者。体力消耗大，要做好准备。', 12),
(4, 5, '登山路线标识清晰，安全措施到位。建议凌晨出发，可以看到日出。', 9),
(5, 3, '青城山环境优美，空气清新。适合家庭出游，难度不大。', 6);
```

#### 9. `venue_review_likes` 表 - 场地评价点赞

```sql
CREATE TABLE venue_review_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL COMMENT '评价ID',
    user_id INT NOT NULL COMMENT '点赞用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY (review_id, user_id),
    INDEX idx_venue_review_likes_review_id (review_id),
    INDEX idx_venue_review_likes_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO venue_review_likes (review_id, user_id) VALUES
(1, 1), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 5),
(3, 2), (3, 3), (3, 5),
(4, 1), (4, 3), (4, 4),
(5, 2), (5, 4),
(6, 1), (6, 3), (6, 4), (6, 5),
(7, 1), (7, 2), (7, 3), (7, 4),
(8, 1), (8, 2), (8, 4);
```

#### 10. `venue_facilities` 表 - 场地设施

```sql
CREATE TABLE venue_facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL COMMENT '场地ID',
    facility_type VARCHAR(30) NOT NULL COMMENT '设施类型:parking, shower, locker, etc.',
    description TEXT COMMENT '设施描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_venue_facilities_venue_id (venue_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO venue_facilities (venue_id, facility_type, description) VALUES
(1, 'parking', '地下停车场，收费每小时10元'),
(1, 'shower', '男女分开的淋浴间，提供热水'),
(1, 'locker', '收费储物柜，每次5元'),
(2, 'parking', '路边停车位，免费'),
(2, 'shower', '公共淋浴间，提供热水'),
(2, 'wifi', '全场免费WiFi'),
(3, 'parking', '专用停车场，免费'),
(3, 'shower', '独立淋浴间，带吹风机'),
(3, 'locker', '免费储物柜'),
(3, 'cafe', '场边咖啡厅，提供饮料和简餐'),
(4, 'parking', '景区停车场，每次30元'),
(4, 'rest_area', '多个休息区和观景平台'),
(4, 'restaurant', '山顶餐厅，提供热餐'),
(5, 'parking', '景区免费停车场'),
(5, 'rest_area', '沿途设有多个凉亭休息点');
```

## V1.3 活动版数据库设计

### 活动系统

#### 11. `events` 表 - 活动信息

```sql
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL COMMENT '活动标题',
    description TEXT COMMENT '活动描述',
    category_id INT COMMENT '活动类别ID',
    venue_id INT COMMENT '场地ID',
    creator_id INT NOT NULL COMMENT '创建者用户ID',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    max_participants INT COMMENT '最大参与人数',
    current_participants INT DEFAULT 0 COMMENT '当前参与人数',
    fee DECIMAL(10,2) DEFAULT 0 COMMENT '参与费用',
    requirements TEXT COMMENT '参与要求',
    status VARCHAR(20) DEFAULT 'upcoming' COMMENT '活动状态:upcoming, ongoing, completed, cancelled',
    image_url VARCHAR(255) COMMENT '活动图片URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_events_category_id (category_id),
    INDEX idx_events_venue_id (venue_id),
    INDEX idx_events_creator_id (creator_id),
    INDEX idx_events_start_time (start_time),
    INDEX idx_events_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO events (title, description, category_id, venue_id, creator_id, start_time, end_time, max_participants, current_participants, fee, requirements, status, image_url) VALUES
('周末羽毛球友谊赛', '欢迎各位羽毛球爱好者参加我们的友谊赛！适合中级选手，会分组进行比赛。', 2, 2, 1, '2023-07-15 14:00:00', '2023-07-15 18:00:00', 16, 12, 30.00, '请自带球拍，穿着运动服装。至少有半年以上打球经验。', 'upcoming', 'https://example.com/images/events/badminton_event.jpg'),
('五人制足球赛', '寻找队友一起参加五人制足球赛，初学者也可以报名，主要以娱乐为主。', 3, 3, 2, '2023-07-20 19:00:00', '2023-07-20 21:00:00', 10, 8, 25.00, '请穿着足球鞋或者运动鞋。', 'upcoming', 'https://example.com/images/events/football_event.jpg'),
('瑜伽入门班', '针对初学者的瑜伽课程，教授基本姿势和呼吸技巧。', 4, 1, 3, '2023-07-10 10:00:00', '2023-07-10 11:30:00', 20, 15, 50.00, '请自带瑜伽垫，穿着宽松舒适的服装。', 'upcoming', 'https://example.com/images/events/yoga_event.jpg'),
('华山登山一日游', '组织登山爱好者一起爬华山，欣赏美景，锻炼身体。', 1, 4, 4, '2023-08-05 07:00:00', '2023-08-05 17:00:00', 15, 12, 120.00, '身体健康，有一定的登山经验。请穿戴舒适的登山装备，自备干粮和水。', 'upcoming', 'https://example.com/images/events/hiking_event.jpg');
```

#### 12. `event_participants` 表 - 活动参与者

```sql
CREATE TABLE event_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL COMMENT '活动ID',
    user_id INT NOT NULL COMMENT '用户ID',
    status VARCHAR(20) DEFAULT 'confirmed' COMMENT '参与状态:pending, confirmed, cancelled',
    payment_status VARCHAR(20) DEFAULT 'unpaid' COMMENT '支付状态:unpaid, paid, refunded',
    join_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    UNIQUE KEY (event_id, user_id),
    INDEX idx_event_participants_event_id (event_id),
    INDEX idx_event_participants_user_id (user_id),
    INDEX idx_event_participants_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO event_participants (event_id, user_id, status, payment_status) VALUES
-- 周末羽毛球友谊赛参与者
(1, 2, 'confirmed', 'paid'),
(1, 3, 'confirmed', 'paid'),
(1, 4, 'confirmed', 'paid'),
(1, 5, 'confirmed', 'paid'),
-- 五人制足球赛参与者
(2, 1, 'confirmed', 'paid'),
(2, 3, 'confirmed', 'paid'),
(2, 4, 'confirmed', 'paid'),
(2, 5, 'confirmed', 'unpaid'),
-- 瑜伽入门班参与者
(3, 1, 'confirmed', 'paid'),
(3, 2, 'confirmed', 'paid'),
(3, 4, 'confirmed', 'paid'),
(3, 5, 'confirmed', 'unpaid'),
-- 华山登山一日游参与者
(4, 1, 'confirmed', 'paid'),
(4, 2, 'confirmed', 'paid'),
(4, 3, 'confirmed', 'paid'),
(4, 5, 'pending', 'unpaid');
```

#### 13. `event_comments` 表 - 活动评论

```sql
CREATE TABLE event_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL COMMENT '活动ID',
    user_id INT NOT NULL COMMENT '用户ID',
    content TEXT NOT NULL COMMENT '评论内容',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_event_comments_event_id (event_id),
    INDEX idx_event_comments_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO event_comments (event_id, user_id, content) VALUES
(1, 3, '请问需要自备球吗？'),
(1, 1, '是的，需要自带球拍，球场会提供羽毛球。'),
(1, 4, '请问有更衣室和淋浴设施吗？'),
(1, 1, '有的，场馆提供更衣室和淋浴设施。'),
(2, 5, '请问可以穿普通运动鞋参加吗？'),
(2, 2, '建议穿平底防滑的运动鞋，足球鞋效果更好。'),
(3, 4, '初学者也能跟上吗？'),
(3, 3, '没问题，课程专为初学者设计，会从基础动作开始教学。'),
(4, 2, '请问集合地点在哪里？'),
(4, 4, '我们会在华山游客中心集合，早上6:30准时出发。');
```
