# 运动社交App数据库设计文档 - MySQL版 (第四部分)

本文档是《运动社交App数据库设计文档 - MySQL版》的第四部分，描述活动相册和运动数据跟踪相关表结构设计。

## V1.3 活动版数据库设计（续）

### 活动系统（续）

#### 1. `event_images` 表 - 活动相册

```sql
CREATE TABLE event_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL COMMENT '活动ID',
    user_id INT NOT NULL COMMENT '上传用户ID',
    image_url VARCHAR(255) NOT NULL COMMENT '图片URL地址',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_event_images_event_id (event_id),
    INDEX idx_event_images_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO event_images (event_id, user_id, image_url) VALUES
(1, 1, 'https://example.com/images/events/badminton_1.jpg'),
(1, 1, 'https://example.com/images/events/badminton_2.jpg'),
(1, 3, 'https://example.com/images/events/badminton_3.jpg'),
(2, 2, 'https://example.com/images/events/football_1.jpg'),
(2, 2, 'https://example.com/images/events/football_2.jpg'),
(3, 3, 'https://example.com/images/events/yoga_1.jpg'),
(3, 3, 'https://example.com/images/events/yoga_2.jpg'),
(4, 4, 'https://example.com/images/events/hiking_1.jpg'),
(4, 4, 'https://example.com/images/events/hiking_2.jpg'),
(4, 1, 'https://example.com/images/events/hiking_3.jpg');
```

## V2.0 数据版数据库设计

### 运动数据跟踪

#### 2. `workout_records` 表 - 运动记录

```sql
CREATE TABLE workout_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    category_id INT COMMENT '运动类别ID',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    duration INT NOT NULL COMMENT '运动时长(秒)',
    distance DECIMAL(10,2) COMMENT '运动距离(公里)',
    calories INT COMMENT '消耗卡路里',
    avg_heart_rate INT COMMENT '平均心率',
    max_heart_rate INT COMMENT '最高心率',
    notes TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_workout_records_user_id (user_id),
    INDEX idx_workout_records_category_id (category_id),
    INDEX idx_workout_records_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO workout_records (user_id, category_id, start_time, end_time, duration, distance, calories, avg_heart_rate, max_heart_rate, notes) VALUES
(1, 1, '2023-06-10 07:30:00', '2023-06-10 09:15:00', 6300, 8.5, 750, 145, 175, '今天爬山感觉很好，天气晴朗，视野开阔。'),
(1, 3, '2023-06-12 18:00:00', '2023-06-12 19:30:00', 5400, NULL, 480, 155, 180, '和朋友踢了90分钟的足球，非常愉快。'),
(2, 2, '2023-06-11 15:00:00', '2023-06-11 17:00:00', 7200, NULL, 550, 140, 165, '打了两小时羽毛球，技术有所提升。'),
(2, 4, '2023-06-13 19:30:00', '2023-06-13 21:00:00', 5400, NULL, 650, 160, 185, '参加了社区篮球赛，很有竞争力。'),
(3, 4, '2023-06-10 08:00:00', '2023-06-10 09:00:00', 3600, NULL, 220, 110, 130, '早晨瑜伽课，感觉很放松。'),
(3, 2, '2023-06-12 17:30:00', '2023-06-12 19:00:00', 5400, NULL, 480, 140, 165, '和同事打羽毛球，进步明显。'),
(4, 1, '2023-06-11 07:00:00', '2023-06-11 11:30:00', 16200, 15.3, 1650, 155, 190, '登山挑战成功，景色壮观，体力消耗很大。'),
(4, 4, '2023-06-13 18:00:00', '2023-06-13 19:30:00', 5400, NULL, 350, 135, 160, '乒乓球训练，对手很强，学到了新技巧。'),
(5, 4, '2023-06-10 20:00:00', '2023-06-10 21:30:00', 5400, NULL, 680, 165, 190, '篮球训练，投篮命中率提高。'),
(5, 3, '2023-06-12 19:00:00', '2023-06-12 20:30:00', 5400, NULL, 520, 150, 175, '足球训练，重点练习了传球技巧。');
```

#### 3. `workout_routes` 表 - 运动轨迹

```sql
CREATE TABLE workout_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_id INT NOT NULL COMMENT '关联的运动记录ID',
    route_data JSON NOT NULL COMMENT '轨迹数据，包含经纬度和时间戳的点数组',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_workout_routes_workout_id (workout_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO workout_routes (workout_id, route_data) VALUES
(1, '[{"lat": 34.5553, "lng": 110.0953, "timestamp": "2023-06-10T07:30:00", "elevation": 1200},
   {"lat": 34.5561, "lng": 110.0965, "timestamp": "2023-06-10T07:45:00", "elevation": 1250},
   {"lat": 34.5575, "lng": 110.0978, "timestamp": "2023-06-10T08:15:00", "elevation": 1350},
   {"lat": 34.5590, "lng": 110.0990, "timestamp": "2023-06-10T08:45:00", "elevation": 1500},
   {"lat": 34.5600, "lng": 110.1005, "timestamp": "2023-06-10T09:15:00", "elevation": 1600}]'),
(4, '[{"lat": 34.5253, "lng": 110.1053, "timestamp": "2023-06-11T07:00:00", "elevation": 1100},
   {"lat": 34.5261, "lng": 110.1065, "timestamp": "2023-06-11T07:30:00", "elevation": 1200},
   {"lat": 34.5275, "lng": 110.1078, "timestamp": "2023-06-11T08:15:00", "elevation": 1400},
   {"lat": 34.5290, "lng": 110.1090, "timestamp": "2023-06-11T09:00:00", "elevation": 1600},
   {"lat": 34.5305, "lng": 110.1105, "timestamp": "2023-06-11T10:00:00", "elevation": 1800},
   {"lat": 34.5320, "lng": 110.1120, "timestamp": "2023-06-11T11:00:00", "elevation": 2000},
   {"lat": 34.5325, "lng": 110.1125, "timestamp": "2023-06-11T11:30:00", "elevation": 1900}]');
```

#### 4. `fitness_goals` 表 - 健身目标

```sql
CREATE TABLE fitness_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    category_id INT COMMENT '运动类别ID',
    type VARCHAR(30) NOT NULL COMMENT '目标类型:distance, duration, frequency, etc.',
    target_value DECIMAL(10,2) NOT NULL COMMENT '目标值',
    period VARCHAR(20) NOT NULL COMMENT '目标周期:daily, weekly, monthly',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    status VARCHAR(20) DEFAULT 'active' COMMENT '目标状态:active, completed, abandoned',
    progress DECIMAL(10,2) DEFAULT 0 COMMENT '当前进度',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_fitness_goals_user_id (user_id),
    INDEX idx_fitness_goals_category_id (category_id),
    INDEX idx_fitness_goals_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO fitness_goals (user_id, category_id, type, target_value, period, start_date, end_date, status, progress) VALUES
(1, 1, 'distance', 50.00, 'monthly', '2023-06-01', '2023-06-30', 'active', 8.50),
(1, 3, 'frequency', 8.00, 'monthly', '2023-06-01', '2023-06-30', 'active', 1.00),
(2, 2, 'duration', 30.00, 'weekly', '2023-06-05', '2023-07-02', 'active', 7.20),
(2, 4, 'frequency', 12.00, 'monthly', '2023-06-01', '2023-06-30', 'active', 1.00),
(3, 4, 'duration', 10.00, 'weekly', '2023-06-05', '2023-07-02', 'active', 3.60),
(4, 1, 'distance', 100.00, 'monthly', '2023-06-01', '2023-06-30', 'active', 15.30),
(5, 4, 'duration', 20.00, 'weekly', '2023-06-05', '2023-07-02', 'active', 5.40);
```

### 用户成就系统

#### 5. `achievements` 表 - 成就定义

```sql
CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '成就名称',
    description TEXT NOT NULL COMMENT '成就描述',
    category_id INT COMMENT '关联运动类别ID',
    requirement_type VARCHAR(30) NOT NULL COMMENT '要求类型:distance, duration, frequency, etc.',
    requirement_value DECIMAL(10,2) NOT NULL COMMENT '要求值',
    icon_url VARCHAR(255) COMMENT '图标URL',
    points INT DEFAULT 0 COMMENT '获得积分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_achievements_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO achievements (name, description, category_id, requirement_type, requirement_value, icon_url, points) VALUES
('登山新手', '完成首次登山活动', 1, 'frequency', 1.00, 'https://example.com/images/achievements/hiking_beginner.png', 10),
('登山达人', '累计登山距离超过100公里', 1, 'distance', 100.00, 'https://example.com/images/achievements/hiking_master.png', 50),
('羽毛球爱好者', '累计打羽毛球超过10小时', 2, 'duration', 10.00, 'https://example.com/images/achievements/badminton_lover.png', 20),
('足球健将', '参加5次足球活动', 3, 'frequency', 5.00, 'https://example.com/images/achievements/football_expert.png', 30),
('瑜伽入门', '完成5次瑜伽课程', 4, 'frequency', 5.00, 'https://example.com/images/achievements/yoga_beginner.png', 15),
('乒乓高手', '累计打乒乓球超过20小时', 5, 'duration', 20.00, 'https://example.com/images/achievements/pingpong_master.png', 40),
('篮球明星', '参加10次篮球活动', 6, 'frequency', 10.00, 'https://example.com/images/achievements/basketball_star.png', 35),
('运动多面手', '参与3种不同类型的运动', 0, 'variety', 3.00, 'https://example.com/images/achievements/versatile_athlete.png', 30),
('社交蝴蝶', '参加10次社区活动', 0, 'frequency', 10.00, 'https://example.com/images/achievements/social_butterfly.png', 25),
('早起锻炼者', '完成10次早晨6点前的运动', 0, 'frequency', 10.00, 'https://example.com/images/achievements/early_bird.png', 35);
```

#### 6. `user_achievements` 表 - 用户获得的成就

```sql
CREATE TABLE user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    achievement_id INT NOT NULL COMMENT '成就ID',
    achieved_at DATETIME NOT NULL COMMENT '获得时间',
    UNIQUE KEY (user_id, achievement_id),
    INDEX idx_user_achievements_user_id (user_id),
    INDEX idx_user_achievements_achievement_id (achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO user_achievements (user_id, achievement_id, achieved_at) VALUES
(1, 1, '2023-06-10 09:15:00'),
(1, 4, '2023-06-12 19:30:00'),
(1, 8, '2023-06-12 19:30:00'),
(2, 3, '2023-06-11 17:00:00'),
(2, 7, '2023-06-13 21:00:00'),
(3, 5, '2023-06-10 09:00:00'),
(3, 3, '2023-06-12 19:00:00'),
(3, 8, '2023-06-12 19:00:00'),
(4, 1, '2023-06-11 11:30:00'),
(4, 6, '2023-06-13 19:30:00'),
(4, 8, '2023-06-13 19:30:00'),
(5, 7, '2023-06-10 21:30:00'),
(5, 4, '2023-06-12 20:30:00'),
(5, 8, '2023-06-12 20:30:00');
```

### 数据分析与统计

#### 7. `workout_statistics` 表 - 用户运动统计数据

```sql
CREATE TABLE workout_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    category_id INT COMMENT '运动类别ID',
    period VARCHAR(20) NOT NULL COMMENT '统计周期:daily, weekly, monthly, yearly, all_time',
    period_start_date DATE NOT NULL COMMENT '周期开始日期',
    period_end_date DATE NOT NULL COMMENT '周期结束日期',
    total_workouts INT DEFAULT 0 COMMENT '运动次数',
    total_duration INT DEFAULT 0 COMMENT '总时长(秒)',
    total_distance DECIMAL(10,2) DEFAULT 0 COMMENT '总距离(公里)',
    total_calories INT DEFAULT 0 COMMENT '总消耗卡路里',
    avg_heart_rate INT COMMENT '平均心率',
    max_heart_rate INT COMMENT '最高心率',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY (user_id, category_id, period, period_start_date),
    INDEX idx_workout_statistics_user_id (user_id),
    INDEX idx_workout_statistics_category_id (category_id),
    INDEX idx_workout_statistics_period (period, period_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO workout_statistics (user_id, category_id, period, period_start_date, period_end_date, total_workouts, total_duration, total_distance, total_calories, avg_heart_rate, max_heart_rate) VALUES
(1, 1, 'monthly', '2023-06-01', '2023-06-30', 1, 6300, 8.50, 750, 145, 175),
(1, 3, 'monthly', '2023-06-01', '2023-06-30', 1, 5400, 0.00, 480, 155, 180),
(1, NULL, 'monthly', '2023-06-01', '2023-06-30', 2, 11700, 8.50, 1230, 150, 180),
(2, 2, 'monthly', '2023-06-01', '2023-06-30', 1, 7200, 0.00, 550, 140, 165),
(2, 4, 'monthly', '2023-06-01', '2023-06-30', 1, 5400, 0.00, 650, 160, 185),
(2, NULL, 'monthly', '2023-06-01', '2023-06-30', 2, 12600, 0.00, 1200, 150, 185),
(3, 4, 'monthly', '2023-06-01', '2023-06-30', 1, 3600, 0.00, 220, 110, 130),
(3, 2, 'monthly', '2023-06-01', '2023-06-30', 1, 5400, 0.00, 480, 140, 165),
(3, NULL, 'monthly', '2023-06-01', '2023-06-30', 2, 9000, 0.00, 700, 125, 165),
(4, 1, 'monthly', '2023-06-01', '2023-06-30', 1, 16200, 15.30, 1650, 155, 190),
(4, 4, 'monthly', '2023-06-01', '2023-06-30', 1, 5400, 0.00, 350, 135, 160),
(4, NULL, 'monthly', '2023-06-01', '2023-06-30', 2, 21600, 15.30, 2000, 145, 190),
(5, 4, 'monthly', '2023-06-01', '2023-06-30', 1, 5400, 0.00, 680, 165, 190),
(5, 3, 'monthly', '2023-06-01', '2023-06-30', 1, 5400, 0.00, 520, 150, 175),
(5, NULL, 'monthly', '2023-06-01', '2023-06-30', 2, 10800, 0.00, 1200, 157, 190);
```

#### 8. `leaderboards` 表 - 排行榜数据

```sql
CREATE TABLE leaderboards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT COMMENT '运动类别ID',
    metric VARCHAR(30) NOT NULL COMMENT '排名指标:distance, duration, frequency, calories',
    period VARCHAR(20) NOT NULL COMMENT '排名周期:weekly, monthly, all_time',
    period_start_date DATE NOT NULL COMMENT '周期开始日期',
    period_end_date DATE NOT NULL COMMENT '周期结束日期',
    user_id INT NOT NULL COMMENT '用户ID',
    value DECIMAL(10,2) NOT NULL COMMENT '指标值',
    rank INT NOT NULL COMMENT '排名',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY (category_id, metric, period, period_start_date, user_id),
    INDEX idx_leaderboards_category_metric (category_id, metric),
    INDEX idx_leaderboards_period (period, period_start_date),
    INDEX idx_leaderboards_user_id (user_id),
    INDEX idx_leaderboards_rank (rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**示例数据：**

```sql
INSERT INTO leaderboards (category_id, metric, period, period_start_date, period_end_date, user_id, value, rank) VALUES
-- 登山总距离月榜
(1, 'distance', 'monthly', '2023-06-01', '2023-06-30', 4, 15.30, 1),
(1, 'distance', 'monthly', '2023-06-01', '2023-06-30', 1, 8.50, 2),
-- 羽毛球总时长月榜
(2, 'duration', 'monthly', '2023-06-01', '2023-06-30', 2, 7200.00, 1),
(2, 'duration', 'monthly', '2023-06-01', '2023-06-30', 3, 5400.00, 2),
-- 足球总卡路里消耗月榜
(3, 'calories', 'monthly', '2023-06-01', '2023-06-30', 5, 520.00, 1),
(3, 'calories', 'monthly', '2023-06-01', '2023-06-30', 1, 480.00, 2),
-- 瑜伽总时长月榜
(4, 'duration', 'monthly', '2023-06-01', '2023-06-30', 5, 5400.00, 1),
(4, 'duration', 'monthly', '2023-06-01', '2023-06-30', 4, 5400.00, 2),
(4, 'duration', 'monthly', '2023-06-01', '2023-06-30', 3, 3600.00, 3),
-- 所有运动总卡路里消耗月榜
(NULL, 'calories', 'monthly', '2023-06-01', '2023-06-30', 4, 2000.00, 1),
(NULL, 'calories', 'monthly', '2023-06-01', '2023-06-30', 1, 1230.00, 2),
(NULL, 'calories', 'monthly', '2023-06-01', '2023-06-30', 5, 1200.00, 3),
(NULL, 'calories', 'monthly', '2023-06-01', '2023-06-30', 2, 1200.00, 4),
(NULL, 'calories', 'monthly', '2023-06-01', '2023-06-30', 3, 700.00, 5);
```

## 总结

本数据库设计提供了运动社交App的完整存储方案，具有以下特点：

1. **避免外键约束**：所有表都不使用外键约束，通过应用层维护数据完整性
2. **合理索引设计**：为常用查询场景创建了适当的索引，保证查询效率
3. **分版本演进**：按照V1.0、V1.1、V1.2、V1.3和V2.0不同版本需求设计数据结构
4. **功能模块化**：用户系统、帖子系统、场地系统、活动系统、运动数据系统等模块清晰分离
5. **数据统计支持**：提供了统计分析所需的数据结构

通过合理使用索引和数据设计，即使在没有外键约束的情况下，也能保证数据的高效访问和完整性管理。
