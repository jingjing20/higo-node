import { queryAsync } from '../app/database/database.utils';
import { Post, PostImage, PostLike, Comment } from './post.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * 创建新帖子
 * @param userId 用户ID
 * @param post 帖子数据
 * @returns 创建的帖子ID
 */
export const createPost = async (
  userId: number,
  post: Omit<
    Post,
    'id' | 'likes_count' | 'comments_count' | 'created_at' | 'updated_at'
  >
): Promise<number> => {
  try {
    const { longitude, latitude } = post.coordinates || {};
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      throw new Error(
        `非法坐标值: longitude=${longitude}, latitude=${latitude}`
      );
    }

    const coordinates = `POINT(${longitude} ${latitude})`; // 注意中间是空格，不是逗号
    const result = (await queryAsync(
      `INSERT INTO posts
      (user_id, category_id, title, content, type, location, coordinates, is_approved)
      VALUES (?, ?, ?, ?, ?, ?, ST_GeomFromText(?), ?)`,
      [
        userId,
        post.category_id || null,
        post.title,
        post.content,
        post.type || 'normal',
        post.location || null,
        coordinates,
        post.is_approved
      ]
    )) as ResultSetHeader;

    return result.insertId;
  } catch (error) {
    throw new Error(`创建帖子失败: ${error.message}`);
  }
};

/**
 * 获取帖子列表
 * @param options 筛选条件
 * @returns 帖子列表
 */
export const getPosts = async (options: {
  page?: number;
  limit?: number;
  categoryId?: number;
  userId?: number;
  type?: string;
  isSelf?: boolean;
}): Promise<Post[]> => {
  try {
    const { page = 1, limit = 10, categoryId, userId, type, isSelf } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        p.id,
        p.user_id,
        p.category_id,
        p.title,
        p.content,
        p.type,
        p.location,
        ST_X(p.coordinates) as x,
        ST_Y(p.coordinates) as y,
        p.is_approved,
        p.likes_count,
        p.comments_count,
        p.created_at,
        p.updated_at,
        u.nickname as author_name,
        u.avatar_url as author_avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_approved = 1
    `;

    const queryParams = [];

    if (categoryId) {
      query += ' AND p.category_id = ?';
      queryParams.push(categoryId);
    }

    if (userId && isSelf) {
      query += ' AND p.user_id = ?';
      queryParams.push(userId);
    }

    if (type) {
      query += ' AND p.type = ?';
      queryParams.push(type);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const posts = (await queryAsync(query, queryParams)) as (Post &
      RowDataPacket)[];

    // 如果提供了当前用户ID，查询用户对帖子的点赞状态
    const postIds = posts.map((post) => post.id);
    const likedPostsMap = new Map<number, boolean>();

    if (userId && postIds.length > 0) {
      const likedPosts = (await queryAsync(
        'SELECT post_id FROM post_likes WHERE user_id = ? AND post_id IN (?)',
        [userId, postIds]
      )) as { post_id: number }[];
      likedPosts.forEach((like) => {
        likedPostsMap.set(like.post_id, true);
      });
    }

    return posts.map((post) => ({
      ...post,
      coordinates: {
        longitude: post.x,
        latitude: post.y
      },
      is_liked: likedPostsMap.has(post.id) || false
    }));
  } catch (error) {
    throw new Error(`获取帖子列表失败: ${error.message}`);
  }
};

/**
 * 获取帖子详情
 * @param postId 帖子ID
 * @param currentUserId 当前登录用户ID (可选)
 * @returns 帖子详情
 */
export const getPostById = async (
  postId: number,
  userId: number
): Promise<Post | null> => {
  try {
    const posts = (await queryAsync(
      `SELECT
        p.id,
        p.user_id,
        p.category_id,
        p.title,
        p.content,
        p.type,
        p.location,
        ST_X(p.coordinates) as x,
        ST_Y(p.coordinates) as y,
        p.is_approved,
        p.likes_count,
        p.comments_count,
        p.created_at,
        p.updated_at,
        u.nickname as author_name,
        u.avatar_url as author_avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.is_approved = 1`,
      [postId]
    )) as (Post & RowDataPacket)[];

    if (posts.length === 0) {
      return null;
    }

    const post = posts[0];

    // 查询当前用户是否点赞过该帖子
    let isLiked = false;
    if (userId) {
      const likes = (await queryAsync(
        'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      )) as RowDataPacket[];

      isLiked = likes.length > 0;
    }

    // 转换坐标
    return {
      ...post,
      coordinates: {
        longitude: post.x,
        latitude: post.y
      },
      is_liked: isLiked
    };
  } catch (error) {
    throw new Error(`获取帖子详情失败: ${error.message}`);
  }
};

/**
 * 更新帖子
 * @param postId 帖子ID
 * @param userId 用户ID（验证所有权）
 * @param data 更新数据
 */
export const updatePost = async (
  postId: number,
  userId: number,
  data: Partial<Post>
): Promise<boolean> => {
  try {
    // 验证帖子所有权
    const posts = (await queryAsync(
      'SELECT id FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    )) as RowDataPacket[];

    if (posts.length === 0) {
      return false;
    }

    // 构建更新SQL
    const updates = [];
    const params = [];

    if (data.title) {
      updates.push('title = ?');
      params.push(data.title);
    }

    if (data.content) {
      updates.push('content = ?');
      params.push(data.content);
    }

    if (data.category_id) {
      updates.push('category_id = ?');
      params.push(data.category_id);
    }

    if (data.type) {
      updates.push('type = ?');
      params.push(data.type);
    }

    if (data.location) {
      updates.push('location = ?');
      params.push(data.location);
    }

    if (data.coordinates) {
      updates.push('coordinates = ST_GeomFromText(?)');
      params.push(
        `POINT(${data.coordinates.longitude}, ${data.coordinates.latitude})`
      );
    }

    if (updates.length === 0) {
      return true; // 没有要更新的内容
    }

    // 添加参数
    params.push(postId);

    // 执行更新
    await queryAsync(
      `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return true;
  } catch (error) {
    throw new Error(`更新帖子失败: ${error.message}`);
  }
};

/**
 * 删除帖子
 * @param postId 帖子ID
 * @param userId 用户ID（验证所有权）
 */
export const deletePost = async (
  postId: number,
  userId: number
): Promise<boolean> => {
  try {
    // 验证帖子所有权
    const posts = (await queryAsync(
      'SELECT id FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    )) as RowDataPacket[];

    if (posts.length === 0) {
      return false;
    }

    // 开始事务
    await queryAsync('START TRANSACTION');

    try {
      // 删除帖子相关数据
      await queryAsync('DELETE FROM post_images WHERE post_id = ?', [postId]);
      await queryAsync('DELETE FROM post_likes WHERE post_id = ?', [postId]);
      await queryAsync('DELETE FROM post_comments WHERE post_id = ?', [postId]);
      await queryAsync('DELETE FROM posts WHERE id = ?', [postId]);

      // 提交事务
      await queryAsync('COMMIT');
      return true;
    } catch (error) {
      // 回滚事务
      await queryAsync('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new Error(`删除帖子失败: ${error.message}`);
  }
};

/**
 * 点赞帖子
 * @param postId 帖子ID
 * @param userId 用户ID
 */
export const likePost = async (
  postId: number,
  userId: number
): Promise<boolean> => {
  try {
    // 检查帖子是否存在
    const posts = (await queryAsync(
      'SELECT id FROM posts WHERE id = ? AND is_approved = 1',
      [postId]
    )) as RowDataPacket[];

    if (posts.length === 0) {
      return false;
    }

    // 检查是否已点赞
    const likes = (await queryAsync(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    )) as RowDataPacket[];

    if (likes.length > 0) {
      return true; // 已经点赞过
    }

    // 开始事务
    await queryAsync('START TRANSACTION');

    try {
      // 添加点赞记录
      await queryAsync(
        'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
        [postId, userId]
      );

      // 更新帖子点赞计数
      await queryAsync(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?',
        [postId]
      );

      // 提交事务
      await queryAsync('COMMIT');
      return true;
    } catch (error) {
      // 回滚事务
      await queryAsync('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new Error(`点赞帖子失败: ${error.message}`);
  }
};

/**
 * 取消点赞
 * @param postId 帖子ID
 * @param userId 用户ID
 */
export const unlikePost = async (
  postId: number,
  userId: number
): Promise<boolean> => {
  try {
    // 检查是否已点赞
    const likes = (await queryAsync(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    )) as RowDataPacket[];

    if (likes.length === 0) {
      return true; // 没有点赞过
    }

    // 开始事务
    await queryAsync('START TRANSACTION');

    try {
      // 删除点赞记录
      await queryAsync(
        'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );

      // 更新帖子点赞计数
      await queryAsync(
        'UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?',
        [postId]
      );

      // 提交事务
      await queryAsync('COMMIT');
      return true;
    } catch (error) {
      // 回滚事务
      await queryAsync('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new Error(`取消点赞失败: ${error.message}`);
  }
};

/**
 * 添加评论
 * @param postId 帖子ID
 * @param userId 用户ID
 * @param content 评论内容
 * @param parentId 父评论ID（可选）
 */
export const addComment = async (
  postId: number,
  userId: number,
  content: string,
  parentId?: number
): Promise<number> => {
  try {
    // 检查帖子是否存在
    const posts = (await queryAsync(
      'SELECT id FROM posts WHERE id = ? AND is_approved = 1',
      [postId]
    )) as RowDataPacket[];

    if (posts.length === 0) {
      throw new Error('帖子不存在或未通过审核');
    }

    // 如果有父评论，检查父评论是否存在
    if (parentId) {
      const parentComments = (await queryAsync(
        'SELECT id FROM post_comments WHERE id = ? AND post_id = ?',
        [parentId, postId]
      )) as RowDataPacket[];

      if (parentComments.length === 0) {
        throw new Error('父评论不存在');
      }
    }

    // 开始事务
    await queryAsync('START TRANSACTION');

    try {
      // 添加评论
      const result = (await queryAsync(
        'INSERT INTO post_comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
        [postId, userId, content, parentId || null]
      )) as ResultSetHeader;

      // 更新帖子评论计数
      await queryAsync(
        'UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?',
        [postId]
      );

      // 提交事务
      await queryAsync('COMMIT');
      const comment = await getCommentById(result.insertId);
      return comment;
    } catch (error) {
      // 回滚事务
      await queryAsync('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new Error(`添加评论失败: ${error.message}`);
  }
};

/**
 * 获取帖子评论
 * @param postId 帖子ID
 */
export const getPostComments = async (postId: number): Promise<any[]> => {
  try {
    const comments = (await queryAsync(
      `SELECT
        c.id,
        c.post_id,
        c.user_id,
        c.content,
        c.parent_id,
        c.likes_count,
        c.created_at,
        c.updated_at,
        u.nickname,
        u.avatar_url
      FROM post_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY
        c.created_at ASC`,
      [postId]
    )) as (Comment &
      RowDataPacket & { nickname: string; avatar_url: string })[];

    // 构建评论树
    const commentMap = new Map();
    const rootComments = [];

    // 首先将所有评论添加到映射中
    comments.forEach((comment) => {
      // 格式化评论，添加用户信息和replies数组
      const formattedComment = {
        id: comment.id,
        user_id: comment.user_id,
        content: comment.content,
        likes_count: comment.likes_count,
        created_at: comment.created_at,
        user: {
          id: comment.user_id,
          nickname: comment.nickname,
          avatar_url: comment.avatar_url
        },
        replies: []
      };

      commentMap.set(comment.id, formattedComment);

      // 如果是顶级评论，直接添加到结果数组
      if (!comment.parent_id) {
        rootComments.push(formattedComment);
      }
    });

    // 第二次遍历，构建回复关系
    comments.forEach((comment) => {
      if (comment.parent_id) {
        const parentComment = commentMap.get(comment.parent_id);
        if (parentComment) {
          parentComment.replies.push(commentMap.get(comment.id));
        }
      }
    });

    return rootComments;
  } catch (error) {
    throw new Error(`获取帖子评论失败: ${error.message}`);
  }
};

/**
 * 上传帖子图片
 * @param postId 帖子ID
 * @param userId 用户ID（验证所有权）
 * @param images 图片信息数组
 */
export const addPostImages = async (
  postId: number,
  userId: number,
  images: {
    image_url: string;
    sequence_number: number;
    originalname: string;
    size: number;
  }[]
): Promise<boolean> => {
  try {
    // 验证帖子所有权
    const posts = (await queryAsync(
      'SELECT id FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    )) as RowDataPacket[];

    if (posts.length === 0) {
      return false;
    }

    // 批量插入图片
    if (images.length > 0) {
      const values = images.map((img) => [
        postId,
        img.image_url,
        img.sequence_number,
        img.originalname,
        img.size
      ]);
      await queryAsync(
        'INSERT INTO post_images (post_id, image_url, sequence_number, original_name, size) VALUES ?',
        [values]
      );
    }

    return true;
  } catch (error) {
    throw new Error(`上传帖子图片失败: ${error.message}`);
  }
};

/**
 * 获取帖子图片
 * @param postId 帖子ID
 */
export const getPostImages = async (postId: number): Promise<PostImage[]> => {
  try {
    const images = (await queryAsync(
      'SELECT * FROM post_images WHERE post_id = ? ORDER BY sequence_number',
      [postId]
    )) as (PostImage & RowDataPacket)[];

    return images;
  } catch (error) {
    throw new Error(`获取帖子图片失败: ${error.message}`);
  }
};

/**
 * 删除帖子图片
 * @param postId 帖子ID
 * @param userId 用户ID（验证所有权）
 */
export const deletePostImages = async (
  postId: number,
  userId: number
): Promise<boolean> => {
  try {
    // 验证帖子所有权
    const posts = (await queryAsync(
      'SELECT id FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    )) as RowDataPacket[];

    if (posts.length === 0) {
      return false;
    }

    // 删除帖子的所有图片
    await queryAsync('DELETE FROM post_images WHERE post_id = ?', [postId]);

    return true;
  } catch (error) {
    throw new Error(`删除帖子图片失败: ${error.message}`);
  }
};

/**
 * 获取单条评论详情
 * @param commentId 评论ID
 */
export const getCommentById = async (
  commentId: number
): Promise<any | null> => {
  try {
    const comments = (await queryAsync(
      `SELECT
        c.id,
        c.post_id,
        c.user_id,
        c.content,
        c.parent_id,
        c.likes_count,
        c.created_at,
        c.updated_at,
        u.nickname,
        u.avatar_url
      FROM post_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [commentId]
    )) as (Comment &
      RowDataPacket & { nickname: string; avatar_url: string })[];

    if (comments.length === 0) {
      return null;
    }

    const comment = comments[0];

    // 格式化评论，添加用户信息
    const formattedComment = {
      id: comment.id,
      user_id: comment.user_id,
      content: comment.content,
      likes_count: comment.likes_count,
      created_at: comment.created_at,
      user: {
        id: comment.user_id,
        nickname: comment.nickname,
        avatar_url: comment.avatar_url
      }
    };

    return formattedComment;
  } catch (error) {
    throw new Error(`获取评论详情失败: ${error.message}`);
  }
};

/**
 * 获取用户点赞过的帖子列表
 * @param userId 用户ID
 * @param options 分页选项
 * @returns 帖子列表
 */
export const getUserLikedPosts = async (
  userId: number,
  options: {
    page?: number;
    limit?: number;
  }
): Promise<Post[]> => {
  try {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // 从点赞表关联查询帖子信息
    const query = `
      SELECT
        p.id,
        p.user_id,
        p.category_id,
        p.title,
        p.content,
        p.type,
        p.location,
        ST_X(p.coordinates) as x,
        ST_Y(p.coordinates) as y,
        p.is_approved,
        p.likes_count,
        p.comments_count,
        p.created_at,
        p.updated_at,
        u.nickname as author_name,
        u.avatar_url as author_avatar,
        pl.created_at as liked_at
      FROM post_likes pl
      JOIN posts p ON pl.post_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE pl.user_id = ? AND p.is_approved = 1
      ORDER BY pl.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const posts = (await queryAsync(query, [userId, limit, offset])) as (Post &
      RowDataPacket & { x: number; y: number; liked_at: Date })[];

    // 转换结果格式
    return posts.map((post) => ({
      ...post,
      coordinates: {
        longitude: post.x,
        latitude: post.y
      },
      is_liked: true // 当前接口返回的都是用户点赞过的帖子
    }));
  } catch (error) {
    throw new Error(`获取用户点赞帖子列表失败: ${error.message}`);
  }
};
