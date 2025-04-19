import { IImageStorage } from './storage.interface';

/**
 * 云存储实现示例 (阿里云OSS)
 * 注意: 这是一个示例实现，需要安装实际的OSS SDK才能使用
 * npm install ali-oss
 */
export class CloudImageStorage implements IImageStorage {
  private client: any; // OSS客户端
  private bucket: string;
  private region: string;
  private cdnDomain?: string;

  /**
   * 初始化云存储客户端
   * @param config 云存储配置
   */
  constructor(config: {
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    region: string;
    cdnDomain?: string;
  }) {
    this.bucket = config.bucket;
    this.region = config.region;
    this.cdnDomain = config.cdnDomain;

    // 这里需要实际安装ali-oss包才能使用
    /*
    const OSS = require('ali-oss');
    this.client = new OSS({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
      region: config.region,
    });
    */

    // 为演示目的创建一个模拟客户端
    this.client = {
      put: async (objectName: string, file: Buffer) => {
        console.log(`[模拟] 上传文件到OSS: ${objectName}`);
        return { url: this.getImageUrl(objectName) };
      },
      delete: async (objectName: string) => {
        console.log(`[模拟] 从OSS删除文件: ${objectName}`);
        return true;
      }
    };
  }

  /**
   * 上传图片到云存储
   */
  async uploadImage(file: Buffer, filename?: string): Promise<string> {
    // 生成唯一的对象名称
    const objectName =
      filename ||
      `images/${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    try {
      // 上传文件到OSS
      const result = await this.client.put(objectName, file);
      return result.url;
    } catch (error) {
      console.error(`上传图片到云存储失败: ${error.message}`);
      throw new Error(`上传图片到云存储失败: ${error.message}`);
    }
  }

  /**
   * 从云存储删除图片
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // 从URL提取对象名称
      const objectName = this.getObjectNameFromUrl(imageUrl);

      // 删除对象
      await this.client.delete(objectName);
      return true;
    } catch (error) {
      console.error(`从云存储删除图片失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取完整的图片URL
   */
  getImageUrl(objectName: string): string {
    // 如果配置了CDN域名，则使用CDN域名
    if (this.cdnDomain) {
      return `https://${this.cdnDomain}/${objectName}`;
    }

    // 否则使用OSS默认域名
    return `https://${this.bucket}.${this.region}.aliyuncs.com/${objectName}`;
  }

  /**
   * 从URL中提取对象名称
   */
  private getObjectNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // 移除开头的斜杠
      return urlObj.pathname.replace(/^\//, '');
    } catch (error) {
      // 如果URL解析失败，尝试直接提取路径部分
      const parts = url.split('/');
      return parts.slice(3).join('/');
    }
  }
}
