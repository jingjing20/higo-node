/**
 * 验证码邮件模板
 * @param code 验证码
 * @returns HTML邮件内容
 */
export const verificationCodeEmailTemplate = (code: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">邮箱验证码</h2>
      </div>

      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <p>您好！</p>
        <p>您正在进行HiGo运动平台的登录或注册操作，您的验证码是：</p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 15px; background-color: #f0f0f0; border-radius: 4px; display: inline-block;">
            ${code}
          </div>
        </div>

        <p>验证码有效期为5分钟，请勿泄露给他人。</p>
        <p>如果不是您本人操作，请忽略此邮件。</p>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 12px;">
        <p>此邮件由系统自动发送，请勿回复。</p>
        <p>&copy; ${new Date().getFullYear()} HiGo运动平台. 保留所有权利。</p>
      </div>
    </div>
  `;
};
