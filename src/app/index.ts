import express from 'express';
import cors from 'cors';
import userRouter from '../user/user.router';
import { responseFormatter, errorHandler } from './app.middleware';
import { ALLOW_ORIGIN } from './app.config';

/**
 * 创建应用
 */
const app = express();

/**
 * 应用中间件（在路由之前）
 */
app.use(responseFormatter());

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
 * 跨域资源共享
 */
app.use(
  cors({
    origin: ALLOW_ORIGIN,
    exposedHeaders: 'X-Total-Count'
  })
);

/**
 * 路由
 */
app.use(userRouter);

/**
 * 应用错误处理中间件（在路由之后）
 */
app.use(errorHandler);
/**
 * 导出应用
 */
export default app;
