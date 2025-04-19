import { Request, Response } from 'express';
import * as venueService from './venue.service';

/**
 * 创建场地
 */
export const createVenue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const venueData = req.body;

    // 验证场地数据
    if (
      !venueData.name ||
      !venueData.address ||
      !venueData.longitude ||
      !venueData.latitude
    ) {
      res.status(400).json({
        success: false,
        message: '场地名称、地址和位置信息不能为空'
      });
      return;
    }

    // 默认为待审核状态
    if (venueData.is_approved === undefined) {
      venueData.is_approved = 0;
    }

    const venueId = await venueService.createVenue(userId, venueData);

    // 如果有图片数据，保存图片
    if (
      venueData.images &&
      Array.isArray(venueData.images) &&
      venueData.images.length > 0
    ) {
      await venueService.addVenueImages(venueId, userId, venueData.images);
    }

    // 如果有营业时间数据，保存营业时间
    if (
      venueData.opening_hours &&
      Array.isArray(venueData.opening_hours) &&
      venueData.opening_hours.length > 0
    ) {
      await venueService.updateVenueOpeningHours(
        venueId,
        userId,
        venueData.opening_hours
      );
    }

    res.status(201).json({
      success: true,
      data: { id: venueId },
      message: '场地创建成功，等待审核'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `创建场地失败: ${error.message}`
    });
  }
};

/**
 * 获取场地列表
 */
export const getVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      category_id,
      user_id,
      is_free,
      crowd_level
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      categoryId: category_id ? Number(category_id) : undefined,
      userId: user_id ? Number(user_id) : undefined,
      isFree: is_free ? is_free === 'true' : undefined,
      crowdLevel: crowd_level as string
    };

    const venues = await venueService.getVenues(options);

    // 为每个场地获取图片
    const venuesWithImages = await Promise.all(
      venues.map(async (venue) => {
        const images = await venueService.getVenueImages(venue.id);
        return { ...venue, images };
      })
    );

    res.status(200).json({
      success: true,
      data: venuesWithImages,
      message: '获取场地列表成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `获取场地列表失败: ${error.message}`
    });
  }
};

/**
 * 获取附近场地
 */
export const getNearbyVenues = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      latitude,
      longitude,
      distance = 5,
      page = 1,
      limit = 10,
      category_id
    } = req.query;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: '位置信息不能为空'
      });
      return;
    }

    const options = {
      page: Number(page),
      limit: Number(limit),
      categoryId: category_id ? Number(category_id) : undefined,
      latitude: Number(latitude),
      longitude: Number(longitude),
      distance: Number(distance)
    };

    const venues = await venueService.getVenues(options);

    // 为每个场地获取图片
    const venuesWithImages = await Promise.all(
      venues.map(async (venue) => {
        const images = await venueService.getVenueImages(venue.id);
        return { ...venue, images };
      })
    );

    res.status(200).json({
      success: true,
      data: venuesWithImages,
      message: '获取附近场地成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `获取附近场地失败: ${error.message}`
    });
  }
};

/**
 * 获取场地详情
 */
export const getVenueById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const venueId = Number(req.params.venueId);

    if (isNaN(venueId)) {
      res.status(400).json({
        success: false,
        message: '无效的场地ID'
      });
      return;
    }

    const venue = await venueService.getVenueById(venueId);

    if (!venue) {
      res.status(404).json({
        success: false,
        message: '场地不存在或未通过审核'
      });
      return;
    }

    // 获取场地图片
    const images = await venueService.getVenueImages(venueId);

    // 获取场地营业时间
    const openingHours = await venueService.getVenueOpeningHours(venueId);

    res.status(200).json({
      success: true,
      data: { ...venue, images, opening_hours: openingHours },
      message: '获取场地详情成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `获取场地详情失败: ${error.message}`
    });
  }
};

/**
 * 更新场地
 */
export const updateVenue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const venueId = Number(req.params.venueId);
    const updateData = req.body;

    if (isNaN(venueId)) {
      res.status(400).json({
        success: false,
        message: '无效的场地ID'
      });
      return;
    }

    const success = await venueService.updateVenue(venueId, userId, updateData);

    if (!success) {
      res.status(403).json({
        success: false,
        message: '您无权更新该场地或场地不存在'
      });
      return;
    }

    // 如果有图片数据，更新图片
    if (
      updateData.images &&
      Array.isArray(updateData.images) &&
      updateData.images.length > 0
    ) {
      await venueService.addVenueImages(venueId, userId, updateData.images);
    }

    // 如果有营业时间数据，更新营业时间
    if (
      updateData.opening_hours &&
      Array.isArray(updateData.opening_hours) &&
      updateData.opening_hours.length > 0
    ) {
      await venueService.updateVenueOpeningHours(
        venueId,
        userId,
        updateData.opening_hours
      );
    }

    res.status(200).json({
      success: true,
      message: '场地更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `更新场地失败: ${error.message}`
    });
  }
};

/**
 * 删除场地
 */
export const deleteVenue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const venueId = Number(req.params.venueId);

    if (isNaN(venueId)) {
      res.status(400).json({
        success: false,
        message: '无效的场地ID'
      });
      return;
    }

    const success = await venueService.deleteVenue(venueId, userId);

    if (!success) {
      res.status(403).json({
        success: false,
        message: '您无权删除该场地或场地不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: '场地删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `删除场地失败: ${error.message}`
    });
  }
};

/**
 * 更新场地营业时间
 */
export const updateOpeningHours = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const venueId = Number(req.params.venueId);
    const openingHours = req.body.opening_hours;

    if (isNaN(venueId)) {
      res.status(400).json({
        success: false,
        message: '无效的场地ID'
      });
      return;
    }

    if (!openingHours || !Array.isArray(openingHours)) {
      res.status(400).json({
        success: false,
        message: '营业时间数据格式不正确'
      });
      return;
    }

    const success = await venueService.updateVenueOpeningHours(
      venueId,
      userId,
      openingHours
    );

    if (!success) {
      res.status(403).json({
        success: false,
        message: '您无权更新该场地的营业时间或场地不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: '营业时间更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `更新营业时间失败: ${error.message}`
    });
  }
};
