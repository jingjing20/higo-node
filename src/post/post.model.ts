export interface Post {
  id: number; // 帖子ID
  user_id: number; // 用户ID
  category_id?: number; // 类别ID，选填
  title: string; // 帖子标题
  content: string; // 帖子内容
  type: string; // 帖子类型
  location?: string; // 地理位置文字描述，选填
  coordinates: {
    longitude: number; // 经度
    latitude: number; // 纬度
  }; // 地理位置坐标
  is_approved: number; // 是否已批准
  likes_count: number; // 点赞数
  comments_count: number; // 评论数
  created_at: Date; // 创建时间
  updated_at: Date; // 更新时间
}

export interface PostImage {
  id: number; // 图片ID
  post_id: number; // 帖子ID
  image_url: string; // 图片URL
  sequence_number: number; // 序号
  created_at: Date; // 创建时间
}

export interface PostLike {
  id: number; // 点赞ID
  post_id: number; // 帖子ID
  user_id: number; // 用户ID
  created_at: Date; // 创建时间
}

export interface Comment {
  id: number; // 评论ID
  post_id: number; // 帖子ID
  user_id: number; // 用户ID
  content: string; // 评论内容
  parent_id?: number; // 父评论ID，选填
  likes_count: number; // 点赞数
  created_at: Date; // 创建时间
  updated_at: Date; // 更新时间
}
