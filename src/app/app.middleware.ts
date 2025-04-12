// middleware/responseFormatter.js
export const responseFormatter = () => {
  return (req, res, next) => {
    // 成功响应方法
    res.success = (data = {}, code = 0) => {
      res.status(200).json({
        code,
        success: true,
        data
      });
    };

    // 失败响应方法
    res.error = (message, code = 1, httpStatus = 200) => {
      res.status(httpStatus).json({
        code,
        success: false,
        message: message || '请求处理失败'
      });
    };

    // 包装原始json方法
    const originalJson = res.json;
    res.json = (body) => {
      if (!res.headersSent) {
        // 自动识别普通响应
        if (body instanceof Error) {
          originalJson.call(res, { ...body, success: false });
        } else {
          originalJson.call(res, { ...body, success: true });
        }

        if (body instanceof Error) {
          originalJson.call(res, {
            code: 500,
            success: false,
            message: body.message
          });
        } else {
          originalJson.call(res, {
            code: res.statusCode === 200 ? 0 : res.statusCode,
            success: res.statusCode === 200,
            data: body
          });
        }
      }
    };

    next();
  };
};

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
