import { Request, Response, NextFunction } from 'express';
import * as categoryService from './categories.service';
import { CategoryModel } from './categories.model';

// 扩展Express请求类型
declare global {
  namespace Express {
    interface Request {
      category?: CategoryModel;
    }
  }
}

/**
 * 验证类别ID是否存在
 */
export const validateCategoryExists = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 从请求体或参数中获取类别ID
  const categoryId = request.body.categoryId || request.params.categoryId;

  if (!categoryId) {
    return next(new Error('类别ID不能为空'));
  }

  try {
    const result = await categoryService.getCategoryById(
      parseInt(categoryId, 10)
    );

    if (!result.success) {
      return next(new Error(result.message));
    }

    // 在请求中存储类别信息，以便后续使用
    request.category = result.data;

    // 继续下一步
    next();
  } catch (error) {
    next(error);
  }
};
