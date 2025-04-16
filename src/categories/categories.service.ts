import { CategoryModel } from './categories.model';
import { queryAsync } from '../app/database/database.utils';

/**
 * 获取所有运动类别
 */
export const getAllCategories = async () => {
  try {
    const categories = await queryAsync(
      'SELECT * FROM categories ORDER BY name'
    );

    return {
      success: true,
      data: categories
    };
  } catch (error) {
    console.error('获取运动类别失败:', error);
    return { success: false, message: '获取运动类别失败' };
  }
};

/**
 * 获取特定运动类别
 */
export const getCategoryById = async (categoryId: number) => {
  try {
    const categories = await queryAsync(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );

    if (!categories || categories.length === 0) {
      return { success: false, message: '该运动类别不存在' };
    }

    return {
      success: true,
      data: categories[0]
    };
  } catch (error) {
    console.error('获取运动类别详情失败:', error);
    return { success: false, message: '获取运动类别详情失败' };
  }
};

/**
 * 创建运动类别
 */
export const createCategory = async (category: CategoryModel) => {
  const { name, description, icon_url } = category;

  try {
    // 检查类别名称是否已存在
    const existingCategories = await queryAsync(
      'SELECT * FROM categories WHERE name = ?',
      [name]
    );

    if (existingCategories && existingCategories.length > 0) {
      return { success: false, message: '该类别名称已存在' };
    }

    // 创建新类别
    const result = await queryAsync(
      `INSERT INTO categories (name, description, icon_url)
       VALUES (?, ?, ?)`,
      [name, description, icon_url]
    );

    return {
      success: true,
      message: '创建类别成功',
      data: { id: result.insertId, name, description, icon_url }
    };
  } catch (error) {
    console.error('创建运动类别失败:', error);
    return { success: false, message: '创建运动类别失败' };
  }
};

/**
 * 更新运动类别
 */
export const updateCategory = async (
  categoryId: number,
  category: CategoryModel
) => {
  const { name, description, icon_url } = category;

  try {
    // 检查类别是否存在
    const categoryExists = await getCategoryById(categoryId);
    if (!categoryExists.success) {
      return categoryExists;
    }

    // 如果更新名称，检查新名称是否与其他类别冲突
    if (name) {
      const existingCategories = await queryAsync(
        'SELECT * FROM categories WHERE name = ? AND id != ?',
        [name, categoryId]
      );

      if (existingCategories && existingCategories.length > 0) {
        return { success: false, message: '该类别名称已被使用' };
      }
    }

    // 构建更新查询
    let updateFields = [];
    let updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (icon_url !== undefined) {
      updateFields.push('icon_url = ?');
      updateValues.push(icon_url);
    }

    // 如果没有要更新的字段
    if (updateFields.length === 0) {
      return { success: false, message: '没有提供要更新的字段' };
    }

    // 添加类别ID到更新值数组
    updateValues.push(categoryId);

    // 执行更新
    await queryAsync(
      `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // 获取更新后的类别
    return await getCategoryById(categoryId);
  } catch (error) {
    console.error('更新运动类别失败:', error);
    return { success: false, message: '更新运动类别失败' };
  }
};

/**
 * 用户关注类别
 */
export const followCategory = async (userId: number, categoryId: number) => {
  try {
    // 检查类别是否存在
    const categoryExists = await getCategoryById(categoryId);
    if (!categoryExists.success) {
      return categoryExists;
    }

    // 检查是否已关注
    const existingRelations = await queryAsync(
      'SELECT * FROM user_categories WHERE user_id = ? AND category_id = ?',
      [userId, categoryId]
    );

    if (existingRelations && existingRelations.length > 0) {
      return { success: false, message: '您已关注该类别' };
    }

    // 添加关注关系
    await queryAsync(
      'INSERT INTO user_categories (user_id, category_id) VALUES (?, ?)',
      [userId, categoryId]
    );

    return { success: true, message: '成功关注类别' };
  } catch (error) {
    console.error('关注类别失败:', error);
    return { success: false, message: '关注类别失败' };
  }
};

/**
 * 用户取消关注类别
 */
export const unfollowCategory = async (userId: number, categoryId: number) => {
  try {
    // 检查类别是否存在
    const categoryExists = await getCategoryById(categoryId);
    if (!categoryExists.success) {
      return categoryExists;
    }

    // 检查是否已关注
    const existingRelations = await queryAsync(
      'SELECT * FROM user_categories WHERE user_id = ? AND category_id = ?',
      [userId, categoryId]
    );

    if (!existingRelations || existingRelations.length === 0) {
      return { success: false, message: '您未关注该类别' };
    }

    // 删除关注关系
    await queryAsync(
      'DELETE FROM user_categories WHERE user_id = ? AND category_id = ?',
      [userId, categoryId]
    );

    return { success: true, message: '成功取消关注类别' };
  } catch (error) {
    console.error('取消关注类别失败:', error);
    return { success: false, message: '取消关注类别失败' };
  }
};

/**
 * 获取用户关注的所有类别
 */
export const getUserCategories = async (userId: number) => {
  try {
    const categories = await queryAsync(
      `SELECT c.* FROM categories c
       INNER JOIN user_categories uc ON c.id = uc.category_id
       WHERE uc.user_id = ?
       ORDER BY c.name`,
      [userId]
    );

    return {
      success: true,
      data: categories
    };
  } catch (error) {
    console.error('获取用户关注类别失败:', error);
    return { success: false, message: '获取用户关注类别失败' };
  }
};
