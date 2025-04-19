import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { IImageStorage } from './storage.interface';

/**
 * 本地文件系统存储实现
 */
export class LocalImageStorage implements IImageStorage {
  private uploadDir: string;
  private serverUrl: string;
  private writeFileAsync = promisify(fs.writeFile);
  private unlinkAsync = promisify(fs.unlink);
  private mkdirAsync = promisify(fs.mkdir);

  /**
   * @param uploadDir 上传目录，相对于项目根目录
   * @param serverUrl 服务器URL，用于生成完整的图片URL
   */
  constructor(
    uploadDir = process.env.LOCAL_UPLOAD_DIR || 'uploads/images',
    serverUrl = process.env.LOCAL_SERVER_URL || 'http://localhost:3000'
  ) {
    this.uploadDir = uploadDir;
    this.serverUrl = serverUrl;
    this.ensureUploadDirExists();
  }

  /**
   * 确保上传目录存在
   */
  private async ensureUploadDirExists(): Promise<void> {
    const absolutePath = path.resolve(this.uploadDir);
    try {
      await fs.promises.access(absolutePath);
    } catch (error) {
      // 目录不存在，创建目录（递归创建）
      await this.mkdirAsync(absolutePath, { recursive: true });
      console.log(`创建目录: ${absolutePath}`);
    }
  }

  /**
   * 上传图片到本地文件系统
   */
  async uploadImage(file: Buffer, filename?: string): Promise<string> {
    // 确保上传目录存在
    await this.ensureUploadDirExists();

    // 生成唯一文件名，避免冲突
    const finalFilename =
      filename ||
      `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // 完整的文件保存路径
    const filePath = path.join(this.uploadDir, finalFilename);
    const absolutePath = path.resolve(filePath);

    // 保存文件
    await this.writeFileAsync(absolutePath, file);

    // 返回可访问的URL
    return this.getImageUrl(finalFilename);
  }

  /**
   * 从本地文件系统删除图片
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // 从URL中提取文件名
      const urlObj = new URL(imageUrl);
      const filename = path.basename(urlObj.pathname);

      // 完整的文件路径
      const filePath = path.resolve(path.join(this.uploadDir, filename));

      // 检查文件是否存在
      try {
        await fs.promises.access(filePath);
      } catch (error) {
        console.log(`文件不存在: ${filePath}`);
        return false;
      }

      // 删除文件
      await this.unlinkAsync(filePath);
      return true;
    } catch (error) {
      console.error(`删除图片文件失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取完整的图片URL
   */
  getImageUrl(storagePath: string): string {
    // 确保路径使用正斜杠
    const normalizedPath = storagePath.replace(/\\/g, '/');
    // 将路径拼接到服务器URL
    return `${this.serverUrl}/${this.uploadDir}/${normalizedPath}`;
  }
}
