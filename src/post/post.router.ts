import express from 'express';
import * as postController from './post.controller';
import { authGuard } from '../user/user.middleware';
import { upload, processUploadedImages } from '../app/app.middleware';

const router = express.Router();

/**
 * 帖子相关路由
 */

// 创建帖子
router.post('/api/posts', authGuard, postController.createPost);

// 获取帖子列表
router.get('/api/posts', authGuard, postController.getPosts);

// 获取用户点赞过的帖子列表 - 需要放在带参数路由之前
router.get(
  '/api/user/liked-posts',
  authGuard,
  postController.getUserLikedPosts
);

// 获取帖子详情 - 可选认证，用于记录是否已点赞
router.get('/api/posts/:postId', authGuard, postController.getPostById);

// 更新帖子
router.put('/api/posts/:postId', authGuard, postController.updatePost);

// 删除帖子
router.delete('/api/posts/:postId', authGuard, postController.deletePost);

// 点赞帖子
router.post('/api/posts/:postId/like', authGuard, postController.likePost);

// 取消点赞帖子
router.delete('/api/posts/:postId/like', authGuard, postController.unlikePost);

// 获取帖子评论
router.get(
  '/api/posts/:postId/comments',
  authGuard,
  postController.getPostComments
);

// 获取单条评论详情
router.get(
  '/api/comments/:commentId',
  authGuard,
  postController.getCommentById
);

// 评论帖子
router.post(
  '/api/posts/:postId/comments',
  authGuard,
  postController.addComment
);

// 上传帖子图片
router.post(
  '/api/upload/images',
  authGuard,
  upload.array('files', 10), // 最多上传10张图片
  processUploadedImages,
  postController.uploadImages
);

export default router;
