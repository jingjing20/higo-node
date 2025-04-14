import { Request, Response, NextFunction } from 'express';

/**
 * 接口耗时统计中间件
 */
export const requestTimeLogger = (req, res, next) => {
  // 记录请求开始时间
  const startTime = process.hrtime();

  // 记录当前请求方法和URL
  const { method, originalUrl, ip } = req;

  // 在响应结束时计算并打印耗时
  res.on('finish', () => {
    // 计算耗时（纳秒转换为毫秒）
    const hrtime = process.hrtime(startTime);
    const duration = hrtime[0] * 1000 + hrtime[1] / 1000000;

    // 获取响应状态码
    const statusCode = res.statusCode;

    // 获取内容长度
    const contentLength = res.get('content-length') || '-';

    // 为状态码添加颜色
    let statusStr = statusCode.toString();
    if (statusCode >= 500)
      statusStr = `\x1b[31m${statusCode}\x1b[0m`; // 红色
    else if (statusCode >= 400)
      statusStr = `\x1b[33m${statusCode}\x1b[0m`; // 黄色
    else if (statusCode >= 300)
      statusStr = `\x1b[36m${statusCode}\x1b[0m`; // 青色
    else if (statusCode >= 200) statusStr = `\x1b[32m${statusCode}\x1b[0m`; // 绿色

    // 为耗时添加颜色
    let durationStr = duration.toFixed(2) + 'ms';
    if (duration > 1000)
      durationStr = `\x1b[31m${durationStr}\x1b[0m`; // 红色
    else if (duration > 500)
      durationStr = `\x1b[33m${durationStr}\x1b[0m`; // 黄色
    else if (duration > 100)
      durationStr = `\x1b[36m${durationStr}\x1b[0m`; // 青色
    else durationStr = `\x1b[32m${durationStr}\x1b[0m`; // 绿色

    // 为HTTP方法添加颜色
    let methodColored = method;
    switch (method) {
      case 'GET':
        methodColored = `\x1b[34m${method}\x1b[0m`;
        break; // 蓝色
      case 'POST':
        methodColored = `\x1b[32m${method}\x1b[0m`;
        break; // 绿色
      case 'PUT':
        methodColored = `\x1b[33m${method}\x1b[0m`;
        break; // 黄色
      case 'DELETE':
        methodColored = `\x1b[31m${method}\x1b[0m`;
        break; // 红色
      case 'PATCH':
        methodColored = `\x1b[35m${method}\x1b[0m`;
        break; // 紫色
    }

    // 打印请求信息和耗时
    console.log(
      `${methodColored.padEnd(7)} ${originalUrl} - ${statusStr} - ${durationStr} - ${contentLength}b - ${ip}`
    );

    // 以JSON格式打印请求信息（可选）
    if (process.env.NODE_ENV === 'development' && req.method !== 'GET') {
      const bodyStr =
        Object.keys(req.body || {}).length > 0
          ? JSON.stringify(req.body)
          : '{}';
      console.log(
        `  Body: ${bodyStr.length > 100 ? bodyStr.substring(0, 100) + '...' : bodyStr}`
      );
    }
  });

  // 继续处理请求
  next();
};

/**
 * 统一响应数据格式中间件
 * 格式: {success: true, data: { "xxx": "xxx" }, message: "xxx"}
 */
export const responseFormatter = (req, res, next) => {
  // 保存原始的方法
  const originalJson = res.json;
  const originalSend = res.send;

  // 重写json方法
  res.json = function (data) {
    const formattedData = {
      success: data.success,
      message: data.message || '操作成功',
      data: data.data || {}
    };

    return originalJson.call(this, formattedData);
  };

  // 重写send方法
  res.send = function (data) {
    // 如果不是对象类型，则直接发送（如文件下载等情况）
    if (typeof data !== 'object' || data === null) {
      return originalSend.call(this, data);
    }

    // 否则格式化数据
    const formattedData = {
      success: data.success,
      message: data.message || '操作成功',
      data: data.data || {}
    };

    return originalSend.call(this, formattedData);
  };

  next();
};

/**
 * 默认异常处理器
 */
export const defaultErrorHandler = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (error.message) {
    console.log('🚧', error.message);
  }

  let statusCode: number, message: string;

  /**
   * 处理异常
   */
  switch (error.message) {
    case 'INVALID_USERNAME':
      statusCode = 400;
      message = '用户名错误';
      break;
    case 'USER_NOT_FOUND':
      statusCode = 400;
      message = '用户不存在';
      break;
    case 'EMAIL_ALREADY_EXISTS':
      statusCode = 400;
      message = '邮箱已存在';
      break;
    case 'INVALID_PASSWORD':
      statusCode = 400;
      message = '密码错误';
      break;
    case 'INVALID_TOKEN':
      statusCode = 401;
      message = '无效的令牌';
      break;
    case 'TOKEN_EXPIRED':
      statusCode = 401;
      message = '令牌已过期';
      break;
    case 'REFRESH_TOKEN_EXPIRED':
      statusCode = 401;
      message = '刷新令牌已过期';
      break;
    case 'PASSWORD_RESET_TOKEN_EXPIRED':
      statusCode = 401;
      message = '密码重置令牌已过期';
      break;
    case 'INVALID_EMAIL':
      statusCode = 400;
      message = '无效的邮箱';
      break;
    case 'INVALID_PASSWORD':
      statusCode = 400;
      message = '密码错误';
      break;
  }

  response.json({ success: false, code: statusCode, message });
};
