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

  - 请求参数:
    ```json
    {
      "email": "string", // 用户邮箱，必填，唯一
      "password": "string", // 用户密码，必填，长度8-20位
      "nickname": "string" // 用户昵称，必填，2-50字符
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1, // 用户ID
        "email": "zhang.wei@example.com", // 用户邮箱
        "nickname": "张伟", // 用户昵称
        "token": "eyJhbGciOiJ..." // JWT访问令牌
      },
      "message": "注册成功"
    }
    ```

- `POST /api/auth/login` - 用户登录

  - 请求参数:
    ```json
    {
      "email": "string", // 用户邮箱，必填
      "password": "string" // 用户密码，必填
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1, // 用户ID
        "email": "zhang.wei@example.com", // 用户邮箱
        "nickname": "张伟", // 用户昵称
        "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg", // 头像URL
        "token": "eyJhbGciOiJ..." // JWT访问令牌
      },
      "message": "登录成功"
    }
    ```

- `POST /api/auth/logout` - 用户登出

  - 请求参数: 无 (通过Authorization头提供令牌)
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "登出成功"
    }
    ```

- `POST /api/auth/password/forgot` - 忘记密码

  - 请求参数:
    ```json
    {
      "email": "string" // 用户邮箱，必填
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "重置密码链接已发送到您的邮箱"
    }
    ```

- `POST /api/auth/password/reset` - 重置密码

  - 请求参数:
    ```json
    {
      "token": "string", // 重置密码令牌，必填
      "newPassword": "string" // 新密码，必填，长度8-20位
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "密码重置成功"
    }
    ```

- `POST /api/auth/verify` - 验证邮箱
  - 请求参数:
    ```json
    {
      "token": "string" // 邮箱验证令牌，必填
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "邮箱验证成功"
    }
    ```

#### 1.2 用户信息API

- `GET /api/users/me` - 获取当前用户信息

  - 请求参数: 无 (通过Authorization头提供令牌)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "email": "zhang.wei@example.com",
        "nickname": "张伟",
        "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg",
        "bio": "热爱篮球和跑步的IT工程师",
        "gender": "男",
        "location": "北京市朝阳区",
        "last_login": "2023-06-12 08:30:00",
        "created_at": "2023-05-20 14:25:30"
      },
      "message": "获取用户信息成功"
    }
    ```

- `PUT /api/users/me` - 更新用户个人信息

  - 请求参数:
    ```json
    {
      "nickname": "string", // 用户昵称，选填，2-50字符
      "bio": "string", // 个人简介，选填
      "gender": "string", // 性别，选填
      "location": "string" // 所在地区，选填
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "nickname": "张伟",
        "bio": "热爱篮球和跑步的IT工程师，同时也是一名摄影爱好者",
        "gender": "男",
        "location": "北京市朝阳区"
      },
      "message": "用户信息更新成功"
    }
    ```

- `POST /api/users/avatar` - 上传/更新头像

  - 请求参数:
    ```json
    {
      "avatarUrl": "string" // 头像URL，必填，通常先通过图片上传接口获取
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "avatar_url": "https://cdn.sportsapp.com/avatars/user1_new.jpg"
      },
      "message": "头像更新成功"
    }
    ```

- `GET /api/users/{userId}` - 获取指定用户公开信息
  - 请求参数:
    - 路径参数: userId (用户ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "nickname": "张伟",
        "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg",
        "bio": "热爱篮球和跑步的IT工程师",
        "gender": "男",
        "location": "北京市朝阳区"
      },
      "message": "获取用户信息成功"
    }
    ```

### 2. 运动类别 API

- `GET /api/categories` - 获取所有运动类别

  - 请求参数: 无
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "name": "登山",
          "description": "包括远足、徒步、登山等户外爬山活动",
          "icon_url": "https://cdn.sportsapp.com/icons/cat_hiking.png"
        },
        {
          "id": 2,
          "name": "羽毛球",
          "description": "室内羽毛球运动及相关活动",
          "icon_url": "https://cdn.sportsapp.com/icons/cat_badminton.png"
        },
        {
          "id": 3,
          "name": "足球",
          "description": "包括五人制、七人制、十一人制等足球活动",
          "icon_url": "https://cdn.sportsapp.com/icons/cat_football.png"
        }
      ],
      "message": "获取运动类别成功"
    }
    ```

- `POST /api/users/me/categories` - 关注运动类别

  - 请求参数:
    ```json
    {
      "category_id": 1 // 类别ID，必填
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "关注类别成功"
    }
    ```

- `DELETE /api/users/me/categories/{categoryId}` - 取消关注运动类别

  - 请求参数:
    - 路径参数: categoryId (类别ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "取消关注类别成功"
    }
    ```

- `GET /api/users/me/categories` - 获取用户关注的类别
  - 请求参数: 无 (通过Authorization头提供令牌)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "name": "登山",
          "description": "包括远足、徒步、登山等户外爬山活动",
          "icon_url": "https://cdn.sportsapp.com/icons/cat_hiking.png"
        },
        {
          "id": 3,
          "name": "足球",
          "description": "包括五人制、七人制、十一人制等足球活动",
          "icon_url": "https://cdn.sportsapp.com/icons/cat_football.png"
        }
      ],
      "message": "获取关注类别成功"
    }
    ```

### 3. 帖子系统 API

- `POST /api/posts` - 创建帖子

  - 请求参数:
    ```json
    {
      "title": "string", // 帖子标题，必填，最长100字符
      "content": "string", // 帖子内容，必填
      "category_id": 1, // 运动类别ID，选填
      "type": "normal", // 帖子类型，可选值：normal, event, question，默认normal
      "location": "北京市海淀区香山", // 地理位置文字描述，选填
      "coordinates": {
        // 地理位置坐标，必填
        "longitude": 116.195053, // 经度
        "latitude": 40.056942 // 纬度
      },
      "images": [
        // 帖子图片，选填
        {
          "image_url": "https://cdn.sportsapp.com/posts/post1_img1.jpg",
          "sequence_number": 1
        },
        {
          "image_url": "https://cdn.sportsapp.com/posts/post1_img2.jpg",
          "sequence_number": 2
        }
      ]
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1 // 创建的帖子ID
      },
      "message": "帖子创建成功"
    }
    ```

- `GET /api/posts` - 获取帖子列表(支持分页和过滤)

  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认10
      - category_id: 类别ID，可选
      - user_id: 用户ID，可选
      - type: 帖子类型，可选
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "user_id": 1,
          "category_id": 1,
          "title": "周末爬山活动召集",
          "content": "本周末组织爬山活动，有兴趣的朋友可以报名参加，我们将一起去香山，感受初夏的气息。",
          "type": "event",
          "location": "北京市海淀区香山",
          "coordinates": {
            "longitude": 116.195053,
            "latitude": 40.056942
          },
          "is_approved": 1,
          "likes_count": 15,
          "comments_count": 8,
          "created_at": "2023-06-10 09:30:00",
          "updated_at": "2023-06-10 10:15:00",
          "user": {
            "id": 1,
            "nickname": "张伟",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
          },
          "images": [
            {
              "id": 1,
              "image_url": "https://cdn.sportsapp.com/posts/post1_img1.jpg",
              "sequence_number": 1
            },
            {
              "id": 2,
              "image_url": "https://cdn.sportsapp.com/posts/post1_img2.jpg",
              "sequence_number": 2
            }
          ]
        }
        // ... 更多帖子
      ],
      "pagination": {
        "total": 100, // 总记录数
        "page": 1, // 当前页码
        "limit": 10, // 每页条数
        "pages": 10 // 总页数
      },
      "message": "获取帖子列表成功"
    }
    ```

- `GET /api/posts/{postId}` - 获取帖子详情

  - 请求参数:
    - 路径参数: postId (帖子ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "user_id": 1,
        "category_id": 1,
        "title": "周末爬山活动召集",
        "content": "本周末组织爬山活动，有兴趣的朋友可以报名参加，我们将一起去香山，感受初夏的气息。",
        "type": "event",
        "location": "北京市海淀区香山",
        "coordinates": {
          "longitude": 116.195053,
          "latitude": 40.056942
        },
        "is_approved": 1,
        "likes_count": 15,
        "comments_count": 8,
        "created_at": "2023-06-10 09:30:00",
        "updated_at": "2023-06-10 10:15:00",
        "user": {
          "id": 1,
          "nickname": "张伟",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
        },
        "images": [
          {
            "id": 1,
            "image_url": "https://cdn.sportsapp.com/posts/post1_img1.jpg",
            "sequence_number": 1
          },
          {
            "id": 2,
            "image_url": "https://cdn.sportsapp.com/posts/post1_img2.jpg",
            "sequence_number": 2
          }
        ],
        "comments": [
          {
            "id": 1,
            "user_id": 2,
            "content": "我非常感兴趣！请问具体几点集合？",
            "likes_count": 3,
            "created_at": "2023-06-10 10:30:00",
            "user": {
              "id": 2,
              "nickname": "李娜",
              "avatar_url": "https://cdn.sportsapp.com/avatars/user2.jpg"
            }
          }
          // ... 更多评论
        ]
      },
      "message": "获取帖子详情成功"
    }
    ```

- `PUT /api/posts/{postId}` - 更新帖子

  - 请求参数:
    - 路径参数: postId (帖子ID)
    - 请求体:
      ```json
      {
        "title": "string", // 帖子标题，选填
        "content": "string", // 帖子内容，选填
        "category_id": 1, // 运动类别ID，选填
        "type": "event", // 帖子类型，选填
        "location": "string", // 地理位置文字描述，选填
        "coordinates": {
          // 地理位置坐标，选填
          "longitude": 116.195053,
          "latitude": 40.056942
        },
        "images": [
          // 帖子图片，选填，如果提供会替换现有图片
          {
            "image_url": "string",
            "sequence_number": 1
          }
        ]
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "帖子更新成功"
    }
    ```

- `DELETE /api/posts/{postId}` - 删除帖子

  - 请求参数:
    - 路径参数: postId (帖子ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "帖子删除成功"
    }
    ```

- `POST /api/posts/{postId}/likes` - 点赞帖子

  - 请求参数:
    - 路径参数: postId (帖子ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "likes_count": 16 // 更新后的点赞数
      },
      "message": "点赞成功"
    }
    ```

- `DELETE /api/posts/{postId}/likes` - 取消点赞

  - 请求参数:
    - 路径参数: postId (帖子ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "likes_count": 15 // 更新后的点赞数
      },
      "message": "取消点赞成功"
    }
    ```

- `POST /api/posts/{postId}/comments` - 评论帖子

  - 请求参数:
    - 路径参数: postId (帖子ID)
    - 请求体:
      ```json
      {
        "content": "string" // 评论内容，必填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 9, // 评论ID
        "user_id": 3,
        "content": "我也要参加！",
        "created_at": "2023-06-11 14:30:00",
        "user": {
          "id": 3,
          "nickname": "王飞",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user3.jpg"
        }
      },
      "message": "评论成功"
    }
    ```

- `GET /api/posts/{postId}/comments` - 获取帖子评论

  - 请求参数:
    - 路径参数: postId (帖子ID)
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "user_id": 2,
          "content": "我非常感兴趣！请问具体几点集合？",
          "likes_count": 3,
          "created_at": "2023-06-10 10:30:00",
          "user": {
            "id": 2,
            "nickname": "李娜",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user2.jpg"
          }
        }
        // ... 更多评论
      ],
      "pagination": {
        "total": 8, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 1 // 总页数
      },
      "message": "获取评论成功"
    }
    ```

- `POST /api/upload/images` - 上传帖子图片
  - 请求参数:
    - Content-Type: multipart/form-data
    - 表单字段:
      - image: 图片文件，支持jpg、png、gif格式，大小限制5MB
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "image_url": "https://cdn.sportsapp.com/posts/user1_159087654.jpg"
      },
      "message": "图片上传成功"
    }
    ```

### 4. 场地分享 API

- `POST /api/venues` - 创建场地信息

  - 请求参数:
    ```json
    {
      "name": "string", // 场地名称，必填，最长100字符
      "description": "string", // 场地描述，必填
      "category_id": 1, // 场地运动类别ID，必填
      "address": "string", // 详细地址，必填
      "phone": "string", // 联系电话，选填
      "opening_hours": "string", // 营业时间，选填
      "facilities": ["WiFi", "停车场", "淋浴间"], // 设施列表，选填
      "price_description": "string", // 价格描述，选填
      "coordinates": {
        // 地理位置坐标，必填
        "longitude": 116.195053,
        "latitude": 40.056942
      },
      "images": [
        // 场地图片，选填
        {
          "image_url": "https://cdn.sportsapp.com/venues/venue1_img1.jpg",
          "sequence_number": 1
        }
      ]
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1 // 创建的场地ID
      },
      "message": "场地信息创建成功"
    }
    ```

- `GET /api/venues` - 获取场地列表(支持分页和过滤)

  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认10
      - category_id: 类别ID，可选
      - keyword: 搜索关键词，可选，搜索场地名称和描述
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "name": "香山运动公园",
          "description": "位于香山脚下的综合运动场地，设有篮球场、网球场和健身区。",
          "category_id": 1,
          "address": "北京市海淀区香山公园南门附近",
          "phone": "010-62345678",
          "opening_hours": "6:00-22:00",
          "facilities": ["停车场", "淋浴间", "公共卫生间"],
          "price_description": "篮球场：30元/小时，网球场：50元/小时，健身区免费",
          "coordinates": {
            "longitude": 116.195053,
            "latitude": 40.056942
          },
          "avg_rating": 4.5, // 平均评分
          "ratings_count": 25, // 评分数量
          "created_at": "2023-05-15 14:30:00",
          "user": {
            "id": 1,
            "nickname": "张伟",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
          },
          "main_image": "https://cdn.sportsapp.com/venues/venue1_img1.jpg"
        }
        // ... 更多场地
      ],
      "pagination": {
        "total": 60, // 总记录数
        "page": 1, // 当前页码
        "limit": 10, // 每页条数
        "pages": 6 // 总页数
      },
      "message": "获取场地列表成功"
    }
    ```

- `GET /api/venues/{venueId}` - 获取场地详情

  - 请求参数:
    - 路径参数: venueId (场地ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "name": "香山运动公园",
        "description": "位于香山脚下的综合运动场地，设有篮球场、网球场和健身区。",
        "category_id": 1,
        "address": "北京市海淀区香山公园南门附近",
        "phone": "010-62345678",
        "opening_hours": "6:00-22:00",
        "facilities": ["停车场", "淋浴间", "公共卫生间"],
        "price_description": "篮球场：30元/小时，网球场：50元/小时，健身区免费",
        "coordinates": {
          "longitude": 116.195053,
          "latitude": 40.056942
        },
        "avg_rating": 4.5,
        "ratings_count": 25,
        "created_at": "2023-05-15 14:30:00",
        "updated_at": "2023-05-16 10:45:00",
        "user": {
          "id": 1,
          "nickname": "张伟",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
        },
        "images": [
          {
            "id": 1,
            "image_url": "https://cdn.sportsapp.com/venues/venue1_img1.jpg",
            "sequence_number": 1
          },
          {
            "id": 2,
            "image_url": "https://cdn.sportsapp.com/venues/venue1_img2.jpg",
            "sequence_number": 2
          }
        ]
      },
      "message": "获取场地详情成功"
    }
    ```

- `PUT /api/venues/{venueId}` - 更新场地信息

  - 请求参数:
    - 路径参数: venueId (场地ID)
    - 请求体:
      ```json
      {
        "name": "string", // 场地名称，选填
        "description": "string", // 场地描述，选填
        "category_id": 1, // 场地运动类别ID，选填
        "address": "string", // 详细地址，选填
        "phone": "string", // 联系电话，选填
        "opening_hours": "string", // 营业时间，选填
        "facilities": ["string"], // 设施列表，选填
        "price_description": "string", // 价格描述，选填
        "coordinates": {
          // 地理位置坐标，选填
          "longitude": 116.195053,
          "latitude": 40.056942
        },
        "images": [
          // 场地图片，选填，如果提供会替换现有图片
          {
            "image_url": "string",
            "sequence_number": 1
          }
        ]
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "场地信息更新成功"
    }
    ```

- `DELETE /api/venues/{venueId}` - 删除场地信息

  - 请求参数:
    - 路径参数: venueId (场地ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "场地信息删除成功"
    }
    ```

- `GET /api/venues/nearby` - 获取附近场地(基于地理位置)
  - 请求参数:
    - 查询参数:
      - longitude: 经度，必填
      - latitude: 纬度，必填
      - radius: 搜索半径，单位公里，默认5
      - category_id: 类别ID，可选
      - page: 页码，默认1
      - limit: 每页条数，默认10
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "name": "香山运动公园",
          "category_id": 1,
          "address": "北京市海淀区香山公园南门附近",
          "coordinates": {
            "longitude": 116.195053,
            "latitude": 40.056942
          },
          "distance": 1.2, // 距离当前位置的距离，单位公里
          "avg_rating": 4.5,
          "main_image": "https://cdn.sportsapp.com/venues/venue1_img1.jpg"
        }
        // ... 更多场地
      ],
      "pagination": {
        "total": 8, // 总记录数
        "page": 1, // 当前页码
        "limit": 10, // 每页条数
        "pages": 1 // 总页数
      },
      "message": "获取附近场地成功"
    }
    ```

### 5. 管理后台 API

- `GET /api/admin/users` - 获取用户列表

  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
      - keyword: 搜索关键词，可选，搜索用户昵称、邮箱
      - status: 用户状态，可选值：all, active, inactive，默认all
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "email": "zhang.wei@example.com",
          "nickname": "张伟",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg",
          "is_active": 1,
          "posts_count": 12, // 发帖数
          "last_login": "2023-06-12 08:30:00",
          "created_at": "2023-05-20 14:25:30"
        }
        // ... 更多用户
      ],
      "pagination": {
        "total": 120, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 6 // 总页数
      },
      "message": "获取用户列表成功"
    }
    ```

- `PUT /api/admin/users/{userId}/status` - 更改用户状态(禁用/启用)

  - 请求参数:
    - 路径参数: userId (用户ID)
    - 请求体:
      ```json
      {
        "is_active": 0, // 用户状态，1为启用，0为禁用
        "reason": "string" // 禁用原因，当is_active为0时必填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "用户状态更新成功"
    }
    ```

- `GET /api/admin/posts/pending` - 获取待审核帖子

  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 10,
          "user_id": 5,
          "category_id": 2,
          "title": "羽毛球拍推广",
          "content": "某品牌羽毛球拍优惠活动...",
          "type": "normal",
          "location": "上海市",
          "created_at": "2023-06-11 13:45:00",
          "user": {
            "id": 5,
            "nickname": "赵敏",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user5.jpg"
          }
        }
        // ... 更多待审核帖子
      ],
      "pagination": {
        "total": 5, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 1 // 总页数
      },
      "message": "获取待审核帖子成功"
    }
    ```

- `PUT /api/admin/posts/{postId}/status` - 审核帖子

  - 请求参数:
    - 路径参数: postId (帖子ID)
    - 请求体:
      ```json
      {
        "is_approved": 1, // 审核状态，1为通过，0为拒绝
        "reason": "string" // 拒绝原因，当is_approved为0时必填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "帖子审核成功"
    }
    ```

- `GET /api/admin/venues/pending` - 获取待审核场地

  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 5,
          "name": "某品牌健身中心",
          "description": "全新健身中心，配备高端器材...",
          "category_id": 4,
          "address": "深圳市南山区科技园",
          "created_at": "2023-06-10 16:20:00",
          "user": {
            "id": 4,
            "nickname": "陈杰",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user4.jpg"
          }
        }
        // ... 更多待审核场地
      ],
      "pagination": {
        "total": 3, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 1 // 总页数
      },
      "message": "获取待审核场地成功"
    }
    ```

- `PUT /api/admin/venues/{venueId}/status` - 审核场地
  - 请求参数:
    - 路径参数: venueId (场地ID)
    - 请求体:
      ```json
      {
        "is_approved": 1, // 审核状态，1为通过，0为拒绝
        "reason": "string" // 拒绝原因，当is_approved为0时必填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "场地审核成功"
    }
    ```

## V1.1 社交版 API

### 1. 用户系统升级 API

- `GET /api/users/me/points` - 获取用户积分

  - 请求参数: 无 (通过Authorization头提供令牌)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "total_points": 320, // 当前积分
        "level": 3, // 当前等级
        "next_level": 4, // 下一等级
        "points_needed": 80, // 距离下一等级所需积分
        "points_records": [
          {
            "id": 12,
            "points": 10,
            "action": "daily_check",
            "description": "每日签到",
            "created_at": "2023-06-12 08:30:00"
          },
          {
            "id": 11,
            "points": 20,
            "action": "post_like",
            "description": "帖子获得10个赞",
            "created_at": "2023-06-11 15:45:00"
          }
          // 最近的积分记录
        ]
      },
      "message": "获取积分信息成功"
    }
    ```

- `GET /api/users/me/level` - 获取用户等级

  - 请求参数: 无 (通过Authorization头提供令牌)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "current_level": {
          "level": 3,
          "name": "运动达人",
          "icon_url": "https://cdn.sportsapp.com/levels/level3.png",
          "required_points": 300
        },
        "next_level": {
          "level": 4,
          "name": "运动专家",
          "icon_url": "https://cdn.sportsapp.com/levels/level4.png",
          "required_points": 400
        },
        "progress": 0.2, // 当前等级到下一等级的进度(0-1)
        "points": 320,
        "points_needed": 80
      },
      "message": "获取等级信息成功"
    }
    ```

- `POST /api/users/me/dailyCheck` - 用户每日签到

  - 请求参数: 无 (通过Authorization头提供令牌)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "points": 10, // 获得的积分
        "consecutive_days": 3, // 连续签到天数
        "today_signed": true, // 今日是否已签到
        "total_points": 330 // 更新后的总积分
      },
      "message": "签到成功，获得10积分"
    }
    ```

- `POST /api/users/follow/{userId}` - 关注用户

  - 请求参数:
    - 路径参数: userId (要关注的用户ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "following_count": 15, // 更新后的关注数
        "user": {
          "id": 2,
          "nickname": "李娜",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user2.jpg"
        }
      },
      "message": "关注成功"
    }
    ```

- `DELETE /api/users/follow/{userId}` - 取消关注

  - 请求参数:
    - 路径参数: userId (要取消关注的用户ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "following_count": 14 // 更新后的关注数
      },
      "message": "取消关注成功"
    }
    ```

- `GET /api/users/me/followers` - 获取粉丝列表

  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "total": 28, // 总粉丝数
        "followers": [
          {
            "id": 3,
            "nickname": "王飞",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user3.jpg",
            "bio": "足球教练，专注青少年足球培训",
            "is_following": true, // 当前用户是否已关注此粉丝(互相关注)
            "followed_at": "2023-06-10 14:30:00" // 关注时间
          }
          // ... 更多粉丝
        ]
      },
      "pagination": {
        "total": 28, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 2 // 总页数
      },
      "message": "获取粉丝列表成功"
    }
    ```

- `GET /api/users/me/following` - 获取关注列表
  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "total": 14, // 总关注数
        "following": [
          {
            "id": 5,
            "nickname": "赵敏",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user5.jpg",
            "bio": "瑜伽教练，提供专业瑜伽指导",
            "is_follower": true, // 该用户是否关注了当前用户(互相关注)
            "followed_at": "2023-06-11 09:15:00" // 关注时间
          }
          // ... 更多关注的用户
        ]
      },
      "pagination": {
        "total": 14, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 1 // 总页数
      },
      "message": "获取关注列表成功"
    }
    ```

### 2. 帖子系统增强 API

- `POST /api/posts/question` - 创建问答帖子

  - 请求参数:
    ```json
    {
      "title": "string", // 问题标题，必填，最长100字符
      "content": "string", // 问题内容，必填
      "category_id": 1, // 运动类别ID，选填
      "coordinates": {
        // 地理位置坐标，必填
        "longitude": 116.195053,
        "latitude": 40.056942
      },
      "location": "string", // 地理位置文字描述，选填
      "images": [
        // 图片，选填
        {
          "image_url": "string",
          "sequence_number": 1
        }
      ],
      "reward_points": 10 // 悬赏积分，选填，默认0
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 20, // 创建的帖子ID
        "type": "question" // 帖子类型
      },
      "message": "问答帖子创建成功"
    }
    ```

- `POST /api/posts/experience` - 创建经验分享帖子

  - 请求参数:
    ```json
    {
      "title": "string", // 标题，必填，最长100字符
      "content": "string", // 内容，必填
      "category_id": 1, // 运动类别ID，必填
      "coordinates": {
        // 地理位置坐标，必填
        "longitude": 116.195053,
        "latitude": 40.056942
      },
      "location": "string", // 地理位置文字描述，选填
      "images": [
        // 图片，选填
        {
          "image_url": "string",
          "sequence_number": 1
        }
      ],
      "difficulty_level": "medium", // 难度级别，可选值：easy, medium, hard，选填
      "duration": 120, // 活动时长(分钟)，选填
      "equipment": ["string"] // 所需装备列表，选填
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 21, // 创建的帖子ID
        "type": "experience" // 帖子类型
      },
      "message": "经验分享帖子创建成功"
    }
    ```

- `POST /api/posts/{postId}/favorite` - 收藏帖子

  - 请求参数:
    - 路径参数: postId (帖子ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "favorites_count": 8 // 帖子总收藏数
      },
      "message": "收藏成功"
    }
    ```

- `DELETE /api/posts/{postId}/favorite` - 取消收藏

  - 请求参数:
    - 路径参数: postId (帖子ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "favorites_count": 7 // 帖子总收藏数
      },
      "message": "取消收藏成功"
    }
    ```

- `GET /api/users/me/favorites` - 获取收藏列表

  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认10
      - category_id: 类别ID，可选
      - type: 帖子类型，可选
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 4,
          "user_id": 1,
          "category_id": 1,
          "title": "徒步穿越贡嘎攻略",
          "content": "上个月完成了贡嘎山穿越，分享一下路线规划和装备准备经验...",
          "type": "experience",
          "favorites_count": 32,
          "likes_count": 45,
          "comments_count": 15,
          "created_at": "2023-05-20 10:15:00",
          "favorited_at": "2023-06-01 09:30:00", // 收藏时间
          "user": {
            "id": 4,
            "nickname": "陈杰",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user4.jpg"
          },
          "main_image": "https://cdn.sportsapp.com/posts/post4_img1.jpg"
        }
        // ... 更多收藏的帖子
      ],
      "pagination": {
        "total": 18, // 总记录数
        "page": 1, // 当前页码
        "limit": 10, // 每页条数
        "pages": 2 // 总页数
      },
      "message": "获取收藏列表成功"
    }
    ```

- `POST /api/posts/{postId}/share` - 分享统计

  - 请求参数:
    - 路径参数: postId (帖子ID)
    - 请求体:
      ```json
      {
        "platform": "string" // 分享平台，可选值：wechat, weibo, qq, etc.
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "shares_count": 12 // 帖子总分享数
      },
      "message": "分享记录成功"
    }
    ```

- `GET /api/users/mention/suggest` - 获取@用户建议
  - 请求参数:
    - 查询参数:
      - keyword: 搜索关键词，必填，用户昵称的部分字符
      - limit: 返回数量，默认5
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 5,
          "nickname": "赵敏",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user5.jpg",
          "is_following": true // 是否已关注
        },
        {
          "id": 10,
          "nickname": "赵云",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user10.jpg",
          "is_following": false
        }
        // ... 更多匹配用户
      ],
      "message": "获取用户建议成功"
    }
    ```

### 3. 评论系统增强 API

- `PUT /api/comments/{commentId}` - 更新评论内容

  - 请求参数:
    - 路径参数: commentId (评论ID)
    - 请求体:
      ```json
      {
        "content": "string" // 更新后的评论内容，必填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "content": "我非常感兴趣！请问具体几点集合？有可能和朋友一起参加。",
        "updated_at": "2023-06-10 11:15:00"
      },
      "message": "评论更新成功"
    }
    ```

- `DELETE /api/comments/{commentId}` - 删除评论

  - 请求参数:
    - 路径参数: commentId (评论ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "评论删除成功"
    }
    ```

- `POST /api/comments/{commentId}/likes` - 点赞评论

  - 请求参数:
    - 路径参数: commentId (评论ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "likes_count": 4 // 更新后的评论点赞数
      },
      "message": "评论点赞成功"
    }
    ```

- `DELETE /api/comments/{commentId}/likes` - 取消评论点赞

  - 请求参数:
    - 路径参数: commentId (评论ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "likes_count": 3 // 更新后的评论点赞数
      },
      "message": "取消评论点赞成功"
    }
    ```

- `POST /api/comments/{commentId}/reply` - 回复评论

  - 请求参数:
    - 路径参数: commentId (评论ID)
    - 请求体:
      ```json
      {
        "content": "string" // 回复内容，必填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 12, // 回复评论ID
        "parent_id": 1, // 父评论ID
        "post_id": 1, // 帖子ID
        "user_id": 1,
        "content": "计划上午9点在香山南门集合",
        "created_at": "2023-06-10 11:30:00",
        "user": {
          "id": 1,
          "nickname": "张伟",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
        }
      },
      "message": "回复评论成功"
    }
    ```

- `GET /api/comments/{commentId}/replies` - 获取评论回复

  - 请求参数:
    - 路径参数: commentId (评论ID)
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认10
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 12,
          "parent_id": 1,
          "post_id": 1,
          "user_id": 1,
          "content": "计划上午9点在香山南门集合",
          "likes_count": 2,
          "created_at": "2023-06-10 11:30:00",
          "user": {
            "id": 1,
            "nickname": "张伟",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
          }
        },
        {
          "id": 15,
          "parent_id": 1,
          "post_id": 1,
          "user_id": 2,
          "content": "好的，谢谢！我会准时到的",
          "likes_count": 1,
          "created_at": "2023-06-10 12:15:00",
          "user": {
            "id": 2,
            "nickname": "李娜",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user2.jpg"
          }
        }
        // ... 更多回复
      ],
      "pagination": {
        "total": 5, // 总记录数
        "page": 1, // 当前页码
        "limit": 10, // 每页条数
        "pages": 1 // 总页数
      },
      "message": "获取评论回复成功"
    }
    ```

- `GET /api/users/me/comments` - 获取用户发表的所有评论

  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 12,
          "post_id": 1,
          "content": "计划上午9点在香山南门集合",
          "likes_count": 2,
          "created_at": "2023-06-10 11:30:00",
          "post": {
            "id": 1,
            "title": "周末爬山活动召集",
            "user": {
              "id": 1,
              "nickname": "张伟",
              "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
            }
          }
        }
        // ... 更多评论
      ],
      "pagination": {
        "total": 28, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 2 // 总页数
      },
      "message": "获取用户评论成功"
    }
    ```

- `GET /api/users/me/comment-likes` - 获取用户点赞的评论
  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 15,
          "post_id": 1,
          "user_id": 2,
          "content": "好的，谢谢！我会准时到的",
          "likes_count": 1,
          "created_at": "2023-06-10 12:15:00",
          "liked_at": "2023-06-10 14:20:00", // 点赞时间
          "user": {
            "id": 2,
            "nickname": "李娜",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user2.jpg"
          },
          "post": {
            "id": 1,
            "title": "周末爬山活动召集"
          }
        }
        // ... 更多点赞的评论
      ],
      "pagination": {
        "total": 15, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 1 // 总页数
      },
      "message": "获取点赞评论成功"
    }
    ```

### 4. 消息通知中心 API

- `GET /api/notifications` - 获取通知列表

  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
      - type: 通知类型，可选值：all, like, comment, follow, system，默认all
      - is_read: 是否已读，可选值：all, read, unread，默认all
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "unread_count": 3, // 未读通知数
        "notifications": [
          {
            "id": 45,
            "type": "like",
            "is_read": 0,
            "title": "帖子获得点赞",
            "content": "李娜点赞了你的帖子《周末爬山活动召集》",
            "sender": {
              "id": 2,
              "nickname": "李娜",
              "avatar_url": "https://cdn.sportsapp.com/avatars/user2.jpg"
            },
            "target": {
              "type": "post",
              "id": 1,
              "title": "周末爬山活动召集"
            },
            "created_at": "2023-06-11 10:30:00"
          },
          {
            "id": 44,
            "type": "follow",
            "is_read": 1,
            "title": "新粉丝",
            "content": "王飞关注了你",
            "sender": {
              "id": 3,
              "nickname": "王飞",
              "avatar_url": "https://cdn.sportsapp.com/avatars/user3.jpg"
            },
            "target": {
              "type": "user",
              "id": 3
            },
            "created_at": "2023-06-10 16:45:00"
          }
          // ... 更多通知
        ]
      },
      "pagination": {
        "total": 45, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 3 // 总页数
      },
      "message": "获取通知列表成功"
    }
    ```

- `PUT /api/notifications/{notificationId}/read` - 标记通知为已读

  - 请求参数:
    - 路径参数: notificationId (通知ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "标记通知已读成功"
    }
    ```

- `PUT /api/notifications/readAll` - 标记所有通知为已读

  - 请求参数: 无
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "affected_count": 3 // 标记为已读的通知数量
      },
      "message": "标记所有通知已读成功"
    }
    ```

- `GET /api/notifications/settings` - 获取通知设置

  - 请求参数: 无
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "like": true, // 是否接收点赞通知
        "comment": true, // 是否接收评论通知
        "follow": true, // 是否接收关注通知
        "system": true, // 是否接收系统通知
        "push_enabled": true, // 是否启用推送
        "email_enabled": false // 是否启用邮件通知
      },
      "message": "获取通知设置成功"
    }
    ```

- `PUT /api/notifications/settings` - 更新通知设置
  - 请求参数:
    ```json
    {
      "like": true, // 是否接收点赞通知，选填
      "comment": true, // 是否接收评论通知，选填
      "follow": true, // 是否接收关注通知，选填
      "system": true, // 是否接收系统通知，选填
      "push_enabled": true, // 是否启用推送，选填
      "email_enabled": false // 是否启用邮件通知，选填
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "更新通知设置成功"
    }
    ```

### 5. 违规举报 API

- `POST /api/reports/post/{postId}` - 举报帖子

  - 请求参数:
    - 路径参数: postId (帖子ID)
    - 请求体:
      ```json
      {
        "reason_type": "string", // 举报原因类型，必填，可选值：spam, inappropriate, violation, copyright, other
        "description": "string" // 详细描述，当reason_type为other时必填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "举报提交成功，我们会尽快处理"
    }
    ```

- `POST /api/reports/comment/{commentId}` - 举报评论

  - 请求参数:
    - 路径参数: commentId (评论ID)
    - 请求体:
      ```json
      {
        "reason_type": "string", // 举报原因类型，必填，可选值：spam, inappropriate, violation, copyright, other
        "description": "string" // 详细描述，当reason_type为other时必填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "举报提交成功，我们会尽快处理"
    }
    ```

- `POST /api/reports/user/{userId}` - 举报用户

  - 请求参数:
    - 路径参数: userId (用户ID)
    - 请求体:
      ```json
      {
        "reason_type": "string", // 举报原因类型，必填，可选值：spam, harassment, impersonation, violation, other
        "description": "string" // 详细描述，当reason_type为other时必填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "举报提交成功，我们会尽快处理"
    }
    ```

- `GET /api/admin/reports` - 获取举报列表

  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
      - type: 举报类型，可选值：all, post, comment, user，默认all
      - status: 处理状态，可选值：all, pending, processed，默认all
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 5,
          "type": "post",
          "target_id": 10,
          "reason_type": "spam",
          "description": "广告内容",
          "status": "pending",
          "created_at": "2023-06-11 15:30:00",
          "reporter": {
            "id": 2,
            "nickname": "李娜"
          },
          "target": {
            "id": 10,
            "title": "羽毛球拍推广",
            "user_id": 5
          }
        }
        // ... 更多举报
      ],
      "pagination": {
        "total": 12, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 1 // 总页数
      },
      "message": "获取举报列表成功"
    }
    ```

- `PUT /api/admin/reports/{reportId}/handle` - 处理举报
  - 请求参数:
    - 路径参数: reportId (举报ID)
    - 请求体:
      ```json
      {
        "action": "string", // 处理行为，必填，可选值：ignore, warn, delete, ban
        "note": "string", // 处理备注，选填
        "notify_reporter": true // 是否通知举报人，选填，默认false
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "举报处理成功"
    }
    ```

## V1.2 增强版 API

### 1. 场地系统升级 API

- `POST /api/venues/{venueId}/ratings` - 评分场地
- `GET /api/venues/{venueId}/ratings` - 获取场地评分
- `POST /api/venues/{venueId}/reviews` - 评价场地
- `GET /api/venues/{venueId}/reviews` - 获取场地评价

### 2. 搜索系统 API

- `GET /api/search` - 全站内容搜索
- `GET /api/search/suggestions` - 搜索建议
- `GET /api/users/me/searchHistory` - 获取搜索历史
- `DELETE /api/users/me/searchHistory` - 清除搜索历史

### 3. 数据统计 API

- `GET /api/admin/statistics/users` - 用户活跃度统计
- `GET /api/admin/statistics/venues` - 热门场地统计
- `GET /api/admin/statistics/content` - 内容热度分析
- `GET /api/admin/statistics/daily` - 每日数据报告

## V2.0 活动版 API

### 1. 活动系统 API

- `POST /api/events` - 创建活动

  - 请求参数:
    ```json
    {
      "title": "string", // 活动标题，必填，最长100字符
      "content": "string", // 活动详细描述，必填
      "category_id": 1, // 运动类别ID，必填
      "venue_id": 1, // 场地ID，选填
      "location": "string", // 地理位置文字描述，必填
      "coordinates": {
        // 地理位置坐标，必填
        "longitude": 116.195053,
        "latitude": 40.056942
      },
      "start_time": "2023-06-15 09:00:00", // 活动开始时间，必填
      "end_time": "2023-06-15 12:00:00", // 活动结束时间，必填
      "max_participants": 20, // 最大参与人数，选填，默认不限制
      "min_participants": 5, // 最小参与人数，选填，默认1
      "registration_deadline": "2023-06-14 20:00:00", // 报名截止时间，选填
      "cost": 30, // 活动费用，选填，默认0（免费）
      "cost_description": "string", // 费用说明，选填
      "difficulty_level": "medium", // 难度级别，可选值：easy, medium, hard，选填
      "requirements": "string", // 参与要求，选填
      "images": [
        // 活动图片，选填
        {
          "image_url": "string",
          "sequence_number": 1
        }
      ],
      "tags": ["周末", "初学者友好"] // 活动标签，选填
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1, // 创建的活动ID
        "invitation_code": "EVENT1A2B3C" // 活动邀请码
      },
      "message": "活动创建成功"
    }
    ```

- `GET /api/events` - 获取活动列表

  - 请求参数:
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认10
      - category_id: 类别ID，可选
      - user_id: 用户ID，可选，获取某用户发起的活动
      - status: 活动状态，可选值：upcoming, ongoing, past, all，默认upcoming
      - keyword: 搜索关键词，可选
      - nearby: 是否只显示附近活动，可选值：0, 1，默认0
      - longitude: 经度，当nearby为1时必填
      - latitude: 纬度，当nearby为1时必填
      - radius: 搜索半径(km)，当nearby为1时选填，默认5
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "title": "周末香山徒步",
          "category_id": 1,
          "venue_id": 1,
          "location": "北京市海淀区香山公园南门集合",
          "coordinates": {
            "longitude": 116.195053,
            "latitude": 40.056942
          },
          "start_time": "2023-06-15 09:00:00",
          "end_time": "2023-06-15 12:00:00",
          "status": "upcoming", // upcoming, ongoing, past, canceled
          "participants_count": 8,
          "max_participants": 20,
          "cost": 30,
          "difficulty_level": "medium",
          "distance": 1.5, // 当nearby为1时返回，单位km
          "created_at": "2023-06-10 15:30:00",
          "organizer": {
            "id": 1,
            "nickname": "张伟",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
          },
          "main_image": "https://cdn.sportsapp.com/events/event1_img1.jpg",
          "venue": {
            "id": 1,
            "name": "香山运动公园"
          }
        }
        // ... 更多活动
      ],
      "pagination": {
        "total": 35, // 总记录数
        "page": 1, // 当前页码
        "limit": 10, // 每页条数
        "pages": 4 // 总页数
      },
      "message": "获取活动列表成功"
    }
    ```

- `GET /api/events/{eventId}` - 获取活动详情

  - 请求参数:
    - 路径参数: eventId (活动ID)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "title": "周末香山徒步",
        "content": "趁着周末，我们将一起去爬香山，感受初夏的气息。路线不会太难，适合初学者，全程大约5公里，预计3小时完成。",
        "category_id": 1,
        "venue_id": 1,
        "location": "北京市海淀区香山公园南门集合",
        "coordinates": {
          "longitude": 116.195053,
          "latitude": 40.056942
        },
        "start_time": "2023-06-15 09:00:00",
        "end_time": "2023-06-15 12:00:00",
        "status": "upcoming",
        "participants_count": 8,
        "max_participants": 20,
        "min_participants": 5,
        "registration_deadline": "2023-06-14 20:00:00",
        "cost": 30,
        "cost_description": "包含公园门票和小食",
        "difficulty_level": "medium",
        "requirements": "请穿舒适的运动鞋，带上水和防晒用品",
        "created_at": "2023-06-10 15:30:00",
        "updated_at": "2023-06-11 10:15:00",
        "organizer": {
          "id": 1,
          "nickname": "张伟",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg",
          "bio": "热爱篮球和跑步的IT工程师"
        },
        "images": [
          {
            "id": 1,
            "image_url": "https://cdn.sportsapp.com/events/event1_img1.jpg",
            "sequence_number": 1
          }
        ],
        "tags": ["周末", "初学者友好"],
        "venue": {
          "id": 1,
          "name": "香山运动公园",
          "address": "北京市海淀区香山公园南门附近"
        },
        "is_participant": false, // 当前用户是否已参加
        "can_join": true // 当前用户是否可以参加
      },
      "message": "获取活动详情成功"
    }
    ```

- `PUT /api/events/{eventId}` - 更新活动

  - 请求参数:
    - 路径参数: eventId (活动ID)
    - 请求体:
      ```json
      {
        "title": "string", // 活动标题，选填
        "content": "string", // 活动详细描述，选填
        "venue_id": 1, // 场地ID，选填
        "location": "string", // 地理位置文字描述，选填
        "coordinates": {
          // 地理位置坐标，选填
          "longitude": 116.195053,
          "latitude": 40.056942
        },
        "start_time": "2023-06-15 09:00:00", // 活动开始时间，选填
        "end_time": "2023-06-15 12:00:00", // 活动结束时间，选填
        "max_participants": 20, // 最大参与人数，选填
        "min_participants": 5, // 最小参与人数，选填
        "registration_deadline": "2023-06-14 20:00:00", // 报名截止时间，选填
        "cost": 30, // 活动费用，选填
        "cost_description": "string", // 费用说明，选填
        "difficulty_level": "medium", // 难度级别，选填
        "requirements": "string", // 参与要求，选填
        "images": [
          // 活动图片，选填，如提供会替换现有图片
          {
            "image_url": "string",
            "sequence_number": 1
          }
        ],
        "tags": ["string"] // 活动标签，选填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "活动更新成功"
    }
    ```

- `DELETE /api/events/{eventId}` - 取消活动

  - 请求参数:
    - 路径参数: eventId (活动ID)
    - 请求体:
      ```json
      {
        "reason": "string", // 取消原因，必填
        "notify_participants": true // 是否通知参与者，选填，默认true
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "活动取消成功"
    }
    ```

- `POST /api/events/{eventId}/join` - 参加活动

  - 请求参数:
    - 路径参数: eventId (活动ID)
    - 请求体:
      ```json
      {
        "note": "string", // 报名备注，选填
        "invitation_code": "string" // 邀请码，如活动设置了邀请码则必填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "participant_id": 25, // 参与记录ID
        "event": {
          "id": 1,
          "title": "周末香山徒步",
          "start_time": "2023-06-15 09:00:00",
          "participants_count": 9 // 更新后的参与人数
        }
      },
      "message": "成功报名参加活动"
    }
    ```

- `DELETE /api/events/{eventId}/join` - 退出活动

  - 请求参数:
    - 路径参数: eventId (活动ID)
    - 请求体:
      ```json
      {
        "reason": "string" // 退出原因，选填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "event": {
          "id": 1,
          "participants_count": 8 // 更新后的参与人数
        }
      },
      "message": "成功退出活动"
    }
    ```

- `GET /api/events/{eventId}/participants` - 获取参与者列表

  - 请求参数:
    - 路径参数: eventId (活动ID)
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 25, // 参与记录ID
          "user_id": 2,
          "status": "confirmed", // 参与状态：pending, confirmed, attended, absent
          "joined_at": "2023-06-11 16:25:00",
          "note": "期待与大家一起徒步",
          "user": {
            "id": 2,
            "nickname": "李娜",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user2.jpg",
            "bio": "羽毛球爱好者，每周打三次"
          }
        }
        // ... 更多参与者
      ],
      "pagination": {
        "total": 8, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 1 // 总页数
      },
      "message": "获取参与者列表成功"
    }
    ```

- `GET /api/events/recommendations` - 获取推荐活动
  - 请求参数:
    - 查询参数:
      - limit: 返回数量，默认10
      - longitude: 经度，选填
      - latitude: 纬度，选填
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "title": "周末香山徒步",
          "start_time": "2023-06-15 09:00:00",
          "location": "北京市海淀区香山公园南门集合",
          "participants_count": 8,
          "max_participants": 20,
          "organizer": {
            "id": 1,
            "nickname": "张伟",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
          },
          "main_image": "https://cdn.sportsapp.com/events/event1_img1.jpg",
          "category": {
            "id": 1,
            "name": "登山"
          },
          "reason": "根据您的兴趣推荐" // 推荐原因
        }
        // ... 更多推荐活动
      ],
      "message": "获取推荐活动成功"
    }
    ```

### 2. 运动伙伴匹配 API

- `GET /api/partners/recommend` - 获取推荐伙伴

  - 请求参数:
    - 查询参数:
      - category_id: 运动类别ID，选填
      - skill_level: 技能水平，可选值：beginner, intermediate, advanced，选填
      - age_range: 年龄范围，格式"18-35"，选填
      - gender: 性别偏好，可选值：all, male, female，选填，默认all
      - limit: 返回数量，默认10
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 3,
          "nickname": "王飞",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user3.jpg",
          "bio": "足球教练，专注青少年足球培训",
          "gender": "男",
          "location": "广州市天河区",
          "skill_level": "advanced",
          "preferred_time": ["weekend", "evening"],
          "match_score": 85, // 匹配度分数
          "common_categories": [
            {
              "id": 3,
              "name": "足球"
            }
          ],
          "is_following": false, // 当前用户是否已关注此用户
          "is_follower": true // 此用户是否已关注当前用户
        }
        // ... 更多推荐伙伴
      ],
      "message": "获取推荐伙伴成功"
    }
    ```

- `GET /api/partners/nearby` - 获取附近伙伴

  - 请求参数:
    - 查询参数:
      - longitude: 经度，必填
      - latitude: 纬度，必填
      - radius: 搜索半径(km)，选填，默认5
      - category_id: 运动类别ID，选填
      - limit: 返回数量，默认10
      - online_only: 是否只显示在线用户，可选值：0, 1，默认0
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 5,
          "nickname": "赵敏",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user5.jpg",
          "bio": "瑜伽教练，提供专业瑜伽指导",
          "distance": 1.2, // 距离(km)
          "categories": [
            {
              "id": 4,
              "name": "瑜伽"
            }
          ],
          "is_online": true, // 是否在线
          "last_active": "2023-06-12 16:45:00" // 最后活跃时间
        }
        // ... 更多附近伙伴
      ],
      "message": "获取附近伙伴成功"
    }
    ```

- `POST /api/partners/invite/{userId}` - 邀请成为伙伴

  - 请求参数:
    - 路径参数: userId (用户ID)
    - 请求体:
      ```json
      {
        "message": "string", // 邀请消息，选填
        "category_id": 1, // 运动类别ID，必填
        "preferred_time": "string", // 偏好时间，选填
        "location": "string", // 偏好地点，选填
        "event_id": 1 // 关联活动ID，选填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "invite_id": 5, // 邀请ID
        "user": {
          "id": 5,
          "nickname": "赵敏",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user5.jpg"
        }
      },
      "message": "伙伴邀请发送成功"
    }
    ```

- `PUT /api/partners/invite/{inviteId}/accept` - 接受伙伴邀请

  - 请求参数:
    - 路径参数: inviteId (邀请ID)
    - 请求体:
      ```json
      {
        "message": "string" // 回复消息，选填
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "partner": {
          "id": 1,
          "nickname": "张伟",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
        },
        "chat_id": 12 // 聊天室ID
      },
      "message": "已接受伙伴邀请"
    }
    ```

- `PUT /api/partners/invite/{inviteId}/reject` - 拒绝伙伴邀请
  - 请求参数:
    - 路径参数: inviteId (邀请ID)
    - 请求体:
      ```json
      {
        "reason": "string", // 拒绝原因，选填
        "block_future": false // 是否阻止此用户未来邀请，选填，默认false
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "已拒绝伙伴邀请"
    }
    ```

### 3. 实时互动 API

- `GET /api/events/{eventId}/chat` - 获取活动聊天历史

  - 请求参数:
    - 路径参数: eventId (活动ID)
    - 查询参数:
      - before_id: 消息ID，选填，获取此ID之前的消息
      - limit: 返回消息数量，默认50
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "chat_id": "event_1", // 聊天室ID
        "event": {
          "id": 1,
          "title": "周末香山徒步"
        },
        "messages": [
          {
            "id": "msg_123",
            "user_id": 1,
            "type": "text", // 消息类型：text, image, system
            "content": "大家记得带上水和防晒用品",
            "created_at": "2023-06-11 10:15:00",
            "user": {
              "id": 1,
              "nickname": "张伟",
              "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
            }
          },
          {
            "id": "msg_124",
            "user_id": 2,
            "type": "text",
            "content": "好的，谢谢提醒",
            "created_at": "2023-06-11 10:17:00",
            "user": {
              "id": 2,
              "nickname": "李娜",
              "avatar_url": "https://cdn.sportsapp.com/avatars/user2.jpg"
            }
          },
          {
            "id": "msg_125",
            "user_id": 0,
            "type": "system",
            "content": "王飞加入了活动",
            "created_at": "2023-06-11 10:30:00"
          }
          // ... 更多消息
        ],
        "participants_count": 8,
        "has_more": true // 是否还有更多历史消息
      },
      "message": "获取活动聊天历史成功"
    }
    ```

- `WebSocket /api/ws/chat` - 聊天WebSocket连接

  - 连接参数:
    - token: 用户认证令牌
    - chat*id: 聊天室ID，格式为"event*{eventId}"或"partner\_{userId}"
  - 服务器推送消息格式:
    ```json
    {
      "type": "message", // 消息类型：message, user_joined, user_left, typing
      "data": {
        "id": "msg_126",
        "user_id": 3,
        "type": "text",
        "content": "请问明天天气怎么样？需要带雨具吗？",
        "created_at": "2023-06-11 10:45:00",
        "user": {
          "id": 3,
          "nickname": "王飞",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user3.jpg"
        }
      }
    }
    ```
  - 客户端发送消息格式:
    ```json
    {
      "type": "message", // 消息类型：message, typing
      "content": "string", // 消息内容
      "content_type": "text" // 内容类型：text, image
    }
    ```

- `POST /api/events/{eventId}/updates` - 发布活动实况

  - 请求参数:
    - 路径参数: eventId (活动ID)
    - 请求体:
      ```json
      {
        "type": "string", // 更新类型，必填，可选值：text, image, location, milestone
        "content": "string", // 更新内容，类型为text时必填
        "image_url": "string", // 图片URL，类型为image时必填
        "coordinates": {
          // 位置坐标，类型为location时必填
          "longitude": 116.195053,
          "latitude": 40.056942
        },
        "milestone": "string", // 里程碑描述，类型为milestone时必填
        "notify_participants": true // 是否通知参与者，选填，默认false
      }
      ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 15, // 更新ID
        "created_at": "2023-06-15 10:30:00"
      },
      "message": "活动实况发布成功"
    }
    ```

- `GET /api/events/{eventId}/updates` - 获取活动实况
  - 请求参数:
    - 路径参数: eventId (活动ID)
    - 查询参数:
      - page: 页码，默认1
      - limit: 每页条数，默认20
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 15,
          "user_id": 1,
          "type": "text",
          "content": "我们已经到达山脚下，开始准备爬山",
          "created_at": "2023-06-15 09:15:00",
          "user": {
            "id": 1,
            "nickname": "张伟",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
          }
        },
        {
          "id": 16,
          "user_id": 1,
          "type": "image",
          "image_url": "https://cdn.sportsapp.com/events/updates/update16.jpg",
          "created_at": "2023-06-15 09:30:00",
          "user": {
            "id": 1,
            "nickname": "张伟",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
          }
        },
        {
          "id": 17,
          "user_id": 1,
          "type": "location",
          "coordinates": {
            "longitude": 116.195153,
            "latitude": 40.057042
          },
          "location_description": "香山半山腰",
          "created_at": "2023-06-15 10:30:00",
          "user": {
            "id": 1,
            "nickname": "张伟",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
          }
        }
        // ... 更多实况更新
      ],
      "pagination": {
        "total": 8, // 总记录数
        "page": 1, // 当前页码
        "limit": 20, // 每页条数
        "pages": 1 // 总页数
      },
      "message": "获取活动实况成功"
    }
    ```

### 4. 社区管理 API

- `GET /api/community/rules` - 获取社区规则

  - 请求参数: 无
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "last_updated": "2023-05-10 14:30:00",
        "version": "1.2",
        "sections": [
          {
            "title": "发布规则",
            "content": "1. 禁止发布广告和推广内容\n2. 禁止发布侵犯他人权益的内容\n3. 禁止发布暴力、色情等违法内容",
            "order": 1
          },
          {
            "title": "互动规则",
            "content": "1. 尊重其他用户，禁止人身攻击\n2. 理性讨论，避免引起争端\n3. 鼓励分享有价值的内容和经验",
            "order": 2
          }
          // ... 更多规则章节
        ]
      },
      "message": "获取社区规则成功"
    }
    ```

- `GET /api/community/honors` - 获取荣誉榜

  - 请求参数:
    - 查询参数:
      - type: 荣誉类型，可选值：contributors, organizers, all，默认all
      - period: 统计周期，可选值：week, month, all_time，默认month
      - limit: 返回数量，默认10
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "contributors": [
          {
            "user_id": 4,
            "nickname": "陈杰",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user4.jpg",
            "points": 520, // 贡献积分
            "posts_count": 15, // 发帖数
            "helpful_count": 28, // 有用回答数
            "rank": 1, // 排名
            "badges": ["内容创作者", "问题解答者"] // 获得的徽章
          }
          // ... 更多贡献者
        ],
        "organizers": [
          {
            "user_id": 1,
            "nickname": "张伟",
            "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg",
            "events_count": 12, // 组织活动数
            "participants_count": 156, // 参与者总数
            "rating_avg": 4.8, // 活动平均评分
            "rank": 1, // 排名
            "badges": ["优秀组织者", "活跃达人"] // 获得的徽章
          }
          // ... 更多组织者
        ]
      },
      "message": "获取荣誉榜成功"
    }
    ```

- `GET /api/users/me/achievements` - 获取用户成就

  - 请求参数: 无 (通过Authorization头提供令牌)
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "badges": [
          {
            "id": "content_creator",
            "name": "内容创作者",
            "description": "发布超过10篇高质量帖子",
            "icon_url": "https://cdn.sportsapp.com/badges/content_creator.png",
            "earned_at": "2023-05-20 14:30:00"
          },
          {
            "id": "early_adopter",
            "name": "早期用户",
            "description": "平台上线后30天内注册的用户",
            "icon_url": "https://cdn.sportsapp.com/badges/early_adopter.png",
            "earned_at": "2023-04-15 09:25:00"
          }
          // ... 更多徽章
        ],
        "statistics": {
          "posts_count": 15, // 发帖数
          "comments_count": 68, // 评论数
          "likes_received": 210, // 获得的点赞数
          "events_organized": 5, // 组织的活动数
          "events_participated": 12 // 参加的活动数
        },
        "milestones": [
          {
            "id": "first_post",
            "name": "首次发帖",
            "achieved": true,
            "achieved_at": "2023-04-20 10:15:00"
          },
          {
            "id": "ten_comments",
            "name": "评论10次",
            "achieved": true,
            "achieved_at": "2023-05-05 16:30:00"
          },
          {
            "id": "organize_event",
            "name": "组织第一次活动",
            "achieved": true,
            "achieved_at": "2023-05-10 09:20:00"
          },
          {
            "id": "hundred_likes",
            "name": "获得100个点赞",
            "achieved": true,
            "achieved_at": "2023-06-01 14:50:00"
          },
          {
            "id": "verified_profile",
            "name": "完善个人资料",
            "achieved": true,
            "achieved_at": "2023-04-16 11:25:00"
          }
          // ... 更多里程碑
        ]
      },
      "message": "获取用户成就成功"
    }
    ```

- `POST /api/admin/community/rewards` - 发放用户奖励
  - 请求参数:
    ```json
    {
      "user_id": 3, // 用户ID，必填
      "reward_type": "string", // 奖励类型，必填，可选值：points, badge, level_up, custom
      "points": 100, // 积分数量，reward_type为points时必填
      "badge_id": "string", // 徽章ID，reward_type为badge时必填
      "custom_title": "string", // 自定义奖励标题，reward_type为custom时必填
      "custom_description": "string", // 自定义奖励描述，reward_type为custom时必填
      "reason": "string", // 奖励原因，必填
      "notify_user": true, // 是否通知用户，选填，默认true
      "public_display": false // 是否公开展示，选填，默认false
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "reward_id": 25, // 奖励记录ID
        "user": {
          "id": 3,
          "nickname": "王飞",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user3.jpg"
        }
      },
      "message": "用户奖励发放成功"
    }
    ```

## V2.1 数据版 API

### 1. AI推荐系统 API

- `GET /api/recommendations/venues` - 获取场地推荐

  - 请求参数:
    - 查询参数:
      - longitude: 经度，选填
      - latitude: 纬度，选填
      - limit: 返回数量，默认10
      - include_visited: 是否包含已访问过的场地，可选值：0, 1，默认0
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "name": "香山运动公园",
          "category_id": 1,
          "address": "北京市海淀区香山公园南门附近",
          "avg_rating": 4.3,
          "coordinates": {
            "longitude": 116.195053,
            "latitude": 40.056942
          },
          "distance": 2.5, // 当提供了经纬度时返回
          "main_image": "https://cdn.sportsapp.com/venues/venue1_img1.jpg",
          "reason": "根据您的运动喜好推荐", // 推荐原因
          "match_score": 0.85 // 匹配度分数(0-1)
        }
        // ... 更多推荐场地
      ],
      "message": "获取场地推荐成功"
    }
    ```

- `GET /api/recommendations/content` - 获取内容推荐

  - 请求参数:
    - 查询参数:
      - content_type: 内容类型，可选值：all, post, event，默认all
      - category_id: 类别ID，选填
      - limit: 返回数量，默认10
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "posts": [
          {
            "id": 4,
            "title": "徒步穿越贡嘎攻略",
            "content_preview": "上个月完成了贡嘎山穿越，分享一下路线规划和装备准备经验...",
            "type": "experience",
            "likes_count": 45,
            "comments_count": 15,
            "created_at": "2023-05-20 10:15:00",
            "user": {
              "id": 4,
              "nickname": "陈杰",
              "avatar_url": "https://cdn.sportsapp.com/avatars/user4.jpg"
            },
            "main_image": "https://cdn.sportsapp.com/posts/post4_img1.jpg",
            "reason": "根据您的浏览历史推荐", // 推荐原因
            "match_score": 0.92 // 匹配度分数(0-1)
          }
          // ... 更多推荐帖子
        ],
        "events": [
          {
            "id": 1,
            "title": "周末香山徒步",
            "start_time": "2023-06-15 09:00:00",
            "location": "北京市海淀区香山公园南门集合",
            "participants_count": 8,
            "max_participants": 20,
            "organizer": {
              "id": 1,
              "nickname": "张伟",
              "avatar_url": "https://cdn.sportsapp.com/avatars/user1.jpg"
            },
            "main_image": "https://cdn.sportsapp.com/events/event1_img1.jpg",
            "reason": "与您之前参加的活动相似", // 推荐原因
            "match_score": 0.88 // 匹配度分数(0-1)
          }
          // ... 更多推荐活动
        ]
      },
      "message": "获取内容推荐成功"
    }
    ```

- `GET /api/recommendations/users` - 获取用户推荐

  - 请求参数:
    - 查询参数:
      - category_id: 运动类别ID，选填
      - purpose: 推荐目的，可选值：follow, partner, all，默认all
      - limit: 返回数量，默认10
  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 3,
          "nickname": "王飞",
          "avatar_url": "https://cdn.sportsapp.com/avatars/user3.jpg",
          "bio": "足球教练，专注青少年足球培训",
          "common_categories": [
            {
              "id": 3,
              "name": "足球"
            }
          ],
          "common_connections": 2, // 共同关注的人数
          "reason": "你们有共同的兴趣爱好", // 推荐原因
          "match_score": 0.75 // 匹配度分数(0-1)
        }
        // ... 更多推荐用户
      ],
      "message": "获取用户推荐成功"
    }
    ```

- `POST /api/recommendations/feedback` - 提交推荐反馈
  - 请求参数:
    ```json
    {
      "recommendation_type": "string", // 推荐类型，必填，可选值：venue, post, event, user
      "item_id": 1, // 推荐项ID，必填
      "action": "string", // 用户行为，必填，可选值：click, like, dislike, hide, follow
      "context": "string" // 上下文信息，选填
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "message": "反馈提交成功"
    }
    ```

### 2. 运动数据 API

- `POST /api/sports/records` - 记录运动数据

  - 请求参数:
    ```json
    {
      "category_id": 1, // 运动类别ID，必填
      "start_time": "2023-06-12 08:30:00", // 开始时间，必填
      "end_time": "2023-06-12 09:45:00", // 结束时间，必填
      "duration": 75, // 持续时间(分钟)，必填
      "distance": 5.2, // 距离(公里)，选填
      "calories": 320, // 卡路里消耗，选填
      "avg_heart_rate": 142, // 平均心率，选填
      "max_heart_rate": 165, // 最大心率，选填
      "steps": 6500, // 步数，选填
      "elevation_gain": 120, // 爬升高度(米)，选填
      "avg_pace": "5:45", // 平均配速(分:秒/公里)，选填
      "notes": "string", // 运动备注，选填
      "weather": {
        // 天气信息，选填
        "temperature": 25, // 温度(摄氏度)
        "condition": "sunny", // 天气状况：sunny, cloudy, rainy, etc.
        "humidity": 65 // 湿度(%)
      },
      "route_data": {
        // 路线数据，选填
        "start_location": {
          "longitude": 116.195053,
          "latitude": 40.056942
        },
        "end_location": {
          "longitude": 116.205053,
          "latitude": 40.066942
        },
        "waypoints": [
          {
            "longitude": 116.198053,
            "latitude": 40.059942,
            "timestamp": "2023-06-12 08:50:00",
            "heart_rate": 145,
            "elevation": 50
          }
          // ... 更多路点数据
        ]
      },
      "event_id": 1, // 关联活动ID，选填
      "venue_id": 1, // 关联场地ID，选填
      "partner_ids": [2, 3], // 运动伙伴ID列表，选填
      "equipment_used": ["running shoes", "smart watch"], // 使用的装备，选填
      "images": [
        // 运动图片，选填
        {
          "image_url": "string",
          "sequence_number": 1
        }
      ]
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "id": 12, // 运动记录ID
        "points_earned": 25, // 获得的积分
        "achievements": [
          {
            "id": "first_5k",
            "name": "完成首个5公里",
            "icon_url": "https://cdn.sportsapp.com/achievements/first_5k.png"
          }
        ]
      },
      "message": "运动数据记录成功"
    }
    ```

- `GET /api/sports/records` - 获取运动记录

  - 请求参数:

  ````json
  {
    "page": 1, // 页码，默认1
    "limit": 10, // 每页条数，默认10
    "category_id": null, // 运动类别ID，选填
    "start_date": null, // 开始日期，格式YYYY-MM-DD，选填
    "end_date": null // 结束日期，格式YYYY-MM-DD，选填
  }
  ```

  - 返回参数:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 12,
          "category_id": 1,
          "category_name": "登山",
          "start_time": "2023-06-12 08:30:00",
          "end_time": "2023-06-12 09:45:00",
          "duration": 75, // 分钟
          "distance": 5.2, // 公里
          "calories": 320,
          "avg_heart_rate": 142,
          "notes": "今天天气很好，感觉状态不错",
          "main_image": "https://cdn.sportsapp.com/sports/record12_img1.jpg"
        }
        // ... 更多运动记录
      ],
      "pagination": {
        "total": 28, // 总记录数
        "page": 1, // 当前页码
        "limit": 10, // 每页条数
        "pages": 3 // 总页数
      },
      "message": "获取运动记录成功"
    }
  ````

- `GET /api/sports/statistics` - 获取运动统计

  - 请求参数:
    ```json
    {
      "period": "month", // 统计周期，默认month
      "category_id": null // 运动类别ID，选填
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "summary": {
          "workouts_count": 12, // 运动次数
          "total_duration": 960, // 总时长(分钟)
          "total_distance": 65.5, // 总距离(公里)
          "total_calories": 3850, // 总卡路里消耗
          "avg_heart_rate": 138 // 平均心率
        },
        "categories": [
          {
            "id": 1,
            "name": "登山",
            "workouts_count": 5,
            "total_duration": 450,
            "percentage": 41.7 // 占总运动时间的百分比
          },
          {
            "id": 3,
            "name": "足球",
            "workouts_count": 4,
            "total_duration": 360,
            "percentage": 33.3
          },
          {
            "id": 2,
            "name": "羽毛球",
            "workouts_count": 3,
            "total_duration": 150,
            "percentage": 25.0
          }
        ],
        "chart_data": {
          "duration": [
            {
              "date": "2023-06-01",
              "value": 60
            },
            {
              "date": "2023-06-03",
              "value": 75
            }
            // ... 更多日期数据
          ],
          "distance": [
            {
              "date": "2023-06-01",
              "value": 3.2
            },
            {
              "date": "2023-06-03",
              "value": 5.5
            }
            // ... 更多日期数据
          ],
          "heart_rate": [
            {
              "date": "2023-06-01",
              "value": 135
            },
            {
              "date": "2023-06-03",
              "value": 142
            }
            // ... 更多日期数据
          ]
        },
        "trends": {
          "duration_change": 15, // 相比上一周期的变化百分比
          "distance_change": 8,
          "frequency_change": 20
        }
      },
      "message": "获取运动统计成功"
    }
    ```

- `GET /api/sports/achievements` - 获取运动成就

  - 请求参数:
    ```json
    {
      "category_id": null, // 运动类别ID，选填
      "status": "all" // 成就状态，可选值：earned, in_progress, all，默认all
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "earned": [
          {
            "id": "first_5k",
            "name": "完成首个5公里",
            "description": "首次完成5公里的运动记录",
            "icon_url": "https://cdn.sportsapp.com/achievements/first_5k.png",
            "category_id": 1,
            "category_name": "登山",
            "earned_at": "2023-06-12 09:45:00"
          },
          {
            "id": "three_week_streak",
            "name": "三周连续运动",
            "description": "连续三周每周至少运动3次",
            "icon_url": "https://cdn.sportsapp.com/achievements/three_week_streak.png",
            "earned_at": "2023-06-10 16:20:00"
          }
          // ... 更多已获得的成就
        ],
        "in_progress": [
          {
            "id": "marathon_ready",
            "name": "马拉松准备",
            "description": "累计跑步距离达到200公里",
            "icon_url": "https://cdn.sportsapp.com/achievements/marathon_ready.png",
            "progress": 0.65, // 完成进度(0-1)
            "current_value": 130, // 当前值
            "target_value": 200 // 目标值
          },
          {
            "id": "fitness_master",
            "name": "健身大师",
            "description": "30天内完成10次不同类型的运动",
            "icon_url": "https://cdn.sportsapp.com/achievements/fitness_master.png",
            "progress": 0.4,
            "current_value": 4,
            "target_value": 10
          }
          // ... 更多进行中的成就
        ]
      },
      "message": "获取运动成就成功"
    }
    ```

- `GET /api/sports/visualization` - 获取数据可视化
  - 请求参数:
    ```json
    {
      "type": "chart", // 可视化类型，可选值：heatmap, chart, comparison，默认chart
      "metric": "duration", // 指标，可选值：duration, distance, calories, heart_rate，默认duration
      "period": "month", // 统计周期，可选值：week, month, year，默认month
      "category_id": null // 运动类别ID，选填
    }
    ```
  - 返回参数:
    ```json
    {
      "success": true,
      "data": {
        "type": "chart",
        "metric": "duration",
        "period": "month",
        "title": "6月运动时长趋势",
        "unit": "分钟",
        "categories": ["登山", "足球", "羽毛球"],
        "labels": [
          "6/1",
          "6/2",
          "6/3",
          "6/4",
          "6/5",
          "6/6",
          "6/7",
          "6/8",
          "6/9",
          "6/10",
          "6/11",
          "6/12"
        ],
        "datasets": [
          {
            "name": "登山",
            "color": "#4CAF50",
            "data": [0, 60, 0, 0, 75, 0, 0, 90, 0, 0, 120, 0]
          },
          {
            "name": "足球",
            "color": "#2196F3",
            "data": [90, 0, 0, 90, 0, 0, 90, 0, 0, 90, 0, 0]
          },
          {
            "name": "羽毛球",
            "color": "#FF9800",
            "data": [0, 0, 60, 0, 0, 45, 0, 0, 45, 0, 0, 0]
          }
        ],
        "summary": {
          "total": 855,
          "average": 71.25,
          "max": 120,
          "min": 45
        }
      },
      "message": "获取数据可视化成功"
    }
    ```

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
