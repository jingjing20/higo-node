import nodemailer from 'nodemailer';
import { EMAIL_CONFIG, SENDER } from './email.config';
import { verificationEmailTemplate } from './templates/verification';
import { passwordResetEmailTemplate } from './templates/password-reset';
import { queryAsync } from '../app/database/database.utils';

/**
 * 创建Nodemailer发送器
 */
const transporter = nodemailer.createTransport({
  host: EMAIL_CONFIG.HOST,
  port: EMAIL_CONFIG.PORT,
  secure: EMAIL_CONFIG.SECURE,
  auth: {
    user: EMAIL_CONFIG.AUTH.USER,
    pass: EMAIL_CONFIG.AUTH.PASS
  }
});

/**
 * 发送邮件基础方法
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const info = await transporter.sendMail({
      from: `"${SENDER.NAME}" <${SENDER.EMAIL}>`,
      to,
      subject,
      html
    });

    console.log('邮件发送成功:', info.messageId);
    return { success: true, message: '邮件发送成功' };
  } catch (error) {
    console.error('邮件发送失败:', error);
    return { success: false, message: '邮件发送失败' };
  }
};

/**
 * 发送邮箱验证邮件
 */
export const sendVerificationEmail = async (
  email: string,
  token: string,
  nickname?: string
): Promise<{ success: boolean; message: string }> => {
  const subject = '请验证您的邮箱 - HiGo运动平台';
  const html = verificationEmailTemplate(token, nickname);

  return await sendEmail(email, subject, html);
};

/**
 * 发送密码重置邮件
 */
export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  nickname?: string
): Promise<{ success: boolean; message: string }> => {
  const subject = '密码重置 - HiGo运动平台';
  const html = passwordResetEmailTemplate(token, nickname);

  return await sendEmail(email, subject, html);
};

/**
 * 发送欢迎邮件
 */
export const sendWelcomeEmail = async (
  email: string,
  nickname: string
): Promise<{ success: boolean; message: string }> => {
  const subject = '欢迎加入 HiGo运动平台';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>您好，${nickname || '用户'}！</h2>
      <p>欢迎加入HiGo运动平台。您的账号已经成功激活。</p>
      <p>我们希望您能享受在平台上的运动社交体验！</p>
      <p>如有任何问题，请随时联系我们的客服团队。</p>
      <p>祝您运动愉快！</p>
      <p>HiGo团队</p>
    </div>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * 验证邮箱
 */
export const verifyEmail = async (token: string) => {
  try {
    // 查找验证令牌
    const tokens = await queryAsync(
      `SELECT * FROM verification_tokens WHERE token = ? AND type = ? AND expires_at > NOW()`,
      [token, 'email']
    );

    if (!Array.isArray(tokens) || tokens.length === 0) {
      return { success: false, message: '无效或已过期的验证令牌' };
    }

    const verificationToken = tokens[0];

    // 获取用户信息
    const users = await queryAsync(`SELECT * FROM users WHERE id = ?`, [
      verificationToken.user_id
    ]);

    if (!Array.isArray(users) || users.length === 0) {
      return { success: false, message: '用户不存在' };
    }

    const user = users[0];

    // 更新用户的验证状态
    await queryAsync(`UPDATE users SET is_verified = 1 WHERE id = ?`, [
      verificationToken.user_id
    ]);

    // 删除已使用的验证令牌
    await queryAsync(`DELETE FROM verification_tokens WHERE id = ?`, [
      verificationToken.id
    ]);

    // 发送欢迎邮件
    await sendWelcomeEmail(user.email, user.nickname);

    return { success: true, message: '邮箱验证成功' };
  } catch (error) {
    console.error('验证邮箱失败:', error);
    return { success: false, message: '验证邮箱失败' };
  }
};
