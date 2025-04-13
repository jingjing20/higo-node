import { FRONTEND_URL } from '../email.config';

/**
 * 密码重置邮件模板
 * @param token 重置令牌
 * @param nickname 用户昵称（可选）
 * @returns HTML邮件内容
 */
export const passwordResetEmailTemplate = (
  token: string,
  nickname?: string
): string => {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">密码重置</h2>
      </div>

      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <p>您好，${nickname || '用户'}！</p>
        <p>我们收到了您重置密码的请求。请点击下面的按钮设置新密码：</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}"
             style="background-color: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            重置密码
          </a>
        </div>

        <p>或者，您可以复制以下链接到浏览器地址栏：</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>

        <p>此链接将在1小时后失效。如果您没有请求重置密码，请忽略此邮件，您的账户安全无虞。</p>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 12px;">
        <p>此邮件由系统自动发送，请勿回复。</p>
        <p>&copy; ${new Date().getFullYear()} HiGo运动平台. 保留所有权利。</p>
      </div>
    </div>
  `;
};
