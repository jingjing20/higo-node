import express from 'express';
import cors from 'cors';
import userRouter from '../user/user.router';
import emailRouter from '../email/email.router';
import categoryRouter from '../categories/categories.router';
import postRouter from '../post/post.router';
import venueRouter from '../venue/venue.router';
import notificationRouter from '../notification/notification.router';
import {
  requestTimeLogger,
  responseFormatter,
  defaultErrorHandler
} from './app.middleware';
import { ALLOW_ORIGIN } from './app.config';
import helmet from 'helmet';
import path from 'path';

/**
 * 创建应用
 */
const app = express();

/**
 * 安全相关设置
 */
app.use(helmet());

/**
 * 跨域资源共享
 */
app.use(
  cors({
    origin: ALLOW_ORIGIN,
    exposedHeaders: 'X-Total-Count'
  })
);

/**
 * 处理 JSON
 */
app.use(express.json());

/**
 * 处理 XML
 */
app.use(express.text({ type: 'text/xml' }));

/**
 * 处理 Form
 */
app.use(express.urlencoded({ extended: true }));

/**
 * 请求耗时统计中间件
 */
app.use(requestTimeLogger);

/**
 * 响应格式化中间件
 */
app.use(responseFormatter);

/**
 * 静态资源服务
 */
app.use(
  '/uploads/images',
  express.static(path.join(process.cwd(), 'uploads/images'), {
    maxAge: 24 * 60 * 60 * 1000
  })
);

/**
 * 路由
 */
app.use(userRouter);
app.use(emailRouter);
app.use(categoryRouter);
app.use(postRouter);
app.use(venueRouter);
app.use(notificationRouter);

/**
 * 应用错误处理中间件
 */
app.use(defaultErrorHandler);

/**
 * 导出应用
 */
export default app;
