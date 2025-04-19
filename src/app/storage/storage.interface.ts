/**
 * 图片存储服务接口
 * 定义通用的图片存储行为，便于不同存储实现之间的切换
 */
export interface IImageStorage {
  /**
   * 上传图片
   * @param file 图片文件
   * @param filename 可选的自定义文件名
   * @returns 返回可访问的图片URL
   */
  uploadImage(file: Buffer, filename?: string): Promise<string>;

  /**
   * 删除图片
   * @param imageUrl 图片URL
   * @returns 删除是否成功
   */
  deleteImage(imageUrl: string): Promise<boolean>;

  /**
   * 获取图片URL
   * @param storagePath 图片在存储系统中的路径
   * @returns 完整的图片URL
   */
  getImageUrl(storagePath: string): string;
}
