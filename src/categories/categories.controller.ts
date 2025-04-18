import { Request, Response, NextFunction } from 'express';
import * as categoryService from './categories.service';

/**
 * 获取所有运动类别
 */
export const getAllCategories = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const result = await categoryService.getAllCategories();
    if (result.success) {
      response.status(200).send(result);
    } else {
      throw new Error(`${result.message}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 批量获取类别详情
 */
export const getBatchCategories = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { categoryIds } = request.query;

  if (!categoryIds) {
    return next(new Error('类别ID列表不能为空'));
  }

  try {
    // 将逗号分隔的ID转换为数组并解析为整数
    const idArray = (categoryIds as string)
      .split(',')
      .map((id) => parseInt(id.trim(), 10));

    // 过滤掉无效的ID
    const validIds = idArray.filter((id) => !isNaN(id));

    if (validIds.length === 0) {
      return next(new Error('没有提供有效的类别ID'));
    }

    // 获取批量类别结果
    const promises = validIds.map((id) => categoryService.getCategoryById(id));
    const results = await Promise.all(promises);

    // 筛选出成功获取的类别
    const categories = results
      .filter((result) => result.success)
      .map((result) => result.data);

    response.status(200).send({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建运动类别（管理员）
 */
export const createCategory = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { name, description, icon_url } = request.body;

  if (!name) {
    return next(new Error('类别名称不能为空'));
  }

  try {
    const result = await categoryService.createCategory({
      name,
      description,
      icon_url
    });
    if (result.success) {
      response.status(201).send(result);
    } else {
      throw new Error(`${result.message}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 更新运动类别（管理员）
 */
export const updateCategory = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { categoryId } = request.params;
  const { name, description, icon_url } = request.body;

  if (!categoryId) {
    return next(new Error('类别ID不能为空'));
  }

  try {
    const result = await categoryService.updateCategory(
      parseInt(categoryId, 10),
      { name, description, icon_url }
    );
    if (result.success) {
      response.status(200).send(result);
    } else {
      throw new Error(`${result.message}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 用户关注类别
 */
export const followCategory = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const userId = request.user.id;
  const { categoryId } = request.body;

  if (!categoryId) {
    return next(new Error('类别ID不能为空'));
  }

  try {
    const result = await categoryService.followCategory(
      userId,
      parseInt(categoryId, 10)
    );
    if (result.success) {
      response.status(200).send(result);
    } else {
      throw new Error(`${result.message}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 用户取消关注类别
 */
export const unfollowCategory = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const userId = request.user.id;
  const { categoryId } = request.params;

  if (!categoryId) {
    return next(new Error('类别ID不能为空'));
  }

  try {
    const result = await categoryService.unfollowCategory(
      userId,
      parseInt(categoryId, 10)
    );
    if (result.success) {
      response.status(200).send(result);
    } else {
      throw new Error(`${result.message}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户关注的类别
 */
export const getUserCategories = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const userId = request.user.id;

  try {
    const result = await categoryService.getUserCategories(userId);
    if (result.success) {
      response.status(200).send(result);
    } else {
      throw new Error(`${result.message}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 用户批量关注类别
 */
export const followBatchCategories = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const userId = request.user.id;
  const { categoryIds } = request.body;

  if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
    return next(new Error('类别ID数组不能为空'));
  }

  // 将所有ID转换为整数
  const validIds = categoryIds
    .map((id) => parseInt(id, 10))
    .filter((id) => !isNaN(id));

  if (validIds.length === 0) {
    return next(new Error('没有提供有效的类别ID'));
  }

  try {
    const result = await categoryService.followBatchCategories(
      userId,
      validIds
    );
    if (result.success) {
      response.status(200).send(result);
    } else {
      throw new Error(`${result.message}`);
    }
  } catch (error) {
    next(error);
  }
};
