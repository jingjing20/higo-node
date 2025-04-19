import { Request, Response } from 'express';
import * as postService from './post.service';

/**
 * 创建帖子
 */
export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const postData = req.body;

    // 验证帖子数据
    if (!postData.title || !postData.content || !postData.coordinates) {
      res.status(400).json({
        success: false,
        message: '标题、内容和位置信息不能为空'
      });
      return;
    }

    // 默认帖子已通过审核
    if (postData.is_approved === undefined) {
      postData.is_approved = 1;
    }

    const postId = await postService.createPost(userId, postData);

    // 如果有图片数据，保存图片
    if (
      postData.images &&
      Array.isArray(postData.images) &&
      postData.images.length > 0
    ) {
      await postService.addPostImages(postId, userId, postData.images);
    }

    res.status(201).json({
      success: true,
      data: { id: postId },
      message: '帖子创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `创建帖子失败: ${error.message}`
    });
  }
};

/**
 * 获取帖子列表
 */
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category_id, user_id, type } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      categoryId: category_id ? Number(category_id) : undefined,
      userId: user_id ? Number(user_id) : undefined,
      type: type as string
    };

    const posts = await postService.getPosts(options);

    // 为每个帖子获取图片
    const postsWithImages = await Promise.all(
      posts.map(async (post) => {
        const images = await postService.getPostImages(post.id);
        return { ...post, images };
      })
    );

    res.status(200).json({
      success: true,
      data: postsWithImages,
      message: '获取帖子列表成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `获取帖子列表失败: ${error.message}`
    });
  }
};

/**
 * 获取帖子详情
 */
export const getPostById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
      res.status(400).json({
        success: false,
        message: '无效的帖子ID'
      });
      return;
    }

    const post = await postService.getPostById(postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: '帖子不存在或未通过审核'
      });
      return;
    }

    // 获取帖子图片
    const images = await postService.getPostImages(postId);

    // 获取帖子评论
    const comments = await postService.getPostComments(postId);

    res.status(200).json({
      success: true,
      data: { ...post, images, comments },
      message: '获取帖子详情成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `获取帖子详情失败: ${error.message}`
    });
  }
};

/**
 * 更新帖子
 */
export const updatePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.postId);
    const updateData = req.body;

    if (isNaN(postId)) {
      res.status(400).json({
        success: false,
        message: '无效的帖子ID'
      });
      return;
    }

    // 防止用户修改点赞数和评论数
    delete updateData.likes_count;
    delete updateData.comments_count;

    const success = await postService.updatePost(postId, userId, updateData);

    if (!success) {
      res.status(403).json({
        success: false,
        message: '您无权更新该帖子或帖子不存在'
      });
      return;
    }

    // 如果有图片数据，更新图片（这里简化处理，实际可能需要先删除旧图片再添加新图片）
    if (
      updateData.images &&
      Array.isArray(updateData.images) &&
      updateData.images.length > 0
    ) {
      await postService.addPostImages(postId, userId, updateData.images);
    }

    res.status(200).json({
      success: true,
      message: '帖子更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `更新帖子失败: ${error.message}`
    });
  }
};

/**
 * 删除帖子
 */
export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
      res.status(400).json({
        success: false,
        message: '无效的帖子ID'
      });
      return;
    }

    const success = await postService.deletePost(postId, userId);

    if (!success) {
      res.status(403).json({
        success: false,
        message: '您无权删除该帖子或帖子不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: '帖子删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `删除帖子失败: ${error.message}`
    });
  }
};

/**
 * 点赞帖子
 */
export const likePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
      res.status(400).json({
        success: false,
        message: '无效的帖子ID'
      });
      return;
    }

    const success = await postService.likePost(postId, userId);

    if (!success) {
      res.status(404).json({
        success: false,
        message: '帖子不存在或未通过审核'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: '点赞成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `点赞失败: ${error.message}`
    });
  }
};

/**
 * 取消点赞
 */
export const unlikePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
      res.status(400).json({
        success: false,
        message: '无效的帖子ID'
      });
      return;
    }

    await postService.unlikePost(postId, userId);

    res.status(200).json({
      success: true,
      message: '取消点赞成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `取消点赞失败: ${error.message}`
    });
  }
};

/**
 * 评论帖子
 */
export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.postId);
    const { content, parent_id } = req.body;

    if (isNaN(postId)) {
      res.status(400).json({
        success: false,
        message: '无效的帖子ID'
      });
      return;
    }

    if (!content) {
      res.status(400).json({
        success: false,
        message: '评论内容不能为空'
      });
      return;
    }

    const commentId = await postService.addComment(
      postId,
      userId,
      content,
      parent_id ? Number(parent_id) : undefined
    );

    res.status(201).json({
      success: true,
      data: { id: commentId },
      message: '评论发布成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `发布评论失败: ${error.message}`
    });
  }
};

/**
 * 获取帖子评论
 */
export const getPostComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
      res.status(400).json({
        success: false,
        message: '无效的帖子ID'
      });
      return;
    }

    const comments = await postService.getPostComments(postId);

    res.status(200).json({
      success: true,
      data: comments,
      message: '获取评论成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `获取评论失败: ${error.message}`
    });
  }
};

/**
 * 上传帖子图片
 * 使用图片上传中间件处理实际的文件上传
 * 接受通过表单上传的图片文件或JSON中的图片URL数组
 */
export const uploadImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { post_id } = req.body;

    // 验证参数
    if (!post_id) {
      res.status(400).json({
        success: false,
        message: '参数错误：缺少帖子ID'
      });
      return;
    }

    // 检查是否有处理好的图片数据
    // 这些数据由processUploadedImages中间件提供
    if (
      !req.body.images ||
      !Array.isArray(req.body.images) ||
      req.body.images.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: '参数错误：缺少图片数据或未上传图片'
      });
      return;
    }

    const postId = Number(post_id);

    if (isNaN(postId)) {
      res.status(400).json({
        success: false,
        message: '无效的帖子ID'
      });
      return;
    }

    // 保存图片元数据到数据库
    const success = await postService.addPostImages(
      postId,
      userId,
      req.body.images
    );

    if (!success) {
      res.status(403).json({
        success: false,
        message: '您无权为该帖子上传图片或帖子不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { images: req.body.images },
      message: '图片上传成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `上传图片失败: ${error.message}`
    });
  }
};
