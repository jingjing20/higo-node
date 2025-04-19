import { queryAsync } from '../app/database/database.utils';
import { Venue, VenueImage, VenueOpeningHours } from './venue.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * 创建场地信息
 * @param userId 用户ID
 * @param venue 场地数据
 * @returns 创建的场地ID
 */
export const createVenue = async (
  userId: number,
  venue: Omit<Venue, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<number> => {
  try {
    const result = (await queryAsync(
      `INSERT INTO venues
      (name, address, category_id, longitude, latitude, is_free,
      price_description, crowd_level, user_id, is_approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        venue.name,
        venue.address,
        venue.category_id || null,
        venue.longitude,
        venue.latitude,
        venue.is_free,
        venue.price_description || null,
        venue.crowd_level || null,
        userId,
        venue.is_approved
      ]
    )) as ResultSetHeader;

    return result.insertId;
  } catch (error) {
    throw new Error(`创建场地失败: ${error.message}`);
  }
};

/**
 * 获取场地列表
 * @param options 筛选条件
 * @returns 场地列表
 */
export const getVenues = async (options: {
  page?: number;
  limit?: number;
  categoryId?: number;
  userId?: number;
  isFree?: boolean;
  crowdLevel?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}): Promise<Venue[]> => {
  try {
    const {
      page = 1,
      limit = 10,
      categoryId,
      userId,
      isFree,
      crowdLevel,
      latitude,
      longitude,
      distance = 10 // 默认10公里范围
    } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        v.*,
        u.nickname as creator_name,
        u.avatar_url as creator_avatar
      FROM venues v
      JOIN users u ON v.user_id = u.id
      WHERE v.is_approved = 1
    `;

    const queryParams = [];

    if (categoryId) {
      query += ' AND v.category_id = ?';
      queryParams.push(categoryId);
    }

    if (userId) {
      query += ' AND v.user_id = ?';
      queryParams.push(userId);
    }

    if (isFree !== undefined) {
      query += ' AND v.is_free = ?';
      queryParams.push(isFree ? 1 : 0);
    }

    if (crowdLevel) {
      query += ' AND v.crowd_level = ?';
      queryParams.push(crowdLevel);
    }

    // 如果提供了经纬度，计算距离并筛选
    if (latitude && longitude) {
      // 使用 MySQL 的地理空间函数计算距离（单位：公里）
      query += `
        AND ST_Distance_Sphere(
          POINT(v.longitude, v.latitude),
          POINT(?, ?)
        ) <= ?
      `;
      queryParams.push(longitude, latitude, distance * 1000); // 转换为米

      // 按距离排序
      query += `
        ORDER BY ST_Distance_Sphere(
          POINT(v.longitude, v.latitude),
          POINT(?, ?)
        )
      `;
      queryParams.push(longitude, latitude);
    } else {
      // 默认按创建时间排序
      query += ' ORDER BY v.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const venues = (await queryAsync(query, queryParams)) as (Venue &
      RowDataPacket)[];

    return venues;
  } catch (error) {
    throw new Error(`获取场地列表失败: ${error.message}`);
  }
};

/**
 * 获取附近场地
 * @param latitude 纬度
 * @param longitude 经度
 * @param distance 距离（公里）
 * @param options 其他筛选条件
 * @returns 场地列表
 */
export const getNearbyVenues = async (
  latitude: number,
  longitude: number,
  distance: number = 5,
  options: {
    page?: number;
    limit?: number;
    categoryId?: number;
  } = {}
): Promise<Venue[]> => {
  return getVenues({
    ...options,
    latitude,
    longitude,
    distance
  });
};

/**
 * 获取场地详情
 * @param venueId 场地ID
 * @returns 场地详情
 */
export const getVenueById = async (venueId: number): Promise<Venue | null> => {
  try {
    const venues = (await queryAsync(
      `SELECT
        v.*,
        u.nickname as creator_name,
        u.avatar_url as creator_avatar
      FROM venues v
      JOIN users u ON v.user_id = u.id
      WHERE v.id = ? AND v.is_approved = 1`,
      [venueId]
    )) as (Venue & RowDataPacket)[];

    if (venues.length === 0) {
      return null;
    }

    return venues[0];
  } catch (error) {
    throw new Error(`获取场地详情失败: ${error.message}`);
  }
};

/**
 * 更新场地信息
 * @param venueId 场地ID
 * @param userId 用户ID（验证所有权）
 * @param data 更新数据
 */
export const updateVenue = async (
  venueId: number,
  userId: number,
  data: Partial<Venue>
): Promise<boolean> => {
  try {
    // 验证场地所有权
    const venues = (await queryAsync(
      'SELECT id FROM venues WHERE id = ? AND user_id = ?',
      [venueId, userId]
    )) as RowDataPacket[];

    if (venues.length === 0) {
      return false;
    }

    // 构建更新SQL
    const updates = [];
    const params = [];

    if (data.name) {
      updates.push('name = ?');
      params.push(data.name);
    }

    if (data.address) {
      updates.push('address = ?');
      params.push(data.address);
    }

    if (data.category_id) {
      updates.push('category_id = ?');
      params.push(data.category_id);
    }

    if (data.longitude) {
      updates.push('longitude = ?');
      params.push(data.longitude);
    }

    if (data.latitude) {
      updates.push('latitude = ?');
      params.push(data.latitude);
    }

    if (data.is_free !== undefined) {
      updates.push('is_free = ?');
      params.push(data.is_free);
    }

    if (data.price_description !== undefined) {
      updates.push('price_description = ?');
      params.push(data.price_description);
    }

    if (data.crowd_level) {
      updates.push('crowd_level = ?');
      params.push(data.crowd_level);
    }

    if (updates.length === 0) {
      return true; // 没有要更新的内容
    }

    // 添加参数
    params.push(venueId);

    // 执行更新
    await queryAsync(
      `UPDATE venues SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return true;
  } catch (error) {
    throw new Error(`更新场地失败: ${error.message}`);
  }
};

/**
 * 删除场地信息
 * @param venueId 场地ID
 * @param userId 用户ID（验证所有权）
 */
export const deleteVenue = async (
  venueId: number,
  userId: number
): Promise<boolean> => {
  try {
    // 验证场地所有权
    const venues = (await queryAsync(
      'SELECT id FROM venues WHERE id = ? AND user_id = ?',
      [venueId, userId]
    )) as RowDataPacket[];

    if (venues.length === 0) {
      return false;
    }

    // 开始事务
    await queryAsync('START TRANSACTION');

    try {
      // 删除场地相关数据
      await queryAsync('DELETE FROM venue_images WHERE venue_id = ?', [
        venueId
      ]);
      await queryAsync('DELETE FROM venue_opening_hours WHERE venue_id = ?', [
        venueId
      ]);
      await queryAsync('DELETE FROM venues WHERE id = ?', [venueId]);

      // 提交事务
      await queryAsync('COMMIT');
      return true;
    } catch (error) {
      // 回滚事务
      await queryAsync('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new Error(`删除场地失败: ${error.message}`);
  }
};

/**
 * 添加场地图片
 * @param venueId 场地ID
 * @param userId 用户ID（验证所有权）
 * @param images 图片信息数组
 */
export const addVenueImages = async (
  venueId: number,
  userId: number,
  images: { image_url: string; sequence_number: number }[]
): Promise<boolean> => {
  try {
    // 验证场地所有权
    const venues = (await queryAsync(
      'SELECT id FROM venues WHERE id = ? AND user_id = ?',
      [venueId, userId]
    )) as RowDataPacket[];

    if (venues.length === 0) {
      return false;
    }

    // 批量插入图片
    if (images.length > 0) {
      const values = images.map((img) => [
        venueId,
        img.image_url,
        img.sequence_number
      ]);
      await queryAsync(
        'INSERT INTO venue_images (venue_id, image_url, sequence_number) VALUES ?',
        [values]
      );
    }

    return true;
  } catch (error) {
    throw new Error(`上传场地图片失败: ${error.message}`);
  }
};

/**
 * 获取场地图片
 * @param venueId 场地ID
 */
export const getVenueImages = async (
  venueId: number
): Promise<VenueImage[]> => {
  try {
    const images = (await queryAsync(
      'SELECT * FROM venue_images WHERE venue_id = ? ORDER BY sequence_number',
      [venueId]
    )) as (VenueImage & RowDataPacket)[];

    return images;
  } catch (error) {
    throw new Error(`获取场地图片失败: ${error.message}`);
  }
};

/**
 * 更新场地营业时间
 * @param venueId 场地ID
 * @param userId 用户ID（验证所有权）
 * @param openingHours 营业时间数组
 */
export const updateVenueOpeningHours = async (
  venueId: number,
  userId: number,
  openingHours: Omit<
    VenueOpeningHours,
    'id' | 'venue_id' | 'created_at' | 'updated_at'
  >[]
): Promise<boolean> => {
  try {
    // 验证场地所有权
    const venues = (await queryAsync(
      'SELECT id FROM venues WHERE id = ? AND user_id = ?',
      [venueId, userId]
    )) as RowDataPacket[];

    if (venues.length === 0) {
      return false;
    }

    // 开始事务
    await queryAsync('START TRANSACTION');

    try {
      // 删除现有营业时间
      await queryAsync('DELETE FROM venue_opening_hours WHERE venue_id = ?', [
        venueId
      ]);

      // 插入新的营业时间
      if (openingHours.length > 0) {
        const values = openingHours.map((hour) => [
          venueId,
          hour.day_of_week,
          hour.open_time,
          hour.close_time
        ]);

        await queryAsync(
          `INSERT INTO venue_opening_hours
          (venue_id, day_of_week, open_time, close_time)
          VALUES ?`,
          [values]
        );
      }

      // 提交事务
      await queryAsync('COMMIT');
      return true;
    } catch (error) {
      // 回滚事务
      await queryAsync('ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new Error(`更新场地营业时间失败: ${error.message}`);
  }
};

/**
 * 获取场地营业时间
 * @param venueId 场地ID
 */
export const getVenueOpeningHours = async (
  venueId: number
): Promise<VenueOpeningHours[]> => {
  try {
    const openingHours = (await queryAsync(
      'SELECT * FROM venue_opening_hours WHERE venue_id = ? ORDER BY day_of_week',
      [venueId]
    )) as (VenueOpeningHours & RowDataPacket)[];

    return openingHours;
  } catch (error) {
    throw new Error(`获取场地营业时间失败: ${error.message}`);
  }
};
