# 运动社交App数据库设计文档 - MySQL版 (第一部分)

本文档是《运动社交App数据库设计文档 - MySQL版》的第一部分，描述用户系统和帖子系统相关表结构设计。

## 数据库选择说明

选择MySQL作为数据库系统主要基于以下考虑：

1. **稳定性和性能**：MySQL是成熟的关系型数据库，在处理中小型应用时性能优异
2. **开发友好**：流行度高，文档丰富，开发资源广泛
3. **社区支持**：活跃的社区支持，大量问题可以找到解决方案
4. **与Web框架兼容性好**：与常见Web框架（如Laravel、Django等）有良好的集成

## 设计原则

1. **不使用外键约束**：虽然不使用外键约束，但在应用层面维护引用完整性
2. **合理索引**：为常用查询字段创建适当索引，提高查询效率
3. **标准化设计**：遵循数据库设计标准化原则，减少数据冗余
4. **灵活扩展**：考虑未来功能扩展的可能性，留有扩展空间
5. **版本化管理**：数据库设计按照应用版本演进规划

## V1.0 基础版数据库设计

### 用户系统相关表

#### 1. `users` 表 - 用户基本信息

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '用户邮箱，唯一标识',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希值',
    nickname VARCHAR(50) NOT NULL COMMENT '用户昵称',
    avatar_url VARCHAR(255) COMMENT '头像URL地址',
    bio TEXT COMMENT '个人简介',
    gender VARCHAR(10) COMMENT '性别',
    location VARCHAR(100) COMMENT '所在地区',
    is_verified TINYINT(1) DEFAULT 0 COMMENT '是否已验证邮箱',
    is_active TINYINT(1) DEFAULT 1 COMMENT '账号是否激活',
    last_login DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_users_email (email),
    INDEX idx_users_nickname (nickname)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO users (email, password_hash, nickname, avatar_url, bio, gender, location, is_verified, is_active, last_login) VALUES
('zhang.wei@example.com', '$2a$10$NpMVJyp7fZOWCemEL8OHGOdgRQ5QAGHE7wtLELUPc7dBcxoDw5vQG', '张伟', 'https://cdn.sportsapp.com/avatars/user1.jpg', '热爱篮球和跑步的IT工程师', '男', '北京市朝阳区', 1, 1, '2023-06-12 08:30:00'),
('li.na@example.com', '$2a$10$LL1JdTLVeJf7T1hRZKYTb.VgQK9KiXYFc/Y6qNqb.JnO7xIr.3Rx2', '李娜', 'https://cdn.sportsapp.com/avatars/user2.jpg', '羽毛球爱好者，每周打三次', '女', '上海市静安区', 1, 1, '2023-06-11 19:45:00'),
('wang.fei@example.com', '$2a$10$0j7.9I/mCBGFpJqzjUPveeZFDO3X6X0Ov5Z5XMT92J8oRgPVFgMS6', '王飞', 'https://cdn.sportsapp.com/avatars/user3.jpg', '足球教练，专注青少年足球培训', '男', '广州市天河区', 1, 1, '2023-06-12 10:15:00'),
('chen.jie@example.com', '$2a$10$9RJP2TZ8KgxGHMUjwvebn.LFjvY7KBW3TrA90QdFj93QLHPVvshTi', '陈杰', 'https://cdn.sportsapp.com/avatars/user4.jpg', '喜欢徒步旅行和户外运动', '男', '成都市武侯区', 1, 1, '2023-06-10 16:20:00'),
('zhao.min@example.com', '$2a$10$2eNFZ9NUwA68DYu/I6ht0.n1QUaPMoaWVr9DYT8TjdkVNusQ1yPV.', '赵敏', 'https://cdn.sportsapp.com/avatars/user5.jpg', '瑜伽教练，提供专业瑜伽指导', '女', '深圳市南山区', 1, 1, '2023-06-11 14:10:00');
```

#### 2. `verification_tokens` 表 - 验证令牌

```sql
CREATE TABLE verification_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '关联的用户ID',
    token VARCHAR(100) NOT NULL COMMENT '验证令牌',
    type VARCHAR(20) NOT NULL COMMENT 'email, password_reset, etc.',
    expires_at DATETIME NOT NULL COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_verification_tokens_user_id (user_id),
    INDEX idx_verification_tokens_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO verification_tokens (user_id, token, type, expires_at) VALUES
(1, 'dfac23ef67890abcdef1234567890abcdef12345', 'email', '2023-06-13 08:30:00'),
(2, 'bcdef12345dfac23ef67890abcdef1234567890a', 'password_reset', '2023-06-14 19:45:00'),
(3, '7890abcdef12345dfac23ef67890abcdef12345d', 'password_reset', '2023-06-13 10:15:00');
```

#### 3. `categories` 表 - 运动类别

```sql
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '运动类别名称',
    description TEXT COMMENT '类别描述',
    icon_url VARCHAR(255) COMMENT '类别图标URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO categories (name, description, icon_url) VALUES
('登山', '包括远足、徒步、登山等户外爬山活动', 'https://cdn.sportsapp.com/icons/cat_hiking.png'),
('羽毛球', '室内羽毛球运动及相关活动', 'https://cdn.sportsapp.com/icons/cat_badminton.png'),
('足球', '包括五人制、七人制、十一人制等足球活动', 'https://cdn.sportsapp.com/icons/cat_football.png'),
('瑜伽', '各类瑜伽及冥想活动', 'https://cdn.sportsapp.com/icons/cat_yoga.png');
```

#### 4. `user_category_preferences` 表 - 用户兴趣偏好

```sql
CREATE TABLE user_category_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    category_id INT NOT NULL COMMENT '运动类别ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY (user_id, category_id),
    INDEX idx_user_category_preferences_user_id (user_id),
    INDEX idx_user_category_preferences_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO user_category_preferences (user_id, category_id) VALUES
(1, 1), (1, 3),
(2, 2), (2, 4),
(3, 3), (3, 1),
(4, 1), (4, 4),
(5, 4), (5, 2);
```

### 帖子系统相关表

#### 5. `posts` 表 - 用户发帖

```sql
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '发帖用户ID',
    category_id INT COMMENT '所属运动类别ID',
    title VARCHAR(100) NOT NULL COMMENT '帖子标题',
    content TEXT NOT NULL COMMENT '帖子内容',
    type VARCHAR(20) DEFAULT 'normal' COMMENT 'normal, event, question',
    location VARCHAR(100) COMMENT '地理位置文字描述',
    coordinates POINT NOT NULL COMMENT '地理坐标点',
    is_approved TINYINT(1) DEFAULT 1 COMMENT '是否审核通过',
    likes_count INT DEFAULT 0 COMMENT '点赞数',
    comments_count INT DEFAULT 0 COMMENT '评论数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_posts_user_id (user_id),
    INDEX idx_posts_category_id (category_id),
    INDEX idx_posts_created_at (created_at),
    SPATIAL INDEX idx_posts_coordinates (coordinates)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO posts (user_id, category_id, title, content, type, location, coordinates, is_approved, likes_count, comments_count) VALUES
(1, 1, '周末爬山活动召集', '本周末组织爬山活动，有兴趣的朋友可以报名参加，我们将一起去香山，感受初夏的气息。', 'event', '北京市海淀区香山', POINT(116.195053, 40.056942), 1, 15, 8),
(2, 2, '求推荐性价比高的羽毛球拍', '最近想换一把新羽毛球拍，预算300-500元，有推荐的型号吗？', 'question', '上海市', POINT(121.473667, 31.230525), 1, 7, 12),
(3, 3, '足球训练技巧分享', '作为一名足球教练，我想分享一些关于提高控球能力的小技巧...（内容略）', 'normal', '广州市', POINT(113.264385, 23.129112), 1, 20, 5),
(4, 1, '徒步穿越贡嘎攻略', '上个月完成了贡嘎山穿越，分享一下路线规划和装备准备经验...（内容略）', 'normal', '四川省甘孜藏族自治州', POINT(101.963981, 29.995172), 1, 32, 15),
(5, 4, '初学者瑜伽练习指南', '很多瑜伽初学者常犯的错误和纠正方法...（内容略）', 'normal', '深圳市', POINT(114.057939, 22.543527), 1, 24, 9),
(6, 3, '社区足球赛招募队员', '我们小区正在组织一场五人制足球赛，现在还缺3名队员，有兴趣的可以联系我...', 'event', '北京市朝阳区', POINT(116.443251, 39.920926), 1, 8, 6);
```

#### 6. `post_images` 表 - 帖子图片

```sql
CREATE TABLE post_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL COMMENT '关联帖子ID',
    image_url VARCHAR(255) NOT NULL COMMENT '图片URL地址',
    sequence_number INT NOT NULL COMMENT '图片顺序号',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_post_images_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO post_images (post_id, image_url, sequence_number) VALUES
(1, 'https://cdn.sportsapp.com/posts/post1_img1.jpg', 1),
(1, 'https://cdn.sportsapp.com/posts/post1_img2.jpg', 2),
(3, 'https://cdn.sportsapp.com/posts/post3_img1.jpg', 1),
(3, 'https://cdn.sportsapp.com/posts/post3_img2.jpg', 2),
(3, 'https://cdn.sportsapp.com/posts/post3_img3.jpg', 3),
(4, 'https://cdn.sportsapp.com/posts/post4_img1.jpg', 1),
(4, 'https://cdn.sportsapp.com/posts/post4_img2.jpg', 2),
(4, 'https://cdn.sportsapp.com/posts/post4_img3.jpg', 3),
(4, 'https://cdn.sportsapp.com/posts/post4_img4.jpg', 4),
(5, 'https://cdn.sportsapp.com/posts/post5_img1.jpg', 1),
(6, 'https://cdn.sportsapp.com/posts/post6_img1.jpg', 1);
```

#### 7. `post_likes` 表 - 帖子点赞

```sql
CREATE TABLE post_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL COMMENT '帖子ID',
    user_id INT NOT NULL COMMENT '点赞用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY (post_id, user_id),
    INDEX idx_post_likes_post_id (post_id),
    INDEX idx_post_likes_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO post_likes (post_id, user_id) VALUES
(1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 3), (2, 4),
(3, 1), (3, 2), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 3), (4, 5),
(5, 1), (5, 2), (5, 3), (5, 4),
(6, 1), (6, 2), (6, 4);
```

#### 8. `comments` 表 - 评论

```sql
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL COMMENT '关联帖子ID',
    user_id INT NOT NULL COMMENT '评论用户ID',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id INT COMMENT '父评论ID，用于回复功能',
    likes_count INT DEFAULT 0 COMMENT '点赞数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_comments_post_id (post_id),
    INDEX idx_comments_user_id (user_id),
    INDEX idx_comments_parent_id (parent_id),
    INDEX idx_comments_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO comments (post_id, user_id, content, parent_id, likes_count) VALUES
(1, 2, '这次活动时间安排如何？是一天还是半天？', NULL, 3),
(1, 1, '计划是上午9点出发，下午4点左右结束，全天活动。', 1, 2),
(1, 3, '需要自备午餐吗？', NULL, 1),
(1, 1, '是的，请自备干粮和水。', 3, 1),
(2, 3, '我用的是李宁N90三代，性价比不错，推荐你试试。', NULL, 5),
(2, 4, '尤尼克斯的NF800也不错，我用了两年了。', NULL, 3),
(2, 5, '我比较推荐威克多的TK15，适合新手。', NULL, 2),
(2, 2, '谢谢大家的推荐，我去看看这几款。', 5, 0),
(3, 1, '这些技巧对提高球感很有帮助，谢谢分享！', NULL, 4),
(3, 4, '教练，有没有关于传球的训练方法可以分享？', NULL, 2),
(3, 3, '有的，我下次专门写一篇关于传球技巧的文章。', 10, 3),
(4, 2, '照片拍得太美了，请问穿越需要多少天？', NULL, 6),
(4, 4, '装备清单里缺了防晒霜，贡嘎地区紫外线很强。', NULL, 4),
(4, 3, '这条路线难度如何？适合新手尝试吗？', NULL, 5),
(4, 1, '一般需要6-8天。这条路线难度中等，有一定户外经验的人可以尝试。', 12, 2),
(5, 3, '作为初学者，特别感谢这些提醒，避免了我很多错误动作。', NULL, 7),
(5, 2, '请问有推荐的瑜伽垫品牌吗？', NULL, 3),
(5, 5, 'Lululemon和Manduka都是不错的选择，但价格偏高。', 17, 4),
(6, 5, '我有兴趣参加，请问什么时间比赛？', NULL, 2),
(6, 3, '这次比赛的水平如何？我是业余爱好者。', NULL, 1),
(6, 6, '比赛定于本周六下午2点，地点在朝阳公园足球场。', 19, 0),
(6, 6, '都是业余水平，以娱乐为主，欢迎参加。', 20, 0);
```
