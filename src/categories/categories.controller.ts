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
