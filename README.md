# higo-node

higo 服务端

## 生成密钥与公钥

```bash
cd config

# 使用 openssl
openssl

# 生成私钥 private.key
genrsa -out private.key 4096

# 基于私钥 private.key 生成公钥 public.key
rsa -in private.key -pubout -out public.key

# 退出
exit
```

| 字符集（Character Set） | 排序规则（Collation） | 特点和区别                                                                                                                               |
| ----------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| UTF8                    | utf8_general_ci       | 多字节编码，适用于大多数语言。比较时不区分大小写，但区分重音符号（如 "a" 和 "á"）。                                                      |
|                         | utf8_unicode_ci       | 多字节编码，适用于大多数语言。比较时不区分大小写，同时也不区分重音符号（如 "a" 和 "á"）。提供更准确的排序规则。                          |
|                         | utf8_bin              | 多字节编码，适用于大多数语言。比较时区分大小写，且根据字节顺序进行排序，可以实现区分大小写的排序。                                       |
| UTF8MB4                 | utf8mb4_general_ci    | 多字节编码，支持更广泛的字符范围，包括一些特殊的表情符号和象形文字。比较时不区分大小写，但区分重音符号。                                 |
|                         | utf8mb4_unicode_ci    | 多字节编码，支持更广泛的字符范围，包括一些**特殊的表情符号和象形文字。比较时不区分大小写，同时也不区分重音符号。提供更准确的排序规则**。 |
|                         | utf8mb4_bin           | 多字节编码，支持更广泛的字符范围，包括一些特殊的表情符号和象形文字。比较时区分大小写，且根据字节顺序进行排序，可以实现区分大小写的排序。 |
| Latin1                  | latin1_swedish_ci     | 单字节编码，适用于西欧语言。比较时不区分大小写，但区分重音符号。                                                                         |
|                         | latin1_bin            | 单字节编码，适用于西欧语言。比较时区分大小写，且根据字节顺序进行排序，可以实现区分大小写的排序。                                         |

## 图片上传功能说明

本项目实现了一个可扩展的图片上传功能，支持本地文件系统存储和云存储两种模式，并设计了平滑迁移的机制。

### 存储方案

系统支持两种存储方案：

1. **本地文件系统存储**：适合开发环境和小型应用
2. **云存储（如阿里云OSS）**：适合生产环境和大型应用

### 配置方法

在`.env`文件中可以配置存储相关参数：

```env
# 存储类型: local 或 cloud
STORAGE_TYPE=local

# 本地存储配置
LOCAL_UPLOAD_DIR=uploads/images
LOCAL_SERVER_URL=http://localhost:3000

# 云存储配置 (仅当STORAGE_TYPE=cloud时使用)
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name
OSS_REGION=oss-cn-beijing
OSS_CDN_DOMAIN=your-cdn-domain.com
```

### 使用方法

#### 上传图片

使用`multipart/form-data`格式上传图片：

```
POST /api/upload/images
```

请求参数：

- `post_id`: 帖子ID (必填)
- `images`: 图片文件 (可多选)

示例（使用curl）：

```bash
curl -X POST http://localhost:3000/api/upload/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "post_id=123" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png"
```

#### 获取图片

上传成功后，可通过返回的URL访问图片：

```
GET /uploads/images/filename.jpg  # 本地存储
GET https://bucket.region.aliyuncs.com/images/filename.jpg  # 云存储
```

### 存储迁移

系统设计了抽象的存储接口，可以在不修改业务代码的情况下平滑迁移存储方案：

1. 只需更新环境变量`STORAGE_TYPE`从`local`切换到`cloud`
2. 确保配置了正确的云存储参数
3. 可以编写迁移脚本将已有图片从本地迁移到云存储

### 技术实现

- 使用`multer`处理文件上传，支持文件大小限制和类型验证
- 通过接口抽象实现存储方案的统一接口
- 使用工厂模式创建不同的存储实现
- 完全兼容现有的帖子发布和更新流程

## 经纬度

- POINT(经度 纬度) → **中间是一个空格，不是逗号！**
- 经纬度范围：
  - 纬度：-90 到 90
  - 经度：-180 到 180
- 纬度：南北方向，赤道为 0 度，向北为正，向南为负
- 经度：东西方向，本初子午线为 0 度，向东为正，向西为负
- 例如：
  - 北京：POINT(116.4074 39.9087)
  - 上海：POINT(121.4726 31.2317)
  - 广州：POINT(113.2644 23.1291)
