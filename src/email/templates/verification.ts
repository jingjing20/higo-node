import { FRONTEND_URL } from '../email.config';

/**
 * 邮箱验证邮件模板
 * @param token 验证令牌
 * @param nickname 用户昵称（可选）
 * @returns HTML邮件内容
 */
export const verificationEmailTemplate = (
  token: string,
  nickname?: string
): string => {
  const verificationLink = `${FRONTEND_URL}/api/email/verify?token=${token}`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">邮箱验证</h2>
      </div>

      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <p>您好，${nickname || '用户'}！</p>
        <p>感谢您注册HiGo运动平台。请点击下面的按钮验证您的邮箱地址：</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}"
             style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            验证邮箱
          </a>
        </div>

        <p>或者，您可以复制以下链接到浏览器地址栏：</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>

        <p>此链接将在24小时后失效。如果您没有注册HiGo账号，请忽略此邮件。</p>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 12px;">
        <p>此邮件由系统自动发送，请勿回复。</p>
        <p>&copy; ${new Date().getFullYear()} HiGo运动平台. 保留所有权利。</p>
      </div>
    </div>
  `;
};
