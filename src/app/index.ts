import express from 'express';
import cors from 'cors';
import userRouter from '../user/user.router';
import emailRouter from '../email/email.router';
import categoryRouter from '../categories/categories.router';
import {
  requestTimeLogger,
  responseFormatter,
  defaultErrorHandler
} from './app.middleware';
import { ALLOW_ORIGIN } from './app.config';

/**
 * 创建应用
 */
const app = express();

/**
 * 请求耗时统计中间件（最先注册，以便记录完整请求时间）
 */
app.use(requestTimeLogger);

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
 * 响应格式化中间件（在路由之前注册）
 */
app.use(responseFormatter);

/**
 * 路由
 */
app.use(userRouter);
app.use(emailRouter);
app.use(categoryRouter);

/**
 * 应用错误处理中间件（在路由之后）
 */
app.use(defaultErrorHandler);

/**
 * 导出应用
 */
export default app;
