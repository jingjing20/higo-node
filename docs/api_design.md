# 运动社交App接口需求规划

本文档详细规划了运动社交App各版本需要开发的API接口，为前后端开发团队提供明确的开发指导。

## 基础架构

所有API都遵循以下规范：

- 基础URL: `https://api.sportsapp.com/v1`
- 认证方式: JWT Token (Authorization头)
- 请求格式: JSON
- 响应格式: JSON
- 状态码: 标准HTTP状态码
- 错误处理: 统一错误响应格式 `{success: false, code: xxx, message: "xxx"}`
- 统一数据结构返回: `{success: true, data: { "xxx": "xxx" }, message: "xxx"}`

## V1.0 基础版 API

### 1. 用户系统 API

#### 1.1 认证API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/password/forgot` - 忘记密码
- `POST /api/auth/password/reset` - 重置密码
- `POST /api/auth/verify` - 验证邮箱

#### 1.2 用户信息API

- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新用户个人信息
- `POST /api/users/avatar` - 上传/更新头像
- `GET /api/users/{userId}` - 获取指定用户公开信息

### 2. 运动类别 API

- `GET /api/categories` - 获取所有运动类别
- `POST /api/users/me/categories` - 关注运动类别
- `DELETE /api/users/me/categories/{categoryId}` - 取消关注运动类别
- `GET /api/users/me/categories` - 获取用户关注的类别

### 3. 帖子系统 API

- `POST /api/posts` - 创建帖子
- `GET /api/posts` - 获取帖子列表(支持分页和过滤)
- `GET /api/posts/{postId}` - 获取帖子详情
- `PUT /api/posts/{postId}` - 更新帖子
- `DELETE /api/posts/{postId}` - 删除帖子
- `POST /api/posts/{postId}/likes` - 点赞帖子
- `DELETE /api/posts/{postId}/likes` - 取消点赞
- `POST /api/posts/{postId}/comments` - 评论帖子
- `GET /api/posts/{postId}/comments` - 获取帖子评论
- `POST /api/upload/images` - 上传帖子图片

### 4. 场地分享 API

- `POST /api/venues` - 创建场地信息
- `GET /api/venues` - 获取场地列表(支持分页和过滤)
- `GET /api/venues/{venueId}` - 获取场地详情
- `PUT /api/venues/{venueId}` - 更新场地信息
- `DELETE /api/venues/{venueId}` - 删除场地信息
- `GET /api/venues/nearby` - 获取附近场地(基于地理位置)

### 5. 管理后台 API

- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/{userId}/status` - 更改用户状态(禁用/启用)
- `GET /api/admin/posts/pending` - 获取待审核帖子
- `PUT /api/admin/posts/{postId}/status` - 审核帖子
- `GET /api/admin/venues/pending` - 获取待审核场地
- `PUT /api/admin/venues/{venueId}/status` - 审核场地

## V1.1 社交版 API

### 1. 用户系统升级 API

- `GET /api/users/me/points` - 获取用户积分
- `GET /api/users/me/level` - 获取用户等级
- `POST /api/users/me/dailyCheck` - 用户每日签到
- `POST /api/users/follow/{userId}` - 关注用户
- `DELETE /api/users/follow/{userId}` - 取消关注
- `GET /api/users/me/followers` - 获取粉丝列表
- `GET /api/users/me/following` - 获取关注列表

### 2. 帖子系统增强 API

- `POST /api/posts/question` - 创建问答帖子
- `POST /api/posts/experience` - 创建经验分享帖子
- `POST /api/posts/{postId}/favorite` - 收藏帖子
- `DELETE /api/posts/{postId}/favorite` - 取消收藏
- `GET /api/users/me/favorites` - 获取收藏列表
- `POST /api/posts/{postId}/share` - 分享统计
- `GET /api/users/mention/suggest` - 获取@用户建议

### 3. 消息通知中心 API

- `GET /api/notifications` - 获取通知列表
- `PUT /api/notifications/{notificationId}/read` - 标记通知为已读
- `PUT /api/notifications/readAll` - 标记所有通知为已读
- `GET /api/notifications/settings` - 获取通知设置
- `PUT /api/notifications/settings` - 更新通知设置

### 4. 违规举报 API

- `POST /api/reports/post/{postId}` - 举报帖子
- `POST /api/reports/comment/{commentId}` - 举报评论
- `POST /api/reports/user/{userId}` - 举报用户
- `GET /api/admin/reports` - 获取举报列表
- `PUT /api/admin/reports/{reportId}/handle` - 处理举报

## V1.2 增强版 API

### 1. 场地系统升级 API

- `POST /api/venues/{venueId}/ratings` - 评分场地
- `GET /api/venues/{venueId}/ratings` - 获取场地评分
- `POST /api/venues/{venueId}/reviews` - 评价场地
- `GET /api/venues/{venueId}/reviews` - 获取场地评价
- `GET /api/venues/filter` - 高级筛选场地
- `PUT /api/venues/{venueId}/facilities` - 更新场地设施信息
- `PUT /api/venues/{venueId}/openingHours` - 更新场地营业时间

### 2. 内容富媒体 API

- `POST /api/upload/videos` - 上传视频
- `GET /api/videos/{videoId}/status` - 获取视频处理状态
- `POST /api/posts/video` - 创建视频帖子
- `POST /api/upload/images/batch` - 批量上传图片

### 3. 搜索系统 API

- `GET /api/search` - 全站内容搜索
- `GET /api/search/suggestions` - 搜索建议
- `GET /api/users/me/searchHistory` - 获取搜索历史
- `DELETE /api/users/me/searchHistory` - 清除搜索历史

### 4. 数据统计 API

- `GET /api/admin/statistics/users` - 用户活跃度统计
- `GET /api/admin/statistics/venues` - 热门场地统计
- `GET /api/admin/statistics/content` - 内容热度分析
- `GET /api/admin/statistics/daily` - 每日数据报告

## V2.0 活动版 API

### 1. 活动系统 API

- `POST /api/events` - 创建活动
- `GET /api/events` - 获取活动列表
- `GET /api/events/{eventId}` - 获取活动详情
- `PUT /api/events/{eventId}` - 更新活动
- `DELETE /api/events/{eventId}` - 取消活动
- `POST /api/events/{eventId}/join` - 参加活动
- `DELETE /api/events/{eventId}/join` - 退出活动
- `GET /api/events/{eventId}/participants` - 获取参与者列表
- `GET /api/events/recommendations` - 获取推荐活动

### 2. 运动伙伴匹配 API

- `GET /api/partners/recommend` - 获取推荐伙伴
- `GET /api/partners/nearby` - 获取附近伙伴
- `POST /api/partners/invite/{userId}` - 邀请成为伙伴
- `PUT /api/partners/invite/{inviteId}/accept` - 接受伙伴邀请
- `PUT /api/partners/invite/{inviteId}/reject` - 拒绝伙伴邀请

### 3. 实时互动 API

- `GET /api/events/{eventId}/chat` - 获取活动聊天历史
- `WebSocket /api/ws/chat` - 聊天WebSocket连接
- `POST /api/events/{eventId}/updates` - 发布活动实况
- `GET /api/events/{eventId}/updates` - 获取活动实况

### 4. 社区管理 API

- `GET /api/community/rules` - 获取社区规则
- `GET /api/community/honors` - 获取荣誉榜
- `GET /api/users/me/achievements` - 获取用户成就
- `POST /api/admin/community/rewards` - 发放用户奖励

## V2.1 数据版 API

### 1. AI推荐系统 API

- `GET /api/recommendations/venues` - 获取场地推荐
- `GET /api/recommendations/content` - 获取内容推荐
- `GET /api/recommendations/users` - 获取用户推荐
- `POST /api/recommendations/feedback` - 提交推荐反馈

### 2. 运动数据 API

- `POST /api/sports/records` - 记录运动数据
- `GET /api/sports/records` - 获取运动记录
- `GET /api/sports/statistics` - 获取运动统计
- `GET /api/sports/achievements` - 获取运动成就
- `GET /api/sports/visualization` - 获取数据可视化

## 安全与性能考虑

### 安全措施

1. 所有API使用HTTPS加密传输
2. 敏感API需要额外的权限验证
3. 实施速率限制防止滥用
4. 文件上传需要进行类型和大小验证
5. 实施CSRF和XSS防护

### 性能优化

1. 关键API实施缓存策略
2. 列表类API支持分页和按需加载
3. 图片和视频使用CDN加速
4. 大型数据传输支持压缩
5. 批量操作API减少请求次数

## 附录：API状态码说明

| 状态码 | 描述           |
| ------ | -------------- |
| 200    | 成功           |
| 201    | 创建成功       |
| 400    | 请求参数错误   |
| 401    | 未授权/未登录  |
| 403    | 权限不足       |
| 404    | 资源不存在     |
| 409    | 资源冲突       |
| 429    | 请求过于频繁   |
| 500    | 服务器内部错误 |
