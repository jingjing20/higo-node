import { IImageStorage } from './storage.interface';
import { LocalImageStorage } from './local.storage';
import { CloudImageStorage } from './cloud.storage';

/**
 * 存储类型枚举
 */
export enum StorageType {
  LOCAL = 'local',
  CLOUD = 'cloud'
}

/**
 * 存储服务工厂
 * 根据配置创建适当的存储服务实例
 */
export class StorageFactory {
  /**
   * 创建存储服务实例
   * @param type 存储类型
   * @param config 存储配置
   * @returns 存储服务实例
   */
  static createStorage(type: StorageType, config?: any): IImageStorage {
    switch (type) {
      case StorageType.CLOUD:
        return new CloudImageStorage(config);
      case StorageType.LOCAL:
      default:
        return new LocalImageStorage(config?.uploadDir, config?.serverUrl);
    }
  }
}

// 导出所有存储相关类型
export * from './storage.interface';
export * from './local.storage';
export * from './cloud.storage';

// 创建默认存储实例
// 从环境变量获取存储类型，默认为本地存储
const storageType =
  (process.env.STORAGE_TYPE as StorageType) || StorageType.LOCAL;

// 创建并导出默认存储实例
export const storage = StorageFactory.createStorage(storageType, {
  // 本地存储配置
  uploadDir: process.env.LOCAL_UPLOAD_DIR || 'uploads/images',
  serverUrl: process.env.LOCAL_SERVER_URL || 'http://localhost:3000',

  // 云存储配置 (仅在选择云存储时使用)
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  region: process.env.OSS_REGION,
  cdnDomain: process.env.OSS_CDN_DOMAIN
});
