// 错误处理中间件
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .error(
      process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
      500
    );
};

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
