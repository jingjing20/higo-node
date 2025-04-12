# 运动社交App数据库设计文档 - MySQL版 (第二部分)

本文档是《运动社交App数据库设计文档 - MySQL版》的第二部分，描述场地系统和管理后台相关表结构设计。

## V1.0 基础版数据库设计（续）

### 场地相关表

#### 1. `comment_likes` 表 - 评论点赞

```sql
CREATE TABLE comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL COMMENT '评论ID',
    user_id INT NOT NULL COMMENT '点赞用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY (comment_id, user_id),
    INDEX idx_comment_likes_comment_id (comment_id),
    INDEX idx_comment_likes_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO comment_likes (comment_id, user_id) VALUES
(1, 1), (1, 4), (1, 5),
(3, 2), (3, 5),
(4, 1), (4, 2), (4, 5),
(5, 1), (5, 3), (5, 4),
(6, 2), (6, 5),
(9, 2), (9, 3), (9, 5),
(10, 1), (10, 3),
(11, 2), (11, 4), (11, 5),
(12, 1), (12, 3), (12, 4), (12, 5),
(14, 1), (14, 2), (14, 5),
(16, 1), (16, 2), (16, 4), (16, 5);
```

#### 2. `venues` 表 - 运动场地

```sql
CREATE TABLE venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '场地名称',
    address TEXT NOT NULL COMMENT '详细地址',
    category_id INT COMMENT '运动类别ID',
    longitude DECIMAL(9,6) NOT NULL COMMENT '经度坐标',
    latitude DECIMAL(9,6) NOT NULL COMMENT '纬度坐标',
    is_free TINYINT(1) DEFAULT 1 COMMENT '是否免费使用',
    price_description VARCHAR(255) COMMENT '价格描述',
    crowd_level VARCHAR(20) COMMENT '人流量级别：low, medium, high',
    user_id INT COMMENT '创建者用户ID',
    is_approved TINYINT(1) DEFAULT 0 COMMENT '是否审核通过',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_venues_category_id (category_id),
    INDEX idx_venues_user_id (user_id),
    INDEX idx_venues_location (longitude, latitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO venues (name, address, category_id, longitude, latitude, is_free, price_description, crowd_level, user_id, is_approved) VALUES
('阳光体育馆', '北京市朝阳区阳光里12号', 1, 116.481488, 39.997761, 0, '平时40元/小时，周末60元/小时', 'medium', 1, 1),
('健康羽毛球馆', '上海市静安区南京西路1688号', 2, 121.459622, 31.229557, 0, '50元/小时', 'high', 2, 1),
('五人制足球场', '广州市天河区体育西路191号', 3, 113.330605, 23.137898, 0, '400元/场（90分钟）', 'medium', 3, 1),
('华山景区', '陕西省华阴市华山镇', 1, 110.089031, 34.525417, 0, '门票160元/人', 'high', 4, 1),
('青城山', '四川省都江堰市青城山镇', 1, 103.570019, 30.898520, 0, '门票90元/人', 'medium', 5, 1),
('工人体育场', '北京市朝阳区工人体育场北路', 3, 116.446947, 39.930691, 0, '比赛日门票100-300元不等', 'high', 1, 1),
('社区篮球场', '上海市静安区武定路258号附近', 1, 121.452390, 31.235800, 1, '免费', 'low', 2, 1),
('龙泉山', '四川省成都市龙泉驿区龙泉山', 1, 104.269772, 30.582630, 1, '免费', 'low', 3, 1);
```

#### 3. `venue_images` 表 - 场地图片

```sql
CREATE TABLE venue_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL COMMENT '场地ID',
    image_url VARCHAR(255) NOT NULL COMMENT '图片URL地址',
    sequence_number INT NOT NULL COMMENT '图片顺序号',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_venue_images_venue_id (venue_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO venue_images (venue_id, image_url, sequence_number) VALUES
(1, 'https://cdn.sportsapp.com/venues/venue1_img1.jpg', 1),
(1, 'https://cdn.sportsapp.com/venues/venue1_img2.jpg', 2),
(2, 'https://cdn.sportsapp.com/venues/venue2_img1.jpg', 1),
(2, 'https://cdn.sportsapp.com/venues/venue2_img2.jpg', 2),
(3, 'https://cdn.sportsapp.com/venues/venue3_img1.jpg', 1),
(4, 'https://cdn.sportsapp.com/venues/venue4_img1.jpg', 1),
(4, 'https://cdn.sportsapp.com/venues/venue4_img2.jpg', 2),
(4, 'https://cdn.sportsapp.com/venues/venue4_img3.jpg', 3),
(5, 'https://cdn.sportsapp.com/venues/venue5_img1.jpg', 1),
(5, 'https://cdn.sportsapp.com/venues/venue5_img2.jpg', 2),
(6, 'https://cdn.sportsapp.com/venues/venue6_img1.jpg', 1),
(7, 'https://cdn.sportsapp.com/venues/venue7_img1.jpg', 1),
(8, 'https://cdn.sportsapp.com/venues/venue8_img1.jpg', 1),
(8, 'https://cdn.sportsapp.com/venues/venue8_img2.jpg', 2);
```

### 管理后台相关表

#### 4. `admins` 表 - 管理员账户

```sql
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '管理员邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希值',
    name VARCHAR(50) NOT NULL COMMENT '管理员姓名',
    role VARCHAR(20) NOT NULL COMMENT '角色:super_admin, content_moderator, user_manager',
    last_login DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO admins (email, password_hash, name, role, last_login) VALUES
('admin@sportsapp.com', '$2a$10$NuEsWGFeE9iZ0cXWW/Lv2uQFVMZ6wLHrP7PPRxU5mZ9GW5TsJPBSS', '超级管理员', 'super_admin', '2023-06-12 09:30:00'),
('moderator@sportsapp.com', '$2a$10$E2D7tQlOU6VCj.6BGkxcN.U9oF4WhU0mwQtgwAdgGn4oEpan5NlUK', '内容审核员', 'content_moderator', '2023-06-12 10:15:00'),
('usermanager@sportsapp.com', '$2a$10$CfLnwS5KwmQe.GY1JsRxxei3KHm2p5qTEhRxGXcG5fPL1jb1oIyLW', '用户管理员', 'user_manager', '2023-06-11 14:20:00');
```

#### 5. `operation_logs` 表 - 操作日志

```sql
CREATE TABLE operation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT COMMENT '管理员ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
    target_type VARCHAR(20) NOT NULL COMMENT '目标类型:user, post, venue, etc.',
    target_id INT NOT NULL COMMENT '目标ID',
    details JSON COMMENT '操作详情',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_operation_logs_admin_id (admin_id),
    INDEX idx_operation_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO operation_logs (admin_id, operation_type, target_type, target_id, details, ip_address, created_at) VALUES
(1, 'approve', 'post', 1, '{"reason": "内容符合规范"}', '192.168.1.100', '2023-06-10 10:30:00'),
(2, 'approve', 'post', 2, '{"reason": "内容符合规范"}', '192.168.1.101', '2023-06-10 11:15:00'),
(2, 'approve', 'post', 3, '{"reason": "内容符合规范"}', '192.168.1.101', '2023-06-10 11:20:00'),
(2, 'approve', 'post', 4, '{"reason": "内容符合规范"}', '192.168.1.101', '2023-06-10 14:05:00'),
(2, 'approve', 'post', 5, '{"reason": "内容符合规范"}', '192.168.1.101', '2023-06-11 09:30:00'),
(2, 'approve', 'post', 6, '{"reason": "内容符合规范"}', '192.168.1.101', '2023-06-11 10:45:00'),
(1, 'approve', 'venue', 1, '{"reason": "场地信息完整"}', '192.168.1.100', '2023-06-09 15:20:00'),
(1, 'approve', 'venue', 2, '{"reason": "场地信息完整"}', '192.168.1.100', '2023-06-09 15:25:00'),
(1, 'approve', 'venue', 3, '{"reason": "场地信息完整"}', '192.168.1.100', '2023-06-09 15:30:00'),
(1, 'approve', 'venue', 4, '{"reason": "场地信息完整"}', '192.168.1.100', '2023-06-09 16:10:00'),
(1, 'approve', 'venue', 5, '{"reason": "场地信息完整"}', '192.168.1.100', '2023-06-09 16:15:00'),
(1, 'approve', 'venue', 6, '{"reason": "场地信息完整"}', '192.168.1.100', '2023-06-09 16:20:00'),
(1, 'approve', 'venue', 7, '{"reason": "场地信息完整"}', '192.168.1.100', '2023-06-09 16:25:00'),
(1, 'approve', 'venue', 8, '{"reason": "场地信息完整"}', '192.168.1.100', '2023-06-09 16:30:00'),
(3, 'disable', 'user', 6, '{"reason": "违反社区规范", "duration": "7 days"}', '192.168.1.102', '2023-06-12 11:30:00');
```

## V1.1 社交版数据库设计

### 用户系统升级

#### 6. `user_points` 表 - 用户积分和等级

```sql
CREATE TABLE user_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    points INT NOT NULL DEFAULT 0 COMMENT '积分数量',
    level INT NOT NULL DEFAULT 1 COMMENT '用户等级',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_points_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO user_points (user_id, points, level) VALUES
(1, 520, 5),
(2, 380, 4),
(3, 450, 4),
(4, 280, 3),
(5, 320, 3);
```

#### 7. `point_transactions` 表 - 积分变更记录

```sql
CREATE TABLE point_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    points INT NOT NULL COMMENT '积分变动值，可正可负',
    transaction_type VARCHAR(50) NOT NULL COMMENT '交易类型:daily_check_in, post_liked, etc.',
    reference_id VARCHAR(100) COMMENT '关联的具体操作ID',
    description TEXT COMMENT '变更描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_point_transactions_user_id (user_id),
    INDEX idx_point_transactions_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO point_transactions (user_id, points, transaction_type, reference_id, description) VALUES
(1, 10, 'daily_check_in', NULL, '每日签到'),
(1, 50, 'post_created', '1', '发布帖子'),
(1, 20, 'post_liked', '1', '帖子获赞'),
(1, 100, 'venue_added', '1', '分享场地信息'),
(2, 10, 'daily_check_in', NULL, '每日签到'),
(2, 50, 'post_created', '2', '发布帖子'),
(2, 20, 'comment_created', '1', '发表评论'),
(3, 10, 'daily_check_in', NULL, '每日签到'),
(3, 50, 'post_created', '3', '发布帖子'),
(3, 20, 'comment_created', '2', '发表评论'),
(4, 10, 'daily_check_in', NULL, '每日签到'),
(4, 50, 'post_created', '4', '发布帖子'),
(5, 10, 'daily_check_in', NULL, '每日签到'),
(5, 50, 'post_created', '5', '发布帖子'),
(5, 20, 'comment_created', '4', '发表评论');
```

#### 8. `daily_check_ins` 表 - 每日签到记录

```sql
CREATE TABLE daily_check_ins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    check_in_date DATE NOT NULL COMMENT '签到日期',
    points_earned INT NOT NULL COMMENT '获得积分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY (user_id, check_in_date),
    INDEX idx_daily_check_ins_user_id (user_id),
    INDEX idx_daily_check_ins_check_in_date (check_in_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO daily_check_ins (user_id, check_in_date, points_earned) VALUES
(1, '2023-06-10', 10),
(1, '2023-06-11', 10),
(1, '2023-06-12', 10),
(2, '2023-06-10', 10),
(2, '2023-06-11', 10),
(2, '2023-06-12', 10),
(3, '2023-06-11', 10),
(3, '2023-06-12', 10),
(4, '2023-06-12', 10),
(5, '2023-06-09', 10),
(5, '2023-06-10', 10),
(5, '2023-06-11', 10),
(5, '2023-06-12', 10);
```

#### 9. `user_follows` 表 - 用户关注关系

```sql
CREATE TABLE user_follows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL COMMENT '关注者用户ID',
    followed_id INT NOT NULL COMMENT '被关注者用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY (follower_id, followed_id),
    INDEX idx_user_follows_follower_id (follower_id),
    INDEX idx_user_follows_followed_id (followed_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO user_follows (follower_id, followed_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 3), (2, 5),
(3, 1), (3, 4),
(4, 1), (4, 3), (4, 5),
(5, 1), (5, 2), (5, 4);
```

#### 10. `venue_opening_hours` 表 - 场地营业时间

```sql
CREATE TABLE venue_opening_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL COMMENT '场地ID',
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6) COMMENT '星期几，0表示周日，6表示周六',
    open_time TIME NOT NULL COMMENT '开放时间',
    close_time TIME NOT NULL COMMENT '关闭时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY (venue_id, day_of_week),
    INDEX idx_venue_opening_hours_venue_id (venue_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO venue_opening_hours (venue_id, day_of_week, open_time, close_time) VALUES
-- 阳光体育馆 (周一到周日 9:00-22:00)
(1, 0, '09:00:00', '22:00:00'),
(1, 1, '09:00:00', '22:00:00'),
(1, 2, '09:00:00', '22:00:00'),
(1, 3, '09:00:00', '22:00:00'),
(1, 4, '09:00:00', '22:00:00'),
(1, 5, '09:00:00', '22:00:00'),
(1, 6, '09:00:00', '22:00:00'),

-- 健康羽毛球馆 (周一到周五 10:00-22:00, 周末 9:00-23:00)
(2, 0, '09:00:00', '23:00:00'),
(2, 1, '10:00:00', '22:00:00'),
(2, 2, '10:00:00', '22:00:00'),
(2, 3, '10:00:00', '22:00:00'),
(2, 4, '10:00:00', '22:00:00'),
(2, 5, '10:00:00', '22:00:00'),
(2, 6, '09:00:00', '23:00:00');
```
