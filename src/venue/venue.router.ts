import express from 'express';
import * as venueController from './venue.controller';
import { authGuard } from '../user/user.middleware';

const router = express.Router();

/**
 * 场地分享路由
 */

// 创建场地信息
router.post('/api/venues', authGuard, venueController.createVenue);

// 获取场地列表
router.get('/api/venues', venueController.getVenues);

// 获取附近场地（需要放在带参数路由前面）
router.get('/api/venues/nearby', venueController.getNearbyVenues);

// 获取场地详情
router.get('/api/venues/:venueId', venueController.getVenueById);

// 更新场地信息
router.put('/api/venues/:venueId', authGuard, venueController.updateVenue);

// 更新场地营业时间
router.put(
  '/api/venues/:venueId/openingHours',
  authGuard,
  venueController.updateOpeningHours
);

// 删除场地信息
router.delete('/api/venues/:venueId', authGuard, venueController.deleteVenue);

export default router;
